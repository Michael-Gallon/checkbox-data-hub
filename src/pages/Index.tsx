import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { EncodingForm } from "@/components/EncodingForm";
import { Button } from "@/components/ui/button";
import { Download, BarChart3, Trash2, Upload } from "lucide-react";
import { FormData } from "@/types/form";
import { generateExcelBlob } from "@/utils/excelExport"; // ✅ keep only this
import { parseCSVToFormData, getExpectedCSVColumns } from "@/utils/csvImport";
import { useToast } from "@/hooks/use-toast";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

import { ExportToExcelModal } from "@/components/ExportToExcelModal"; // ✅ corrected import path

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // ✅ States
  const [submissions, setSubmissions] = useState<FormData[]>([]);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [clearConfirmation, setClearConfirmation] = useState("");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importConfirmation, setImportConfirmation] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Export modal states
  const [showExportModal, setShowExportModal] = useState(false);
  const [excelBlob, setExcelBlob] = useState<Blob | null>(null);

  // ✅ Load saved data
  useEffect(() => {
    const saved = localStorage.getItem("encodedData");
    if (saved) setSubmissions(JSON.parse(saved));
  }, []);

  // ✅ Handle form submission
  const handleSubmit = (data: FormData) => {
    const updatedSubmissions = [...submissions, data];
    setSubmissions(updatedSubmissions);
    localStorage.setItem("encodedData", JSON.stringify(updatedSubmissions));
  };

  // ✅ Handle export to Excel
  const handleExport = () => {
    if (submissions.length === 0) {
      toast({
        title: "No Data",
        description: "There is no data to export",
        variant: "destructive",
      });
      return;
    }

    const blob = generateExcelBlob(submissions);
    setExcelBlob(blob);
    setShowExportModal(true);
  };

  // ✅ Handle report navigation
  const handleGenerateReport = () => {
    if (submissions.length === 0) {
      toast({
        title: "No Data",
        description: "There is no data to generate a report",
        variant: "destructive",
      });
      return;
    }
    navigate("/report");
  };


  // ✅ Handle clear data
  const handleClearData = () => {
    if (clearConfirmation === "Yes") {
      localStorage.removeItem("encodedData");
      localStorage.removeItem("officeOptions");
      setSubmissions([]);
      setShowClearDialog(false);
      setClearConfirmation("");
      toast({
        title: "Success",
        description: "All data has been cleared",
      });
    } else {
      toast({
        title: "Invalid Input",
        description: "Please type 'Yes' to confirm",
        variant: "destructive",
      });
    }
  };

  // ✅ Handle CSV file select
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith(".csv")) {
      setSelectedFile(file);
      setShowImportDialog(true);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file",
        variant: "destructive",
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ✅ Handle import
  const handleImportData = async () => {
    if (importConfirmation !== "Yes") {
      toast({
        title: "Invalid Input",
        description: "Please type 'Yes' to confirm",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFile) return;

    try {
      const text = await selectedFile.text();
      const importedData = parseCSVToFormData(text);

      const mergedData = [...submissions, ...importedData];
      setSubmissions(mergedData);
      localStorage.setItem("encodedData", JSON.stringify(mergedData));

      setShowImportDialog(false);
      setImportConfirmation("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      toast({
        title: "Success",
        description: `Imported ${importedData.length} entries successfully`,
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to parse CSV file",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-[#800000] text-white py-3 shadow-lg flex-shrink-0">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-bold">Checkbox Encode App</h1>
              <p className="text-xs mt-1 opacity-90">Monthly Data Encoding and Analysis</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleGenerateReport} variant="outline" className="gap-2 h-9 text-sm bg-white text-[#800000] hover:bg-white/90">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Generate Report</span>
              </Button>
              <Button onClick={() => setShowClearDialog(true)} variant="outline" className="gap-2 h-9 text-sm bg-white text-[#800000] hover:bg-white/90">
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Clear Data</span>
              </Button>
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="gap-2 h-9 text-sm bg-white text-[#800000] hover:bg-white/90">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Import CSV</span>
              </Button>
              <Button onClick={handleExport} className="gap-2 h-9 text-sm bg-white text-[#800000] hover:bg-white/90">
                <Download className="w-4 h-4" />
                <span className="hidden lg:inline">View / Download Data ({submissions.length})</span>
                <span className="hidden sm:inline lg:hidden">Export ({submissions.length})</span>
                <span className="sm:hidden">Export</span>
              </Button>

              {/* ✅ Export Modal */}
              <ExportToExcelModal
                open={showExportModal}
                onClose={() => setShowExportModal(false)}
                blob={excelBlob}
                data={submissions}  // ✅ pass data for preview
              />

            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-3 flex-1 flex flex-col overflow-hidden">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Clear Data Dialog */}
        <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear All Data</AlertDialogTitle>
              <AlertDialogDescription>
                This action will permanently delete all encoded data and custom office options. 
                Type "Yes" below to confirm.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              placeholder="Type 'Yes' to confirm"
              value={clearConfirmation}
              onChange={(e) => setClearConfirmation(e.target.value)}
              className="my-4"
            />
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setClearConfirmation("")}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearData}>Clear Data</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Import Dialog */}
        <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Import Data from CSV</AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <div>The CSV file should have the following column arrangement:</div>
                <div className="bg-muted p-3 rounded text-xs font-mono break-all">
                  {getExpectedCSVColumns()}
                </div>
                <div className="text-sm">
                  This will merge the imported data with your existing data. Type "Yes" below to confirm.
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              placeholder="Type 'Yes' to confirm"
              value={importConfirmation}
              onChange={(e) => setImportConfirmation(e.target.value)}
              className="my-4"
            />
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setImportConfirmation("");
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleImportData}>Import Data</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="flex-1 overflow-hidden">
          <EncodingForm onSubmit={handleSubmit} />
        </div>
      </main>
    </div>
  );
};

export default Index;
