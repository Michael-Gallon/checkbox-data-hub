import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface CheckboxGroupProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  allowColumnClick?: boolean;
}

export const CheckboxGroup = ({ label, options, value, onChange, allowColumnClick }: CheckboxGroupProps) => {
  const handleCheckboxChange = (option: string) => {
    onChange(option);
  };

  const handleColumnHeaderClick = (option: string) => {
    if (allowColumnClick && option !== "NA") {
      onChange(option);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-foreground">{label}</Label>
      <div className="flex gap-4 flex-wrap">
        {options.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <Checkbox
              id={`${label}-${option}`}
              checked={value === option}
              onCheckedChange={() => handleCheckboxChange(option)}
            />
            <label
              htmlFor={`${label}-${option}`}
              className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                allowColumnClick && option !== "NA" ? "cursor-pointer hover:text-primary" : ""
              }`}
              onClick={() => allowColumnClick && handleColumnHeaderClick(option)}
            >
              {option}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};
