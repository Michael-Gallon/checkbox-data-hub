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

type ExportToExcelModalProps = {
  open: boolean;
  onClose: () => void;
  blob: Blob | null;
};

export const ExportToExcelModal: React.FC<ExportToExcelModalProps> = ({
  open,
  onClose,
  blob,
}) => {
  const downloadUrl = blob ? URL.createObjectURL(blob) : "";
  const fileName = `encoded-data-${new Date().toISOString().split("T")[0]}.xlsx`;

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Export Preview</AlertDialogTitle>
          <AlertDialogDescription>
            Your Excel file is ready. Click below to download it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
          {blob && (
            <a href={downloadUrl} download={fileName}>
              <Button>Download CSV</Button>
            </a>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
