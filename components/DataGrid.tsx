import React, { useMemo } from 'react';
import { SheetRow, MergeRange } from '../types';
import { clsx } from 'clsx';

interface DataGridProps {
  rows: SheetRow[];
  startIndex: number;
  totalCols: number;
  merges: MergeRange[];
  allRows: SheetRow[];
}

export const DataGrid: React.FC<DataGridProps> = ({ rows, startIndex, totalCols, merges, allRows }) => {
  // Generate letter headers (A, B, C...)
  const getColumnLabel = (index: number) => {
    let label = '';
    let i = index;
    while (i >= 0) {
      label = String.fromCharCode((i % 26) + 65) + label;
      i = Math.floor(i / 26) - 1;
    }
    return label;
  };

  // Determine max columns including merges that might go beyond data
  const maxCols = useMemo(() => {
    let max = totalCols;
    // Check if any merge extends beyond current max
    for (const merge of merges) {
      if (merge.e.c + 1 > max) {
        max = merge.e.c + 1;
      }
    }
    // Also check row data length
    for (const row of rows) {
      if (row.length > max) max = row.length;
    }
    return Math.max(max, 5); // Minimum 5 cols
  }, [totalCols, merges, rows]);

  // Helper to determine render state of a cell
  const getCellState = (rowIndex: number, colIndex: number) => {
    const absRow = startIndex + rowIndex;
    
    // Check if this cell is inside any merge range
    const merge = merges.find(m => 
      absRow >= m.s.r && absRow <= m.e.r && 
      colIndex >= m.s.c && colIndex <= m.e.c
    );

    if (!merge) {
      return { type: 'normal' as const };
    }

    // It is in a merge. Is it the start cell?
    const isStart = absRow === merge.s.r && colIndex === merge.s.c;

    // If it is the start, render it with spans
    if (isStart) {
      return { 
        type: 'start' as const, 
        rowSpan: merge.e.r - merge.s.r + 1, 
        colSpan: merge.e.c - merge.s.c + 1,
        content: rows[rowIndex][colIndex] // Value comes from current row
      };
    }

    // Special Case: Pagination handling
    // If the merge started on a PREVIOUS page, but covers this cell
    // AND we are on the first row of the current view (rowIndex === 0)
    // We treat this cell as a "continuation start" so it appears on this page
    if (merge.s.r < startIndex && rowIndex === 0) {
      // Only render the continuation if we are at the correct column
      if (colIndex === merge.s.c) {
         // Calculate remaining rowspan for this page/table
         // Note: This technically creates a new cell on this page. 
         // Value needs to be fetched from the original start cell in `allRows`.
         const originalValue = allRows[merge.s.r]?.[merge.s.c];
         
         // Calculate how much is left
         const remainingRowSpan = merge.e.r - absRow + 1;
         
         return {
            type: 'continuation' as const,
            rowSpan: remainingRowSpan,
            colSpan: merge.e.c - merge.s.c + 1,
            content: originalValue
         };
      }
    }

    // Otherwise, it's a covered cell that should be hidden
    return { type: 'covered' as const };
  };

  return (
    <div className="h-full w-full overflow-auto custom-scrollbar">
      <table className="w-full border-collapse text-sm whitespace-nowrap relative">
        <thead className="sticky top-0 z-10">
          <tr>
            {/* Row Number Header Corner */}
            <th className="bg-gray-100 border-b border-r border-gray-300 dark:bg-[#1e2532] dark:border-slate-700 w-12 min-w-[3rem] sticky left-0 z-20 transition-colors"></th>
            
            {/* Column Headers (A, B, C...) */}
            {Array.from({ length: maxCols }).map((_, i) => (
              <th
                key={i}
                className="bg-gray-100 text-gray-700 border-b border-r border-gray-300 dark:bg-[#1e2532] dark:text-slate-400 dark:border-slate-700 font-medium px-4 py-1.5 text-center select-none min-w-[100px] transition-colors"
              >
                {getColumnLabel(i)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="group hover:bg-gray-50 dark:hover:bg-[#1e2532]/50 transition-colors">
              {/* Row Number */}
              <td className="sticky left-0 z-10 bg-gray-50 text-slate-500 border-r border-b border-gray-300 dark:bg-[#161b26] dark:text-slate-500 dark:border-slate-700 text-center text-xs font-mono select-none group-hover:bg-gray-100 group-hover:text-slate-800 dark:group-hover:bg-[#1e2532] dark:group-hover:text-slate-300 transition-colors">
                {startIndex + rowIndex + 1}
              </td>
              
              {/* Cells */}
              {Array.from({ length: maxCols }).map((_, colIndex) => {
                const cellState = getCellState(rowIndex, colIndex);
                
                if (cellState.type === 'covered') {
                  return null; // Don't render covered cells
                }

                let cellValue: string | number | null | undefined;
                let rowSpan = 1;
                let colSpan = 1;
                let isMerged = false;

                if (cellState.type === 'start' || cellState.type === 'continuation') {
                   cellValue = cellState.content;
                   rowSpan = cellState.rowSpan;
                   colSpan = cellState.colSpan;
                   isMerged = true;
                } else {
                   cellValue = row[colIndex];
                }

                const absRow = startIndex + rowIndex;
                const isHeaderLike = absRow === 0 && typeof cellValue === 'string' && cellValue.length > 0;
                
                return (
                  <td
                    key={colIndex}
                    colSpan={colSpan}
                    rowSpan={rowSpan}
                    className={clsx(
                      "px-3 py-2 border-r border-b border-gray-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 overflow-hidden text-ellipsis max-w-[300px] transition-colors",
                      isHeaderLike ? "font-semibold text-indigo-700 bg-indigo-50 dark:text-indigo-300 dark:bg-slate-900/30" : "",
                      isMerged ? "bg-white dark:bg-[#1a202c] align-middle text-center" : ""
                    )}
                    title={cellValue?.toString() ?? ''}
                  >
                    {cellValue !== null && cellValue !== undefined ? cellValue.toString() : ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};