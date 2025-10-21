import * as XLSX from 'xlsx';
import { FormData } from '@/types/form';

export const exportToExcel = (data: FormData[]) => {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map((entry) => ({
      'Date/Time': new Date(entry.timestamp).toLocaleString(),
      'Client Type': entry.clientType.join(', '),
      'Sex': entry.sex,
      'Age Group': entry.ageGroup,
      'Office': entry.office,
      'Row Number': entry.rowNumber,
      'Document Number': entry.documentNumber,
      'Services': entry.services,
      'Comments/Suggestions': entry.comments,
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
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Encoded Data');

  const fileName = `encoded-data-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
