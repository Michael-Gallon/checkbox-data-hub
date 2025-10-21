import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiCheckboxGroup } from "./MultiCheckboxGroup";
import { CheckboxGroup } from "./CheckboxGroup";
import { useToast } from "@/hooks/use-toast";
import { FormData } from "@/types/form";

interface EncodingFormProps {
  onSubmit: (data: FormData) => void;
}

export const EncodingForm = ({ onSubmit }: EncodingFormProps) => {
  const { toast } = useToast();
  const [clientType, setClientType] = useState<string[]>([]);
  const [sex, setSex] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [office, setOffice] = useState("");
  const [rowNumber, setRowNumber] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [services, setServices] = useState("");
  const [comments, setComments] = useState("");
  const [cc1, setCc1] = useState("");
  const [cc2, setCc2] = useState("");
  const [cc3, setCc3] = useState("");
  const [sqd0, setSqd0] = useState("");
  const [sqd1, setSqd1] = useState("");
  const [sqd2, setSqd2] = useState("");
  const [sqd3, setSqd3] = useState("");
  const [sqd4, setSqd4] = useState("");
  const [sqd5, setSqd5] = useState("");
  const [sqd6, setSqd6] = useState("");
  const [sqd7, setSqd7] = useState("");
  const [sqd8, setSqd8] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData: FormData = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      clientType,
      sex,
      ageGroup,
      office,
      rowNumber,
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
    setClientType([]);
    setSex("");
    setAgeGroup("");
    setOffice("");
    setRowNumber("");
    setDocumentNumber("");
    setServices("");
    setComments("");
    setCc1("");
    setCc2("");
    setCc3("");
    setSqd0("");
    setSqd1("");
    setSqd2("");
    setSqd3("");
    setSqd4("");
    setSqd5("");
    setSqd6("");
    setSqd7("");
    setSqd8("");
  };

  const ccOptions = ["1", "2", "3", "4", "5", "NA"];
  const sqdOptions = ["SD", "D", "ND", "A", "SA", "NA"];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto p-6 bg-card rounded-lg shadow-lg">
      <div className="grid gap-6 md:grid-cols-2">
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
          <Label htmlFor="office">Office</Label>
          <Select value={office} onValueChange={setOffice}>
            <SelectTrigger>
              <SelectValue placeholder="Select office" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border">
              <SelectItem value="ICT">ICT</SelectItem>
              <SelectItem value="HR">HR</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="Operations">Operations</SelectItem>
              <SelectItem value="Did not answer">Did not answer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rowNumber">Row Number</Label>
          <Input
            id="rowNumber"
            type="number"
            value={rowNumber}
            onChange={(e) => setRowNumber(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="documentNumber">Document Number</Label>
          <Input
            id="documentNumber"
            type="number"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="services">Services</Label>
        <Input
          id="services"
          value={services}
          onChange={(e) => setServices(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="comments">Comments/Suggestions</Label>
        <Textarea
          id="comments"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={4}
        />
      </div>

      <div className="border-t border-border pt-6 space-y-4">
        <h3 className="text-lg font-semibold">Citizen's Charter (CC)</h3>
        <CheckboxGroup label="CC1" options={ccOptions} value={cc1} onChange={setCc1} allowColumnClick />
        <CheckboxGroup label="CC2" options={ccOptions} value={cc2} onChange={setCc2} allowColumnClick />
        <CheckboxGroup label="CC3" options={ccOptions} value={cc3} onChange={setCc3} allowColumnClick />
      </div>

      <div className="border-t border-border pt-6 space-y-4">
        <h3 className="text-lg font-semibold">Service Quality Dimensions (SQD)</h3>
        <CheckboxGroup label="SQD0" options={sqdOptions} value={sqd0} onChange={setSqd0} allowColumnClick />
        <CheckboxGroup label="SQD1" options={sqdOptions} value={sqd1} onChange={setSqd1} allowColumnClick />
        <CheckboxGroup label="SQD2" options={sqdOptions} value={sqd2} onChange={setSqd2} allowColumnClick />
        <CheckboxGroup label="SQD3" options={sqdOptions} value={sqd3} onChange={setSqd3} allowColumnClick />
        <CheckboxGroup label="SQD4" options={sqdOptions} value={sqd4} onChange={setSqd4} allowColumnClick />
        <CheckboxGroup label="SQD5" options={sqdOptions} value={sqd5} onChange={setSqd5} allowColumnClick />
        <CheckboxGroup label="SQD6" options={sqdOptions} value={sqd6} onChange={setSqd6} allowColumnClick />
        <CheckboxGroup label="SQD7" options={sqdOptions} value={sqd7} onChange={setSqd7} allowColumnClick />
        <CheckboxGroup label="SQD8" options={sqdOptions} value={sqd8} onChange={setSqd8} allowColumnClick />
      </div>

      <Button type="submit" className="w-full" size="lg">
        Submit
      </Button>
    </form>
  );
};
