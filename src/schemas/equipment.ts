import { z } from "zod"
import type { CategoryId } from "@/lib/equipment"

// form inputs are always strings, so the schemas validate the raw string values
// and the dialog does the numeric coercion afterwards

// required free-text / select field
const text = (label: string) => z.string().trim().min(1, `${label} is required`)

// required numeric field entered as a string; must parse to a number > 0
const positiveNumber = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine(
      (v) => Number.isFinite(Number(v)) && Number(v) > 0,
      `${label} must be a positive number`,
    )

// name + brand are required for every equipment type
const base = {
  name: text("Name"),
  brand: text("Brand"),
}

// one schema per equipment category, keyed by CategoryId
// the keys match the form value keys (name, brand + each editable FieldDef.key)
export const equipmentSchemas = {
  telescopes: z.object({
    ...base,
    type: text("Type"),
    aperture: positiveNumber("Aperture"),
    focalLength: positiveNumber("Focal length"),
  }),
  cameras: z.object({
    ...base,
    type: text("Sensor type"),
    pixelSize: positiveNumber("Pixel size"),
    pixelX: positiveNumber("Resolution X"),
    pixelY: positiveNumber("Resolution Y"),
  }),
  mounts: z.object({
    ...base,
  }),
  filters: z.object({
    ...base,
    type: text("Type"),
    size: text("Size"),
  }),
  flatteners: z.object({
    ...base,
    type: text("Type"),
    factor: positiveNumber("Factor"),
  }),
} satisfies Record<CategoryId, z.ZodType>

// validate a form's raw values, returning a map of field key -> first error message
// empty map means the form is valid
export function validateEquipment(
  category: CategoryId,
  values: Record<string, string>,
): Record<string, string> {
  const result = equipmentSchemas[category].safeParse(values)
  if (result.success) return {}

  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const key = issue.path[0]
    // keep only the first error per field
    if (typeof key === "string" && !errors[key]) errors[key] = issue.message
  }
  return errors
}
