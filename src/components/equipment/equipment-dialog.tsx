"use client"

import type React from "react"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import type { CategoryDef, EquipmentItem } from "@/lib/equipment"
import { validateEquipment } from "@/schemas/equipment"
import { UUID } from 'crypto'

interface EquipmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: CategoryDef
  /** item being edited, or null when adding */
  item: EquipmentItem | null
  /** persists the item, may reject on a backend error */
  onSave: (item: EquipmentItem) => Promise<void>
}

export function EquipmentDialog({
  open,
  onOpenChange,
  category,
  item,
  onSave,
}: EquipmentDialogProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // per-field validation errors keyed by field key (name, brand, …)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // computed/display-only fields are not editable boxes in the dialog
  const editableFields = category.fields.filter((f) => !f.display)

  useEffect(() => {
    if (!open) return
    setError(null)
    setFieldErrors({})
    const next: Record<string, string> = {
      name: item?.name?.toString() ?? "",
      brand: item?.brand?.toString() ?? "",
    }
    for (const f of editableFields) {
      next[f.key] = item?.[f.key]?.toString() ?? ""
    }
    setValues(next)
  }, [open, item, category])

  const setValue = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    // clear a field's error as soon as the user edits it
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // validate against the category schema before doing anything else
    const errors = validateEquipment(category.id, values)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})

    const result: EquipmentItem = {
      id: item?.id ?? (crypto.randomUUID() as UUID),
      category: category.id,
      name: values.name.trim(),
      brand: values.brand.trim(),
    }
    for (const f of editableFields) {
      const raw = values[f.key]?.trim() ?? ""
      result[f.key] = f.type === "number" && raw !== "" ? Number(raw) : raw
    }

    setSaving(true)
    setError(null)
    try {
      // only close on success — keep the dialog open and show the error otherwise
      await onSave(result)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  const isEditing = Boolean(item)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit" : "Add"} {category.noun}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? `Update the details for this ${category.noun.toLowerCase()}.`
                : `Add a new ${category.noun.toLowerCase()} to your equipment.`}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                aria-invalid={Boolean(fieldErrors.name)}
                value={values.name ?? ""}
                onChange={(e) => setValue("name", e.target.value)}
                placeholder={`e.g. ${category.noun} model`}
              />
              {fieldErrors.name ? (
                <p className="text-sm text-destructive">{fieldErrors.name}</p>
              ) : null}
            </Field>
            <Field>
              <FieldLabel htmlFor="brand">Brand</FieldLabel>
              <Input
                id="brand"
                aria-invalid={Boolean(fieldErrors.brand)}
                value={values.brand ?? ""}
                onChange={(e) => setValue("brand", e.target.value)}
                placeholder="Manufacturer"
              />
              {fieldErrors.brand ? (
                <p className="text-sm text-destructive">{fieldErrors.brand}</p>
              ) : null}
            </Field>

            {editableFields.map((f) => (
              <Field key={f.key}>
                <FieldLabel htmlFor={f.key}>
                  {f.label}
                  {f.unit ? ` (${f.unit})` : ""}
                </FieldLabel>
                {f.type === "select" ? (
                  <Select
                    value={values[f.key] || undefined}
                    onValueChange={(v) => setValue(f.key, v)}
                  >
                    <SelectTrigger id={f.key} aria-invalid={Boolean(fieldErrors[f.key])}>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {f.options?.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={f.key}
                    type={f.type === "number" ? "number" : "text"}
                    step="any"
                    aria-invalid={Boolean(fieldErrors[f.key])}
                    value={values[f.key] ?? ""}
                    onChange={(e) => setValue(f.key, e.target.value)}
                    placeholder={f.placeholder}
                  />
                )}
                {fieldErrors[f.key] ? (
                  <p className="text-sm text-destructive">{fieldErrors[f.key]}</p>
                ) : null}
              </Field>
            ))}
          </FieldGroup>

          {error ? (
            <p role="alert" className="pb-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" disabled={saving} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : isEditing ? "Save changes" : `Add ${category.noun}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
