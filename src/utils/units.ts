export type LengthUnit = "mm" | "m" | "in" | "ft";
export type TempUnit = "°C" | "°F";

// --- Length ---
export function mTo(unit: LengthUnit, meters: number): number {
  switch (unit) {
    case "mm": return meters * 1000;
    case "m":  return meters;
    case "in": return meters / 0.0254;
    case "ft": return meters / 0.3048;
  }
}
export function toM(unit: LengthUnit, value: number): number {
  switch (unit) {
    case "mm": return value / 1000;
    case "m":  return value;
    case "in": return value * 0.0254;
    case "ft": return value * 0.3048;
  }
}

// --- Temperature ---
export function cTo(unit: TempUnit, c: number): number {
  return unit === "°C" ? c : (c * 9) / 5 + 32;
}
export function toC(unit: TempUnit, val: number): number {
  return unit === "°C" ? val : ((val - 32) * 5) / 9;
}

export function fmtLengthValue(
  meters: number | undefined,
  displayUnit: LengthUnit,
  opts: Intl.NumberFormatOptions = { maximumFractionDigits: 2 }
): string {
  if (meters == null) return "—";
  const v = mTo(displayUnit, meters);
  return new Intl.NumberFormat(undefined, opts).format(v);
}
export function fmtTempValue(
  celsius: number | undefined,
  displayUnit: TempUnit,
  opts: Intl.NumberFormatOptions = { maximumFractionDigits: 1 }
): string {
  if (celsius == null) return "—";
  const v = cTo(displayUnit, celsius);
  return new Intl.NumberFormat(undefined, opts).format(v);
}
