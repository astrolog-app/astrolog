import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UnitSystem } from '@/enums/unitSystem';
import { Label } from '@/components/ui/label';
import { cn } from '@/utils/classNames';

interface UnitToggleProps {
  /** Controlled value (works great with react-hook-form's Controller) */
  value?: UnitSystem;
  /** Called whenever the selection changes */
  onChange?: (value: UnitSystem) => void;
  /** Optional: pass className for layout control */
  className?: string;
}

export default function UnitToggle({ value, onChange, className }: UnitToggleProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(val) => onChange?.(val as UnitSystem)}
      className={cn("flex flex-col space-y-2", className)}
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value={UnitSystem.METRIC} id="unit-metric" />
        <Label htmlFor="unit-metric">Metric (m, kg, °C)</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value={UnitSystem.IMPERIAL} id="unit-imperial" />
        <Label htmlFor="unit-imperial">Imperial (in, lb, °F)</Label>
      </div>
    </RadioGroup>
  );
}