'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/custom/modal';
import styles from '@/components/modals/calibrationRowEditor.module.scss';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import React, { ReactNode, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '@/components/ui/label';
import { useModal } from '@/context/modalProvider';
import { EquipmentComboBox } from '@/components/ui/comboBox';
import { invoke } from '@tauri-apps/api/core';
import { AnalyzedCalibrationFrames, BiasFrame, DarkFrame } from '@/interfaces/commands';
import { CalibrationType } from '@/enums/calibrationType';
import { toast } from '@/components/ui/use-toast';
import { AppState, CalibrationFrame } from '@/interfaces/state';
import { EquipmentType } from '@/enums/equipmentType';
import { UUID } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { ToastAction } from '@/components/ui/toast';
import { Preferences } from '@/components/modals/preferences/preferences';
import EquipmentModal from '@/components/modals/equipment/equipment';

interface CalibrationRowEditorProps {
  analyzedFrames?: AnalyzedCalibrationFrames;
  edit: boolean;
  calibrationFrame?: CalibrationFrame;
  paths?: string[];
}

export default function CalibrationRowEditor({
                                               analyzedFrames,
                                               edit,
                                               calibrationFrame,
                                               paths
                                             }: CalibrationRowEditorProps) {
  const { closeModal } = useModal();

  const [calibrationType, setCalibrationType] = useState<CalibrationType>(
    analyzedFrames?.calibration_type || CalibrationType.DARK
  );

  const formSchema = z
    .object({
      camera: z.string().min(1, {
        message: 'You must at least select one calibration frame.'
      }),
      calibrationType: z.enum([CalibrationType.DARK, CalibrationType.BIAS], {
        errorMap: () => ({
          message: 'You must select a valid calibration type (DARK or BIAS).'
        })
      }),
      gain: z.coerce.number().min(1, {
        message: 'Gain must be at least 1.'
      }),
      subLength: z.coerce.number().optional(),
      cameraTemp: z.coerce.number().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.calibrationType === CalibrationType.DARK) {
        if (data.subLength === undefined || data.subLength < 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Sub length must be at least 1 for BIAS calibration type',
            path: ['subLength']
          });
        }
        if (data.cameraTemp === undefined || data.cameraTemp < 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              'Camera temperature must be at least 1 for BIAS calibration type',
            path: ['cameraTemp']
          });
        }
      }
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      calibrationType: calibrationFrame?.calibration_type || calibrationType,
      gain: analyzedFrames?.gain || calibrationFrame?.gain,
      subLength: analyzedFrames?.sub_length || calibrationFrame?.sub_length,
      camera: calibrationFrame?.camera,
      cameraTemp: calibrationFrame?.camera_temp
    }
  });

  function onSubmit() {
    if (!edit) {
      const darkFrame: DarkFrame = {
        id: calibrationFrame?.id || uuidv4() as UUID,
        camera_id: form.getValues().camera as UUID,
        gain: Number(form.getValues().gain),
        frames_to_classify: paths ?? [],
        frames_classified: [],
        in_imaging_session: false,
        camera_temp: Number(form.getValues().cameraTemp) ?? 0,
        sub_length: Number(form.getValues().subLength) ?? 0
      };

      const biasFrame: BiasFrame = {
        id: uuidv4() as UUID,
        camera_id: form.getValues().camera as UUID,
        gain: Number(form.getValues().gain),
        frames_to_classify: paths ?? [],
        frames_classified: []
      };

      if (calibrationType == CalibrationType.DARK) {
        invoke('classify_dark_frame', {
          darkFrame: darkFrame
        })
          .then(() => closeModal())
          .catch((error) =>
            toast({
              variant: 'destructive',
              title: 'Uh oh! Something went wrong.',
              description: 'Error: ' + error
            })
          );
      } else {
        invoke('classify_bias_frame', {
          biasFrame: biasFrame
        })
          .then(() => closeModal())
          .catch((error) =>
          toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: 'Error: ' + error
          })
        );
      }
    }
  }

  return (
    <Modal title="Add Calibration Frames" className={styles.modal}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.row}>
            <Label className={styles.label}>Camera</Label>
            <FormField
              control={form.control}
              name="camera"
              render={({ field }) => (
                <FormItem className={styles.item}>
                  <FormControl>
                    <EquipmentComboBox
                      type={EquipmentType.CAMERA}
                      value={field.value as UUID}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className={styles.row}>
            <Label className={styles.label}>Calibration Type</Label>
            <FormField
              control={form.control}
              name="calibrationType"
              render={({ field }) => (
                <FormItem className={styles.item}>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        setCalibrationType(
                          CalibrationType[
                            value as keyof typeof CalibrationType
                            ]
                        );
                        field.onChange(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select calibration type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DARK">DARK</SelectItem>
                        <SelectItem value="BIAS">BIAS</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className={styles.row}>
            <Label className={styles.label}>ISO/Gain</Label>
            <FormField
              control={form.control}
              name="gain"
              render={({ field }) => (
                <FormItem className={styles.item}>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {calibrationType === CalibrationType.DARK && (
            <>
              <div className={styles.row}>
                <Label className={styles.label}>Sub Length</Label>
                <FormField
                  control={form.control}
                  name="subLength"
                  render={({ field }) => (
                    <FormItem className={styles.item}>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className={styles.row}>
                <Label className={styles.label}>Camera Temp.</Label>
                <FormField
                  control={form.control}
                  name="cameraTemp"
                  render={({ field }) => (
                    <FormItem className={styles.item}>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </>
          )}
          <div className={styles.buttons}>
            <Button
              className={styles.nextButton}
              type="button"
              variant="secondary"
              onClick={() => closeModal()}
            >
              Cancel
            </Button>
            <Button className={styles.nextButton} type="submit">
              Save
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
}

export function newCalibrationFrameSession({ open, appState, openModal }: { open: () => void, appState: AppState, openModal: (content: ReactNode) => void }) {
  if (appState.config.folder_paths.calibration_base_folder === "" || appState.config.folder_paths.dark_frame_pattern === "" || appState.config.folder_paths.bias_frame_pattern === "") {
    toast({
      variant: 'destructive',
      title: 'Uh oh! Something went wrong.',
      description: 'You have to set a folder path for your calibration frames!',
      action: <ToastAction altText="Configure" onClick={() => openModal(<Preferences defaultValue="calibration_frames" />)}>Configure</ToastAction>,
    });

    return;
  }

  if (appState.equipment_list.cameras.size === 0) {
    toast({
      variant: 'destructive',
      title: 'Uh oh! Something went wrong.',
      description: 'You have to add at least one camera to your equipment list!',
      action: <ToastAction altText="Configure" onClick={() => openModal(<EquipmentModal type={EquipmentType.CAMERA} />)}>Add</ToastAction>,
    });

    return;
  }

  open()
}

