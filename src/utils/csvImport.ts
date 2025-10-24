import { FormData } from "@/types/form";

export const parseCSVToFormData = (csvText: string): FormData[] => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file is empty or invalid');
  }

  // Skip header line
  const dataLines = lines.slice(1);
  const formDataArray: FormData[] = [];

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i].trim();
    if (!line) continue;

    // Parse CSV line (handle quoted fields with commas)
    const values: string[] = [];
    let currentValue = '';
    let insideQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());

    // Ensure we have all 20 columns
    if (values.length < 20) {
      console.warn(`Row ${i + 2} has insufficient columns, skipping`);
      continue;
    }

    // Map to FormData structure
    // Expected order: Date/Time, Campus, Age Group, Sex, Office, Services, Client Type, CC1, CC2, CC3, SQD0-8, Comments, Document Number
    const formData: FormData = {
      id: `imported-${Date.now()}-${i}`,
      timestamp: values[0] || new Date().toISOString(),
      campus: values[1] || '',
      ageGroup: values[2] || '',
      sex: values[3] || '',
      office: values[4] || '',
      services: values[5] || '',
      clientType: values[6] || '',
      cc1: values[7] || '',
      cc2: values[8] || '',
      cc3: values[9] || '',
      sqd0: values[10] || '',
      sqd1: values[11] || '',
      sqd2: values[12] || '',
      sqd3: values[13] || '',
      sqd4: values[14] || '',
      sqd5: values[15] || '',
      sqd6: values[16] || '',
      sqd7: values[17] || '',
      sqd8: values[18] || '',
      comments: values[19] || '',
      documentNumber: values[20] || '',
    };

    formDataArray.push(formData);
  }

  return formDataArray;
};

export const getExpectedCSVColumns = (): string => {
  return "Date/Time, Campus, Age Group, Sex, Office, Services, Client Type, CC1, CC2, CC3, SQD0, SQD1, SQD2, SQD3, SQD4, SQD5, SQD6, SQD7, SQD8, Comments/Suggestions, Document Number";
};
