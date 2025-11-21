import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { WorkbookData, SheetRow, MergeRange } from '../types';
import { getSheetData } from '../services/excelService';
import { DataGrid } from './DataGrid';

interface ExcelViewerProps {
  workbook: WorkbookData;
  activeSheet: string;
  onSheetChange: (sheetName: string) => void;
}

export const ExcelViewer: React.FC<ExcelViewerProps> = ({ workbook, activeSheet, onSheetChange }) => {
  const [sheetData, setSheetData] = useState<{ rows: SheetRow[], merges: MergeRange[] }>({ rows: [], merges: [] });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [loading, setLoading] = useState(false);

  // When activeSheet or workbook changes, load the new data
  useEffect(() => {
    if (activeSheet) {
      handleSheetLoad(activeSheet);
    }
  }, [activeSheet, workbook]);

  const handleSheetLoad = (name: string) => {
    setLoading(true);
    // Use timeout to allow UI to show loading state for large sheets
    setTimeout(() => {
      const data = getSheetData(workbook.raw, name);
      setSheetData(data);
      setPage(1);
      setLoading(false);
    }, 50);
  };

  const totalPages = Math.ceil((sheetData.rows.length - 1) / pageSize); 
  const displayRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return sheetData.rows.slice(start, end);
  }, [sheetData.rows, page, pageSize]);

  const handlePrevPage = () => setPage(p => Math.max(1, p - 1));
  const handleNextPage = () => setPage(p => Math.min(totalPages || 1, p + 1));

  // Find index for Next/Prev sheet navigation
  const currentSheetIndex = workbook.sheetNames.indexOf(activeSheet);

  const handleNextSheet = () => {
    if (currentSheetIndex < workbook.sheetNames.length - 1) {
      onSheetChange(workbook.sheetNames[currentSheetIndex + 1]);
    }
  };

  const handlePrevSheet = () => {
    if (currentSheetIndex > 0) {
      onSheetChange(workbook.sheetNames[currentSheetIndex - 1]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[#0f1219]">
      {/* Control Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-[#161b26] gap-4 transition-colors duration-300">
        
        {/* Left: Sheet Selector */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <label className="text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap">Select worksheet:</label>
          <div className="relative flex-1 md:min-w-[300px]">
            <select
              value={activeSheet}
              onChange={(e) => onSheetChange(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-[#0f1219] border border-gray-300 dark:border-indigo-500/30 text-slate-700 dark:text-slate-200 text-sm rounded-md py-2 pl-3 pr-8 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
            >
              {workbook.sheetNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronRight className="w-4 h-4 text-slate-500 rotate-90" />
            </div>
          </div>
        </div>

        {/* Right: Pagination & Sheet Nav */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
           <div className="flex items-center gap-2 mr-4 border-r border-gray-200 dark:border-slate-700 pr-4">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Rows</span>
              <button 
                onClick={handlePrevPage} 
                disabled={page === 1}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600 dark:text-slate-400"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-mono text-slate-600 dark:text-slate-400 min-w-[60px] text-center">
                 {sheetData.rows.length > 0 ? `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, sheetData.rows.length)}` : '0-0'}
              </span>
              <button 
                onClick={handleNextPage} 
                disabled={page >= totalPages}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600 dark:text-slate-400"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
           </div>

           <div className="flex items-center gap-2">
              <button
                onClick={handlePrevSheet}
                disabled={currentSheetIndex === 0}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-[#232936] text-slate-600 dark:text-slate-300 text-sm rounded hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white disabled:opacity-40 disabled:hover:bg-gray-100 dark:disabled:hover:bg-[#232936] disabled:hover:text-slate-600 dark:disabled:hover:text-slate-300 transition-all border border-gray-200 dark:border-slate-700"
              >
                <ChevronLeft className="w-3 h-3" /> Prev
              </button>
              <span className="text-xs text-slate-500 hidden lg:block">
                {loading ? '...' : `${currentSheetIndex + 1} / ${workbook.sheetNames.length}`}
              </span>
              <button
                onClick={handleNextSheet}
                disabled={currentSheetIndex === workbook.sheetNames.length - 1}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 dark:shadow-indigo-900/20"
              >
                Next <ChevronRight className="w-3 h-3" />
              </button>
           </div>
        </div>
      </div>

      {/* Data Table Area */}
      <div className="flex-1 overflow-hidden relative bg-gray-50 dark:bg-[#0f1219]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/80 dark:bg-[#0f1219]/80 backdrop-blur-sm transition-colors duration-300">
             <div className="flex flex-col items-center gap-3">
               <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
               <span className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">Loading Sheet...</span>
             </div>
          </div>
        ) : null}
        
        {sheetData.rows.length > 0 ? (
           <DataGrid 
             rows={displayRows} 
             startIndex={(page - 1) * pageSize} 
             totalCols={sheetData.rows[0]?.length || 0}
             merges={sheetData.merges}
             allRows={sheetData.rows}
           />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500">
            <p>No data found in this sheet.</p>
          </div>
        )}
      </div>
      
      {/* Footer Info */}
      <div className="px-6 py-2 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-[#161b26] text-xs text-slate-500 flex justify-between items-center transition-colors duration-300">
         <span>{workbook.fileName}</span>
         <span>Total Rows: {sheetData.rows.length}</span>
      </div>
    </div>
  );
};