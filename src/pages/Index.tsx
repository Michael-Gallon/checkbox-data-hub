import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EncodingForm } from "@/components/EncodingForm";
import { Button } from "@/components/ui/button";
import { Download, BarChart3, Trash2 } from "lucide-react";
import { FormData } from "@/types/form";
import { exportToExcel } from "@/utils/excelExport";
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

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<FormData[]>([]);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [clearConfirmation, setClearConfirmation] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("encodedData");
    if (saved) {
      setSubmissions(JSON.parse(saved));
    }
  }, []);

  const handleSubmit = (data: FormData) => {
    const updatedSubmissions = [...submissions, data];
    setSubmissions(updatedSubmissions);
    localStorage.setItem("encodedData", JSON.stringify(updatedSubmissions));
  };

  const handleExport = () => {
    if (submissions.length === 0) {
      toast({
        title: "No Data",
        description: "There is no data to export",
        variant: "destructive",
      });
      return;
    }
    exportToExcel(submissions);
    toast({
      title: "Success",
      description: "Data exported to Excel successfully",
    });
  };

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

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <header className="bg-[#800000] text-white py-3 shadow-lg flex-shrink-0">
        <div className="container mx-auto px-4">
          <h1 className="text-xl font-bold">Checkbox Encode App</h1>
          <p className="text-xs mt-1 opacity-90">Monthly Data Encoding and Analysis</p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-3 flex-1 flex flex-col overflow-hidden">
        <div className="flex justify-end gap-2 mb-3 flex-shrink-0">
          <Button onClick={handleGenerateReport} variant="outline" className="gap-2 h-9 text-sm">
            <BarChart3 className="w-4 h-4" />
            Generate Report
          </Button>
          <Button 
            onClick={() => setShowClearDialog(true)} 
            variant="outline" 
            className="gap-2 h-9 text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Clear Data
          </Button>
          <Button onClick={handleExport} className="gap-2 h-9 text-sm">
            <Download className="w-4 h-4" />
            Export to Excel ({submissions.length} entries)
          </Button>
        </div>

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
        
        <div className="flex-1 overflow-hidden">
          <EncodingForm onSubmit={handleSubmit} />
        </div>
      </main>
    </div>
  );
};

export default Index;
