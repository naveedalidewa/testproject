import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";

const ExcelImportModal = ({ isOpen, onClose, onPreview }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [skipRows, setSkipRows] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const resetForm = () => {
    setSelectedFile(null);
    setSkipRows(1);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
      ];

      if (
        validTypes.includes(file.type) ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls") ||
        file.name.endsWith(".csv")
      ) {
        setSelectedFile(file);
      } else {
        alert("Please select a valid Excel file (.xlsx, .xls) or CSV file");
      }
    }
  };

  const processExcelFile = async () => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }

    setIsProcessing(true);

    try {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });

          // Get first worksheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Convert to JSON with header row handling
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
          });

          // Remove empty rows and apply skip rows
          const filteredData = jsonData
            .filter((row) => row.some((cell) => cell !== ""))
            .slice(skipRows);

          if (filteredData.length === 0) {
            alert("No data found in the file after skipping rows");
            setIsProcessing(false);
            return;
          }

          // Pass data to preview modal
          onPreview({
            file: selectedFile,
            data: filteredData,
            skipRows: skipRows,
          });

          onClose();
        } catch (error) {
          console.error("Error processing Excel file:", error);
          alert("Error processing Excel file. Please check the file format.");
        } finally {
          setIsProcessing(false);
        }
      };

      reader.readAsArrayBuffer(selectedFile);
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Error reading file");
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Import from Excel
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* File Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Excel File
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 cursor-pointer transition-colors duration-200"
            >
              {selectedFile ? (
                <div>
                  <svg
                    className="w-12 h-12 text-green-500 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <svg
                    className="w-12 h-12 text-gray-400 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-sm font-medium text-gray-900">
                    Click to upload Excel file
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supports .xlsx, .xls, and .csv files
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Skip Rows */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skip Rows from Top
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={skipRows}
              onChange={(e) => setSkipRows(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1"
              style={{
                "--tw-ring-color": "rgb(255 153 25 / var(--tw-bg-opacity))",
              }}
            />
            <p className="text-xs text-gray-500 mt-1">
              Number of rows to skip (e.g., 1 to skip header row)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={processExcelFile}
              disabled={!selectedFile || isProcessing}
              className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                backgroundColor: "rgb(255 153 25 / var(--tw-bg-opacity))",
              }}
            >
              {isProcessing && (
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {isProcessing ? "Processing..." : "Preview Data"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelImportModal;
