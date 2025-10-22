import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface MultiCheckboxGroupProps {
  label: string;
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
}

export const MultiCheckboxGroup = ({ label, options, values, onChange }: MultiCheckboxGroupProps) => {
  const handleCheckboxChange = (option: string, checked: boolean) => {
    if (checked) {
      onChange([...values, option]);
    } else {
      onChange(values.filter((v) => v !== option));
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs lg:text-sm font-semibold text-foreground">{label}</Label>
      <div className="flex gap-2 lg:gap-3 flex-wrap">
        {options.map((option) => (
          <div key={option} className="flex items-center space-x-1.5">
            <Checkbox
              id={`${label}-${option}`}
              checked={values.includes(option)}
              onCheckedChange={(checked) => handleCheckboxChange(option, checked as boolean)}
              className="h-4 w-4"
            />
            <label
              htmlFor={`${label}-${option}`}
              className="text-xs lg:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {option}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};
