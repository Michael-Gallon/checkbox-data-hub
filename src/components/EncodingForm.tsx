import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MultiCheckboxGroup } from "./MultiCheckboxGroup";
import { CheckboxGroup } from "./CheckboxGroup";
import { SQDTable } from "./SQDTable";
import { CCTable } from "./CCTable";
import { useToast } from "@/hooks/use-toast";
import { FormData } from "@/types/form";
import { Settings, X, Plus } from "lucide-react";

interface EncodingFormProps {
  onSubmit: (data: FormData) => void;
}

const DEFAULT_OFFICE_OPTIONS = ["ICT", "HR", "Finance", "Operations", "Did not answer"];

export const EncodingForm = ({ onSubmit }: EncodingFormProps) => {
  const { toast } = useToast();
  const [campus, setCampus] = useState("Sorsogon City Campus");
  const [clientType, setClientType] = useState<string[]>(["C"]);
  const [sex, setSex] = useState("Male");
  const [ageGroup, setAgeGroup] = useState("19-B");
  const [office, setOffice] = useState("");
  const [documentNumber, setDocumentNumber] = useState("0");
  const [services, setServices] = useState("");
  const [comments, setComments] = useState("");
  const [cc1, setCc1] = useState("1");
  const [cc2, setCc2] = useState("1");
  const [cc3, setCc3] = useState("1");
  const [sqd0, setSqd0] = useState("SA");
  const [sqd1, setSqd1] = useState("SA");
  const [sqd2, setSqd2] = useState("SA");
  const [sqd3, setSqd3] = useState("SA");
  const [sqd4, setSqd4] = useState("SA");
  const [sqd5, setSqd5] = useState("NA");
  const [sqd6, setSqd6] = useState("SA");
  const [sqd7, setSqd7] = useState("SA");
  const [sqd8, setSqd8] = useState("SA");
  
  const [officeOptions, setOfficeOptions] = useState<string[]>(DEFAULT_OFFICE_OPTIONS);
  const [newOffice, setNewOffice] = useState("");
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);

  useEffect(() => {
    const savedOptions = localStorage.getItem("officeOptions");
    if (savedOptions) {
      setOfficeOptions(JSON.parse(savedOptions));
    }
  }, []);

  const saveOfficeOptions = (options: string[]) => {
    setOfficeOptions(options);
    localStorage.setItem("officeOptions", JSON.stringify(options));
  };

  const handleAddOffice = () => {
    if (newOffice.trim() && !officeOptions.includes(newOffice.trim())) {
      const updated = [...officeOptions, newOffice.trim()];
      saveOfficeOptions(updated);
      setNewOffice("");
      toast({
        title: "Success",
        description: "Office option added",
      });
    }
  };

  const handleDeleteOffice = (optionToDelete: string) => {
    const updated = officeOptions.filter(opt => opt !== optionToDelete);
    saveOfficeOptions(updated);
    if (office === optionToDelete) {
      setOffice("");
    }
    toast({
      title: "Success",
      description: "Office option removed",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData: FormData = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      campus,
      clientType,
      sex,
      ageGroup,
      office,
      documentNumber,
      services,
      comments,
      cc1,
      cc2,
      cc3,
      sqd0,
      sqd1,
      sqd2,
      sqd3,
      sqd4,
      sqd5,
      sqd6,
      sqd7,
      sqd8,
    };

    onSubmit(formData);
    resetForm();
    toast({
      title: "Success",
      description: "Data has been saved successfully",
    });
  };

  const resetForm = () => {
    // Keep campus and office, reset others to defaults
    setClientType(["C"]);
    setSex("Male");
    setAgeGroup("19-B");
    setDocumentNumber((prev) => String(Number(prev) + 1));
    setServices("");
    setComments("");
    setCc1("1");
    setCc2("1");
    setCc3("1");
    setSqd0("SA");
    setSqd1("SA");
    setSqd2("SA");
    setSqd3("SA");
    setSqd4("SA");
    setSqd5("NA");
    setSqd6("SA");
    setSqd7("SA");
    setSqd8("SA");
  };

  const ccOptions = ["1", "2", "3", "4", "5", "NA"];
  const sqdOptions = ["SD", "D", "ND", "A", "SA", "NA"];

  return (
    <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-4 max-w-7xl mx-auto p-3 lg:p-4 bg-card rounded-lg shadow-lg h-full lg:overflow-y-auto">
      <div className="grid gap-3 lg:gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="campus">Campus</Label>
          <Select value={campus} onValueChange={setCampus}>
            <SelectTrigger>
              <SelectValue placeholder="Select campus" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border">
              <SelectItem value="Sorsogon City Campus">Sorsogon City Campus</SelectItem>
              <SelectItem value="Bulan Campus">Bulan Campus</SelectItem>
              <SelectItem value="Magallanes Campus">Magallanes Campus</SelectItem>
              <SelectItem value="Castilla Campus">Castilla Campus</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="office">Office</Label>
            <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 px-2">
                  <Settings className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Manage Office Options</DialogTitle>
                  <DialogDescription>
                    Add or remove office options from the dropdown.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="New office name"
                      value={newOffice}
                      onChange={(e) => setNewOffice(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddOffice()}
                    />
                    <Button onClick={handleAddOffice} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {officeOptions.map((option) => (
                      <div
                        key={option}
                        className="flex items-center justify-between p-2 rounded-md bg-muted"
                      >
                        <span className="text-sm">{option}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteOffice(option)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Select value={office} onValueChange={setOffice}>
            <SelectTrigger>
              <SelectValue placeholder="Select office" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border z-50">
              {officeOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 lg:gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MultiCheckboxGroup
          label="Client Type"
          options={["C", "B", "G", "Did not answer"]}
          values={clientType}
          onChange={setClientType}
        />

        <CheckboxGroup
          label="Sex"
          options={["Male", "Female", "Did not answer"]}
          value={sex}
          onChange={setSex}
        />

        <CheckboxGroup
          label="Age Group"
          options={["19-B", "20-34", "35-49", "50-64", "65-UP", "Did not answer"]}
          value={ageGroup}
          onChange={setAgeGroup}
        />

        <div className="space-y-2">
          <Label htmlFor="documentNumber">Document Number</Label>
          <Input
            id="documentNumber"
            type="number"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            className="h-9"
          />
        </div>
      </div>

      <div className="border-t border-border pt-3 lg:pt-4 space-y-2 lg:space-y-3">
        <h3 className="text-base lg:text-lg font-semibold">Citizen's Charter (CC)</h3>
        <CCTable
          values={{
            cc1,
            cc2,
            cc3,
          }}
          onChange={(field, value) => {
            const setters: { [key: string]: (value: string) => void } = {
              cc1: setCc1,
              cc2: setCc2,
              cc3: setCc3,
            };
            setters[field]?.(value);
          }}
        />
      </div>

      <div className="border-t border-border pt-3 lg:pt-4 space-y-2 lg:space-y-3">
        <h3 className="text-base lg:text-lg font-semibold">Service Quality Dimensions (SQD)</h3>
        <SQDTable
          values={{
            sqd0,
            sqd1,
            sqd2,
            sqd3,
            sqd4,
            sqd5,
            sqd6,
            sqd7,
            sqd8,
          }}
          onChange={(field, value) => {
            const setters: { [key: string]: (value: string) => void } = {
              sqd0: setSqd0,
              sqd1: setSqd1,
              sqd2: setSqd2,
              sqd3: setSqd3,
              sqd4: setSqd4,
              sqd5: setSqd5,
              sqd6: setSqd6,
              sqd7: setSqd7,
              sqd8: setSqd8,
            };
            setters[field]?.(value);
          }}
        />
      </div>

      <div className="grid gap-3 lg:gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="services">Services</Label>
          <Input
            id="services"
            value={services}
            onChange={(e) => setServices(e.target.value)}
            className="h-9"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="comments">Comments/Suggestions</Label>
          <Textarea
            id="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={2}
            className="resize-none"
          />
        </div>
      </div>

      <Button type="submit" className="w-full h-9 lg:h-10" size="lg">
        Submit
      </Button>
    </form>
  );
};
