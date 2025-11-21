import React, { useState, useCallback, useEffect } from 'react';
import { FileSpreadsheet, Moon, Sun, Send } from 'lucide-react';
import { FileUploader } from './components/FileUploader';
import { ExcelViewer } from './components/ExcelViewer';
import { parseExcelFile } from './services/excelService';
import { WorkbookData } from './types';

const App: React.FC = () => {
  const [workbook, setWorkbook] = useState<WorkbookData | null>(null);
  const [currentSheetName, setCurrentSheetName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Initialize theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleFileSelect = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await parseExcelFile(file);
      setWorkbook(data);
      // Default to first sheet
      if (data.sheetNames.length > 0) {
        setCurrentSheetName(data.sheetNames[0]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to parse Excel file. Please ensure it is a valid .xlsx or .xls file.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setWorkbook(null);
    setCurrentSheetName("");
    setError(null);
  }, []);

  const handleSheetChange = useCallback((name: string) => {
    setCurrentSheetName(name);
  }, []);

  // This is where you would send data to your API
  const handleApiSubmit = async () => {
    if (!workbook || !currentSheetName) return;
    
    setIsSubmitting(true);
    try {
        // --- API LOGIC GOES HERE ---
        // Example FormData construction:
        // const formData = new FormData();
        // formData.append('file', workbook.file);
        // formData.append('sheetName', currentSheetName);
        // await fetch('/api/endpoint', { method: 'POST', body: formData });

        console.log("--------------------------------------------------");
        console.log("READY TO SEND TO API:");
        console.log("File Object:", workbook.file);
        console.log("Selected Sheet:", currentSheetName);
        console.log("--------------------------------------------------");
        
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert(`Ready to send:\nFile: ${workbook.file.name}\nSheet: ${currentSheetName}`);
    } catch (e) {
        console.error("Submission error", e);
        setError("Failed to submit data.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1219] flex flex-col text-slate-900 dark:text-slate-200 font-sans transition-colors duration-300">
      {/* Top Navigation Bar - Always visible */}
      <nav className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-[#161b26] px-6 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm dark:shadow-lg transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-600/20 rounded-lg border border-indigo-100 dark:border-indigo-500/30">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-slate-800 dark:text-slate-100">
            Excel<span className="text-indigo-600 dark:text-indigo-400">Pro</span> Viewer
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {workbook && (
             <button
                onClick={handleApiSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
             >
                {isSubmitting ? (
                    <>Processing...</>
                ) : (
                    <>
                        <Send className="w-4 h-4" />
                        Process Sheet
                    </>
                )}
             </button>
          )}

          <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 mx-1"></div>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {workbook && (
            <button 
              onClick={handleReset}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              Upload New
            </button>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden relative">
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-50 border border-red-200 text-red-600 dark:bg-red-500/10 dark:border-red-500/50 dark:text-red-200 px-4 py-2 rounded-lg shadow-xl backdrop-blur-md">
            {error}
          </div>
        )}

        {!workbook ? (
          <div className="flex-1 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
            <FileUploader onFileSelect={handleFileSelect} isLoading={isLoading} />
          </div>
        ) : (
          <ExcelViewer 
             workbook={workbook} 
             activeSheet={currentSheetName}
             onSheetChange={handleSheetChange}
          />
        )}
      </main>
    </div>
  );
};

export default App;