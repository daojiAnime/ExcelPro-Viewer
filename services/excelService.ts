import * as XLSX from 'xlsx';
import { WorkbookData, SheetRow, MergeRange } from '../types';

export const parseExcelFile = async (file: File): Promise<WorkbookData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error("File parsing failed: No data");
        }
        const workbook = XLSX.read(data, { type: 'array' });
        resolve({
          raw: workbook,
          sheetNames: workbook.SheetNames,
          fileName: file.name
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
};

export const getSheetData = (workbook: XLSX.WorkBook, sheetName: string): { rows: SheetRow[], merges: MergeRange[] } => {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return { rows: [], merges: [] };
  
  // header: 1 returns an array of arrays (row-major)
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as SheetRow[];
  const merges = (sheet['!merges'] || []) as MergeRange[];
  
  return { rows, merges };
};