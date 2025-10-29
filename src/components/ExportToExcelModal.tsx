import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { FormData } from "@/types/form";
import { useEffect } from "react";

type ExportToExcelModalProps = {
  open: boolean;
  onClose: () => void;
  blob: Blob | null;
  data?: FormData[]; // ✅ new: add data for preview
};

export const ExportToExcelModal: React.FC<ExportToExcelModalProps> = ({
  open,
  onClose,
  blob,
  data = [],
}) => {
  const downloadUrl = blob ? URL.createObjectURL(blob) : "";
  const fileName = `encoded-data-${new Date().toISOString().split("T")[0]}.xlsx`;

  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-5xl max-h-[80vh] overflow-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Export Preview</AlertDialogTitle>
          <AlertDialogDescription>
            Below is a preview of your encoded data. Click “Download CSV” to save it.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* ✅ Table Preview */}
        {data.length > 0 ? (
          <div className="overflow-auto border rounded-md my-4 max-h-[50vh]">
            <table className="min-w-full text-sm border-collapse">
              {/* ✅ Table Header and Editable Body with Aligned Columns */}
{(() => {
  const columns: (keyof FormData)[] = [
    "timestamp",
    "campus",
    "ageGroup",
    "sex",
    "office",
    "services",
    "clientType",
    "cc1",
    "cc2",
    "cc3",
    "sqd0",
    "sqd1",
    "sqd2",
    "sqd3",
    "sqd4",
    "sqd5",
    "sqd6",
    "sqd7",
    "sqd8",
    "comments",
    "documentNumber",
  ];

  const columnLabels: Record<string, string> = {
    timestamp: "Date/Time",
    campus: "Campus",
    ageGroup: "Age Group",
    sex: "Sex",
    office: "Office",
    services: "Services",
    clientType: "Client Type",
    cc1: "CC1",
    cc2: "CC2",
    cc3: "CC3",
    sqd0: "SQD0",
    sqd1: "SQD1",
    sqd2: "SQD2",
    sqd3: "SQD3",
    sqd4: "SQD4",
    sqd5: "SQD5",
    sqd6: "SQD6",
    sqd7: "SQD7",
    sqd8: "SQD8",
    comments: "Comments/Suggestions",
    documentNumber: "Document Number",
  };

  return (
    <>
      <thead className="bg-gray-100 sticky top-0 z-10">
        <tr>
          {columns.map((key) => (
            <th key={key} className="p-2 border text-left font-medium">
              {columnLabels[key]}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((entry, rowIndex) => (
          <tr key={rowIndex} className="odd:bg-white even:bg-gray-50">
            {columns.map((key) => (
              <td
                key={key}
                className="p-2 border cursor-text hover:bg-gray-100"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                  const newValue = e.currentTarget.textContent || "";
                  data[rowIndex] = {
                    ...data[rowIndex],
                    [key]:
                      key === "timestamp"
                        ? new Date(newValue).toISOString()
                        : newValue,
                  };
                }}
              >
                {key === "timestamp"
                  ? new Date(entry.timestamp).toLocaleString()
                  : String(entry[key] ?? "")}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </>
  );
})()}

            </table>
          </div>
        ) : (
          <p className="text-center text-sm text-gray-500 my-4">No data to preview.</p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
          {blob && (
            <a href={downloadUrl} download={fileName} rel="noopener noreferrer">
              <Button>Download Excel</Button>
            </a>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
