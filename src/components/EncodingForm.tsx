import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiCheckboxGroup } from "./MultiCheckboxGroup";
import { CheckboxGroup } from "./CheckboxGroup";
import { SQDTable } from "./SQDTable";
import { CCTable } from "./CCTable";
import { useToast } from "@/hooks/use-toast";
import { FormData } from "@/types/form";

interface EncodingFormProps {
  onSubmit: (data: FormData) => void;
}

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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto p-6 bg-card rounded-lg shadow-lg">
      <div className="grid gap-6 md:grid-cols-2">
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
      </div>

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
          <Label htmlFor="documentNumber">Document Number</Label>
          <Input
            id="documentNumber"
            type="number"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
          />
        </div>
      </div>

      <div className="border-t border-border pt-6 space-y-4">
        <h3 className="text-lg font-semibold">Citizen's Charter (CC)</h3>
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

      <div className="border-t border-border pt-6 space-y-4">
        <h3 className="text-lg font-semibold">Service Quality Dimensions (SQD)</h3>
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

      <Button type="submit" className="w-full" size="lg">
        Submit
      </Button>
    </form>
  );
};
