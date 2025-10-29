import * as XLSX from 'xlsx';
import { FormData } from '@/types/form';

export const generateExcelBlob = (data: FormData[]) => {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map((entry) => ({
      'Date/Time': new Date(entry.timestamp).toLocaleString(),
      'Campus': entry.campus,
      'Age Group': entry.ageGroup,
      'Sex': entry.sex,
      'Office': entry.office,
      'Services': entry.services,
      'Client Type': entry.clientType,
      'CC1': entry.cc1,
      'CC2': entry.cc2,
      'CC3': entry.cc3,
      'SQD0': entry.sqd0,
      'SQD1': entry.sqd1,
      'SQD2': entry.sqd2,
      'SQD3': entry.sqd3,
      'SQD4': entry.sqd4,
      'SQD5': entry.sqd5,
      'SQD6': entry.sqd6,
      'SQD7': entry.sqd7,
      'SQD8': entry.sqd8,
      'Comments/Suggestions': entry.comments,
      'Document Number': entry.documentNumber,
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Encoded Data');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/octet-stream' });
};
