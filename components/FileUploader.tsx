import React, { useRef, useState } from 'react';
import { UploadCloud, FileType, Loader2 } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && validateFile(files[0])) {
      onFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const validateFile = (file: File) => {
    return (
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel' ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls')
    );
  };

  return (
    <div
      className={`
        w-full max-w-xl p-10 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-6
        ${isDragging 
          ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 scale-[1.02]' 
          : 'border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-slate-600 dark:hover:bg-slate-800/50'
        }
        shadow-sm dark:shadow-none
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept=".xlsx,.xls"
        className="hidden"
      />

      <div className={`p-4 rounded-full ${isLoading ? 'bg-indigo-50 dark:bg-indigo-500/20' : 'bg-gray-100 dark:bg-slate-800'}`}>
        {isLoading ? (
          <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
        ) : (
          <UploadCloud className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
        )}
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
          {isLoading ? 'Processing Workbook...' : 'Upload Excel File'}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">
          Drag and drop your .xlsx or .xls file here, or click to browse
        </p>
      </div>

      {!isLoading && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white font-medium rounded-lg transition-all shadow-lg shadow-indigo-500/20 dark:shadow-indigo-900/20 flex items-center gap-2"
        >
          <FileType className="w-4 h-4" />
          Select File
        </button>
      )}
    </div>
  );
};