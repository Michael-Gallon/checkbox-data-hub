import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EncodingForm } from "@/components/EncodingForm";
import { Button } from "@/components/ui/button";
import { Download, BarChart3 } from "lucide-react";
import { FormData } from "@/types/form";
import { exportToExcel } from "@/utils/excelExport";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<FormData[]>([]);

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-[#800000] text-white py-3 lg:py-4 shadow-lg flex-shrink-0">
        <div className="container mx-auto px-4">
          <h1 className="text-xl lg:text-2xl font-bold">Checkbox Encode App</h1>
          <p className="text-xs lg:text-sm mt-1 opacity-90">Monthly Data Encoding and Analysis</p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-2 lg:py-4 flex-1 flex flex-col overflow-hidden">
        <div className="flex justify-end gap-2 mb-2 lg:mb-4 flex-shrink-0">
          <Button onClick={handleGenerateReport} variant="outline" className="gap-2 h-8 lg:h-10 text-sm">
            <BarChart3 className="w-4 h-4" />
            Generate Report
          </Button>
          <Button onClick={handleExport} className="gap-2 h-8 lg:h-10 text-sm">
            <Download className="w-4 h-4" />
            Export to Excel ({submissions.length} entries)
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto lg:overflow-hidden">
          <EncodingForm onSubmit={handleSubmit} />
        </div>
      </main>
    </div>
  );
};

export default Index;
