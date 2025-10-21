import { useState, useEffect } from "react";
import { EncodingForm } from "@/components/EncodingForm";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { FormData } from "@/types/form";
import { exportToExcel } from "@/utils/excelExport";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
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

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-[#800000] text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Checkbox Encode App</h1>
          <p className="text-sm mt-1 opacity-90">Monthly Data Encoding and Analysis</p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-6">
          <Button onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Export to Excel ({submissions.length} entries)
          </Button>
        </div>
        
        <EncodingForm onSubmit={handleSubmit} />
      </main>
    </div>
  );
};

export default Index;
