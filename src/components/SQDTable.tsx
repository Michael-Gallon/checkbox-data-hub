import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface SQDTableProps {
  values: {
    sqd0: string;
    sqd1: string;
    sqd2: string;
    sqd3: string;
    sqd4: string;
    sqd5: string;
    sqd6: string;
    sqd7: string;
    sqd8: string;
  };
  onChange: (field: string, value: string) => void;
}

export const SQDTable = ({ values, onChange }: SQDTableProps) => {
  const columns = ["SD", "D", "ND", "A", "SA", "NA"];
  const rows = ["SQD0", "SQD1", "SQD2", "SQD3", "SQD4", "SQD5", "SQD6", "SQD7", "SQD8"];

  const handleColumnHeaderClick = (column: string) => {
    rows.forEach((row) => {
      onChange(row.toLowerCase(), column);
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border border-border p-1.5 lg:p-2 bg-muted text-left font-semibold text-xs lg:text-sm">Question</th>
            {columns.map((col) => (
              <th
                key={col}
                className="border border-border p-1.5 lg:p-2 bg-muted text-center font-semibold cursor-pointer hover:bg-muted/80 transition-colors text-xs lg:text-sm"
                onClick={() => handleColumnHeaderClick(col)}
                title={`Click to select all ${col}`}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const fieldKey = row.toLowerCase() as keyof typeof values;
            return (
              <tr key={row}>
                <td className="border border-border p-1.5 lg:p-2 font-medium text-xs lg:text-sm">{row}</td>
                {columns.map((col) => (
                  <td 
                    key={col} 
                    className="border border-border p-1.5 lg:p-2 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onChange(fieldKey, col)}
                  >
                    <div className="flex justify-center">
                      <Checkbox
                        checked={values[fieldKey] === col}
                        className="h-4 w-4 pointer-events-none"
                      />
                    </div>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
