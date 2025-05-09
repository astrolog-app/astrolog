'use client';

import React, { useState, useRef, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Breadcrumb, BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { useAppState } from '@/context/stateProvider';
import { invoke } from '@tauri-apps/api/core';
import { toast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const PREDEFINED_TOKENS_IS: Token[] = [
  { value: "$$DATE$$", description: "The Date of the Imaging Session" },
  { value: "$$TARGET$$", description: "The Target Name" },
  { value: "$$SITE$$", description: "The Observation Site" },
  { value: "$$CAMERA$$", description: "The Filter Used" },
  { value: "$$TELESCOPE$$", description: "The Telescope Used" },
  { value: "$$FILTER$$", description: "The Filter Used" },
  { value: "$$FILTERTYPE$$", description: "The Filter Used" },
  { value: "$$SUBLENGTH$$", description: "The Filter Used" },
  { value: "$$TOTALSUBS$$", description: "The Exposure Time" },
  { value: "$$GAIN$$", description: "The Camera Used" },
]

const DEFAULT_TOKEN_VALUES = {
  $$DATE$$: "2024-03-02",
  $$TARGET$$: "M31",
  $$SITE$$: "Backyard",
  $$CAMERA$$: "ZWO2600MC Pro",
  $$TELESCOPE$$: "Sky-Watcher Esprit 100",
  $$FILTER$$: "Filter xy",
  $$FILTERTYPE$$: "Ha",
  $$SUBLENGTH$$: "300",
  $$TOTALSUBS$$: "34",
  $$GAIN$$: "100",
}

const PREDEFINED_TOKENS_CAL: Token[] = [
  { value: "$$SUBLENGTH$$", description: "The Exposure Time" },
  { value: "$$CAMERA$$", description: "The Camera Used" },
]

export enum FolderPathBuilderType {
  IMAGING_SESSION = 0,
  CALIBRATION = 1,
}

export enum CalibrationFrameType {
  DARK_FRAME = "Dark Frame",
  BIAS_FRAME = "Bias Frame",
}

interface Token {
  value: string
  description: string
}

export function FolderPathBuilder({ type }: { type: FolderPathBuilderType }) {
  const { appState, setAppState } = useAppState()

  const [errors, setErrors] = useState<string[]>([])
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([])
  const [calibrationFrameType, setCalibrationFrameType] = useState<CalibrationFrameType>(
    CalibrationFrameType.DARK_FRAME,
  )
  const folderPathInputRef = useRef<HTMLInputElement>(null)

  const rootDirectory = appState.local_config.root_directory.replace(/\\/g, "/").replace(/\/+$/, "")
  const parts = rootDirectory.split("/").filter(Boolean)
  const lastFolder = parts[parts.length - 1]

  const CONFIG: Record<
    FolderPathBuilderType,
    {
      defaultBaseFolder: string
      defaultFolderPath: string
      requiredTokens: string[]
      tokens: Token[]
      defaultTokenValues: Record<string, string>
      baseFolderPlaceholder: string
      folderPathPlaceholder: string
    }
  > = {
    [FolderPathBuilderType.IMAGING_SESSION]: {
      defaultBaseFolder: appState.config.folder_paths.imaging_session_base_folder,
      defaultFolderPath: appState.config.folder_paths.imaging_session_pattern,
      requiredTokens: ["$$DATE$$", "$$TARGET$$"],
      tokens: PREDEFINED_TOKENS_IS,
      defaultTokenValues: DEFAULT_TOKEN_VALUES,
      baseFolderPlaceholder: "Data",
      folderPathPlaceholder: "$$TARGET$$_$$TELESCOPE$$/$$DATE$$",
    },
    [FolderPathBuilderType.CALIBRATION]: {
      defaultBaseFolder: appState.config.folder_paths.calibration_base_folder,
      defaultFolderPath:
        calibrationFrameType === CalibrationFrameType.DARK_FRAME
          ? appState.config.folder_paths.dark_frame_pattern
          : appState.config.folder_paths.bias_frame_pattern,
      requiredTokens:
        calibrationFrameType === CalibrationFrameType.DARK_FRAME
          ? ["$$CAMERA$$"]
          : ["$$CAMERA$$"],
      tokens: PREDEFINED_TOKENS_CAL,
      defaultTokenValues: DEFAULT_TOKEN_VALUES,
      baseFolderPlaceholder: "Calibration",
      folderPathPlaceholder: "$$CAMERA$$/$$EXPOSURE$$",
    },
  }

  const {
    defaultBaseFolder,
    defaultFolderPath,
    requiredTokens,
    tokens,
    defaultTokenValues,
    baseFolderPlaceholder,
    folderPathPlaceholder,
  } = CONFIG[type]

  const formSchema = z.object({
    baseFolder: z
      .string()
      .min(1, { message: "Base folder is required" })
      .refine((value) => value.trim().length > 0, { message: "Base folder cannot be empty or whitespace" })
      .refine((value) => !/[/\\]/.test(value), { message: "Base folder cannot contain separators" })
      .refine((value) => !/[<>:"|?*]/.test(value.replace(/\$\$[A-Z_]+\$\$/g, "")), {
        message: 'Path contains invalid characters: < > : " | ? *',
      }),
    folderPath: z
      .string()
      .min(1, { message: "Folder path is required" })
      .refine(
        (value) => {
          const trimmed = value.trim()
          return (
            !trimmed.startsWith("/") && !trimmed.startsWith("\\") && !trimmed.endsWith("/") && !trimmed.endsWith("\\")
          )
        },
        {
          message: "Path cannot start or end with '/' or '\\'",
        },
      )
      .refine((value) => requiredTokens.every((token) => value.includes(token)), {
        message: `Path must include ${requiredTokens.join(", ")}`,
      })
      .refine((value) => !/[<>:"|?*]/.test(value.replace(/\$\$[A-Z_]+\$\$/g, "")), {
        message: 'Path contains invalid characters: < > : " | ? *',
      })
      .refine((value) => !/[/\\]{2,}/.test(value), {
        message: "Path cannot contain consecutive slashes or backslashes",
      }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      baseFolder: defaultBaseFolder,
      folderPath: defaultFolderPath,
    },
  })

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name === "folderPath" || name === "baseFolder") {
        validatePath(value.baseFolder || "", value.folderPath || "")
        updateBreadcrumbs(value.baseFolder || "", value.folderPath || "")
      }
    })
    return () => subscription.unsubscribe()
  }, [form.watch, calibrationFrameType])

  useEffect(() => {
    if (defaultBaseFolder || defaultFolderPath) {
      updateBreadcrumbs(defaultBaseFolder, defaultFolderPath)
    }
  }, [defaultBaseFolder, defaultFolderPath])

  useEffect(() => {
    if (type === FolderPathBuilderType.CALIBRATION) {
      const newDefaultFolderPath =
        calibrationFrameType === CalibrationFrameType.DARK_FRAME
          ? appState.config.folder_paths.dark_frame_pattern
          : appState.config.folder_paths.bias_frame_pattern
      form.setValue("folderPath", newDefaultFolderPath)
      updateBreadcrumbs(form.getValues().baseFolder, newDefaultFolderPath)
    }
  }, [calibrationFrameType, type])

  const validatePath = (baseFolder: string, folderPath: string) => {
    const newErrors: string[] = []
    const trimmedBaseFolder = baseFolder.trim()
    const trimmedFolderPath = folderPath.trim()

    if (trimmedBaseFolder === "") {
      newErrors.push("Base folder has to be set and cannot be empty or whitespace")
    }

    if (trimmedFolderPath === "") {
      newErrors.push("Folder path has to be set and cannot be empty or whitespace")
    }

    if (trimmedBaseFolder.includes("/") || trimmedBaseFolder.includes("\\")) {
      newErrors.push("Base folder cannot contain separators")
    }

    if (/[<>:"|?*]/.test(trimmedBaseFolder)) {
      newErrors.push('Base folder contains invalid characters: < > : " | ? *')
    }

    if (
      trimmedFolderPath.startsWith("/") ||
      trimmedFolderPath.startsWith("\\") ||
      trimmedFolderPath.endsWith("/") ||
      trimmedFolderPath.endsWith("\\")
    ) {
      newErrors.push("Path cannot start or end with '/' or '\\'")
    }

    requiredTokens.forEach((token) => {
      if (!trimmedFolderPath.includes(token)) {
        newErrors.push(`Path must include ${token}`)
      }
    })

    if (/[<>:"|?*]/.test(trimmedFolderPath.replace(/\$\$[A-Z_]+\$\$/g, ""))) {
      newErrors.push('Path contains invalid characters: < > : " | ? *')
    }

    if (/[/\\]{2,}/.test(trimmedFolderPath)) {
      newErrors.push("Path cannot contain consecutive slashes or backslashes")
    }

    setErrors(newErrors)
  }

  const updateBreadcrumbs = (baseFolder: string, folderPath: string) => {
    const segments = [
      lastFolder,
      baseFolder,
      ...(type === FolderPathBuilderType.CALIBRATION ? calibrationFrameType === CalibrationFrameType.DARK_FRAME ? ["Dark"] : ["Bias"] : []),
      ...folderPath.split(/[/\\]/).filter(Boolean),
      ...(type === FolderPathBuilderType.IMAGING_SESSION ? ["Light"] : []),
      "image.fits"
    ];
    const replacedSegments = segments.map((segment) => {
      return segment.replace(/\$\$[A-Z_]+\$\$/g, (match) => {
        return defaultTokenValues[match] || match
      })
    })
    setBreadcrumbs(replacedSegments)
  }

  const insertToken = (token: string) => {
    if (folderPathInputRef.current) {
      const input = folderPathInputRef.current
      const start = input.selectionStart || 0
      const end = input.selectionEnd || 0

      const currentValue = form.getValues("folderPath")
      const newValue = currentValue.substring(0, start) + token + currentValue.substring(end)
      form.setValue("folderPath", newValue, { shouldValidate: true })

      setTimeout(() => {
        input.focus()
        input.setSelectionRange(start + token.length, start + token.length)
      }, 0)
    } else {
      const currentValue = form.getValues("folderPath")
      form.setValue("folderPath", currentValue + token, { shouldValidate: true })
    }
  }

  function handleSubmit() {
    form.setValue("folderPath", form.getValues().folderPath.trim().replace(/\//g, "\\"))

    const base_folder = form.getValues().baseFolder.trim()
    const pattern = form.getValues().folderPath.trim()

    if (type === FolderPathBuilderType.IMAGING_SESSION) {
      invoke("change_imaging_session_folder_path", { baseFolder: base_folder, pattern: pattern })
        .then(() => {
          setAppState((prevState) => ({
            ...prevState,
            config: {
              ...prevState.config,
              folder_paths: {
                ...prevState.config.folder_paths,
                imaging_session_base_folder: base_folder,
                imaging_session_pattern: pattern,
              },
            },
          }))
        })
        .catch((error) => {
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "Error: " + error,
          })
        })
    } else if (type === FolderPathBuilderType.CALIBRATION) {
      const functionName =
        calibrationFrameType === CalibrationFrameType.DARK_FRAME
          ? "change_dark_frames_folder_path"
          : "change_bias_frames_folder_path"

      invoke(functionName, { baseFolder: base_folder, pattern: pattern })
        .then(() => {
          setAppState((prevState) => ({
            ...prevState,
            config: {
              ...prevState.config,
              folder_paths: {
                ...prevState.config.folder_paths,
                calibration_base_folder: base_folder,
                [calibrationFrameType === CalibrationFrameType.DARK_FRAME
                  ? "dark_frame_pattern"
                  : "bias_frame_pattern"]: pattern,
              },
            },
          }))
        })
        .catch((error) => {
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "Error: " + error,
          })
        })
    }
  }

  const isDefaultValue =
    form.watch("baseFolder") === defaultBaseFolder && form.watch("folderPath") === defaultFolderPath

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {type === FolderPathBuilderType.CALIBRATION && (
          <div className="mb-4">
            <Label htmlFor="calibration-type">Calibration Type</Label>
            <Select
              value={calibrationFrameType}
              onValueChange={(value) => setCalibrationFrameType(value as CalibrationFrameType)}
            >
              <SelectTrigger className="mt-2" id="calibration-type">
                <SelectValue placeholder="Select calibration type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CalibrationFrameType.DARK_FRAME}>Dark Frames</SelectItem>
                <SelectItem value={CalibrationFrameType.BIAS_FRAME}>Bias Frames</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <FormField
          control={form.control}
          name="baseFolder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Base Folder</FormLabel>
              <FormControl>
                <Input placeholder={"e.g., " + baseFolderPlaceholder} {...field} />
              </FormControl>
              <FormDescription>Enter the base folder name. No separators allowed.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="folderPath"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Folder Path</FormLabel>
              <FormControl>
                <Input placeholder={"e.g., " + folderPathPlaceholder} {...field} ref={folderPathInputRef} />
              </FormControl>
              <FormDescription>
                Define the folder structure using tokens from the table below or by entering a custom string.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Validation Error</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 mt-2">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {errors.length === 0 && form.formState.isDirty && !isDefaultValue && (
          <Alert className="border-green-500 text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Valid Path</AlertTitle>
            <AlertDescription>Your folder path is valid and contains all required tokens.</AlertDescription>
          </Alert>
        )}

        {breadcrumbs.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Folder Structure Preview</h3>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbEllipsis />
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                {breadcrumbs.map((crumb, index) => {
                  const isToken = crumb.startsWith("$$") && crumb.endsWith("$$")
                  const isLast = index === breadcrumbs.length - 1
                  return (
                    <React.Fragment key={index}>
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage>
                            {isToken ? <span title={crumb}>{defaultTokenValues[crumb] || crumb}</span> : crumb}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href="#">
                            {isToken ? <span title={crumb}>{defaultTokenValues[crumb] || crumb}</span> : crumb}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {!isLast && (
                        <BreadcrumbSeparator>
                          <ChevronRight className="h-4 w-4" />
                        </BreadcrumbSeparator>
                      )}
                    </React.Fragment>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        )}

        <div>
          <h3 className="text-lg font-medium mb-2">Available Tokens</h3>
          <p className="text-sm text-muted-foreground mb-2">Click on any token to insert it in the folder path.</p>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokens.map((token) => (
                  <TableRow
                    key={token.value}
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => insertToken(token.value)}
                  >
                    <TableCell className="font-mono">{token.value}</TableCell>
                    <TableCell>{token.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <Button
          type="submit"
          className="ml-auto"
          disabled={!form.formState.isValid || errors.length > 0 || isDefaultValue}
        >
          Save Path Configuration
        </Button>
      </form>
    </Form>
  )
}
