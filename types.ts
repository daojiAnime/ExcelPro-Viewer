import { WorkBook } from 'xlsx';

export interface WorkbookData {
  raw: WorkBook;
  sheetNames: string[];
  fileName: string;
  file: File;
}

export type SheetRow = (string | number | null)[];

export interface MergeRange {
  s: { r: number; c: number };
  e: { r: number; c: number };
}

export interface SheetContent {
  name: string;
  rows: SheetRow[];
  merges: MergeRange[];
}

export interface TableState {
  currentPage: number;
  rowsPerPage: number;
}