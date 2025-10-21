import { Checkbox } from "@/components/ui/checkbox";

interface CCTableProps {
  values: {
    cc1: string;
    cc2: string;
    cc3: string;
  };
  onChange: (field: string, value: string) => void;
}

export const CCTable = ({ values, onChange }: CCTableProps) => {
  const columns = ["1", "2", "3", "4", "5", "NA"];
  const rows = ["CC1", "CC2", "CC3"];

  const handleColumnHeaderClick = (column: string) => {
    rows.forEach((row) => {
      onChange(row.toLowerCase(), column);
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border border-border p-3 bg-muted text-left font-semibold">Question</th>
            {columns.map((col) => (
              <th
                key={col}
                className="border border-border p-3 bg-muted text-center font-semibold cursor-pointer hover:bg-muted/80 transition-colors"
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
                <td className="border border-border p-3 font-medium">{row}</td>
                {columns.map((col) => (
                  <td key={col} className="border border-border p-3 text-center">
                    <div className="flex justify-center">
                      <Checkbox
                        checked={values[fieldKey] === col}
                        onCheckedChange={() => onChange(fieldKey, col)}
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
