'use client';

import { UnitSystem } from "@/enums/unitSystem";
import { cTo, fmtLengthValue, fmtTempValue, LengthUnit, mTo, TempUnit, toC, toM } from '@/utils/units';
import { useAppState } from '@/context/stateProvider';
import { useMemo } from 'react';
import { Input } from '@/components/ui/input';

export type DualUnit<T> = { metric: T; imperial: T };

export function useUnit<T>(cfg: DualUnit<T>): T {
  const { appState } = useAppState();
  return appState.local_config.unit === UnitSystem.METRIC ? cfg.metric : cfg.imperial;
}

export function LengthCell({
                             meters,
                             columnUnits, // e.g. { metric: "mm", imperial: "in" }
                           }: {
  meters: number | undefined;
  columnUnits: DualUnit<LengthUnit>;
}) {
  const u = useUnit(columnUnits);
  return <span>{fmtLengthValue(meters, u)}</span>;
}

export function TempCell({
                           celsius,
                           columnUnits, // e.g. { metric: "°C", imperial: "°F" }
                         }: {
  celsius: number | undefined;
  columnUnits: DualUnit<TempUnit>;
}) {
  const u = useUnit(columnUnits);
  return <span>{fmtTempValue(celsius, u)}</span>;
}

type UnitsInputProps =
  | {
  kind: "length";
  metricValue: number | undefined; // always stored in meters
  onMetricChange: (v: number | undefined) => void;
  columnUnits: DualUnit<LengthUnit>;
  decimals?: number;
  step?: number;
  min?: number;
  max?: number;
}
  | {
  kind: "temp";
  metricValue: number | undefined; // always stored in °C
  onMetricChange: (v: number | undefined) => void;
  columnUnits: DualUnit<TempUnit>;
  decimals?: number;
  step?: number;
  min?: number;
  max?: number;
};

export function UnitsInput(p: UnitsInputProps) {
  // pick the display unit based on appState
  const displayUnit = useUnit(p.columnUnits);

  // derive display value from metric value
  const displayValue = useMemo(() => {
    if (p.metricValue == null) return "";
    const v =
      p.kind === "length"
        ? mTo(displayUnit as LengthUnit, p.metricValue)
        : cTo(displayUnit as TempUnit, p.metricValue);
    const d = p.decimals ?? (p.kind === "length" ? 3 : 1);
    return String(+v.toFixed(d));
  }, [p.metricValue, p.kind, displayUnit, p.decimals]);

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        value={displayValue}
        step={p.step ?? (p.kind === "length" ? 0.1 : 0.5)}
        min={p.min}
        max={p.max}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") return p.onMetricChange(undefined);
          const uiNum = Number(raw);
          if (!Number.isFinite(uiNum)) return;

          const metric =
            p.kind === "length"
              ? toM(displayUnit as LengthUnit, uiNum)
              : toC(displayUnit as TempUnit, uiNum);

          p.onMetricChange(+metric.toFixed(6));
        }}
        className="input"
      />
      <span className="text-muted-foreground">{displayUnit}</span>
    </div>
  );
}
