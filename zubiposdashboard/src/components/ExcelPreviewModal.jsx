import { useState, useEffect } from "react";
import { importService } from "../services/importService";

const ExcelPreviewModal = ({
  isOpen,
  onClose,
  excelData,
  onImportComplete,
}) => {
  const [columnMappings, setColumnMappings] = useState({});
  const [isImporting, setIsImporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [columnWidths, setColumnWidths] = useState({});
  const [resizing, setResizing] = useState(null);
  const [modalSize, setModalSize] = useState({ width: 1200, height: 700 });
  const [modalResizing, setModalResizing] = useState(null);

  const availableColumns = [
    { value: "", label: "-- Select Column --" },
    { value: "UPC", label: "UPC" },
    { value: "Description", label: "Description" },
    { value: "Department", label: "Department" },
    { value: "Quantity", label: "Quantity" },
    { value: "Unit in Case", label: "Unit in Case" },
    { value: "Case Cost", label: "Case Cost" },
    { value: "Unit Retail", label: "Unit Retail" },
  ];

  // Initialize column mappings and widths when data changes
  useEffect(() => {
    if (excelData?.data && excelData.data.length > 0) {
      const firstRow = excelData.data[0];
      const initialMappings = {};
      const initialWidths = {};

      firstRow.forEach((cellValue, index) => {
        // Initialize column width based on content
        const cellLength = cellValue?.toString().length || 0;
        initialWidths[index] = Math.max(
          150,
          Math.min(300, cellLength * 8 + 80),
        );

        // Try to auto-map common column names
        const cellValueLower = cellValue.toString().toLowerCase();
        if (
          cellValueLower.includes("upc") ||
          cellValueLower.includes("barcode") ||
          cellValueLower.includes("scan")
        ) {
          initialMappings[index] = "UPC";
        } else if (
          cellValueLower.includes("description") ||
          cellValueLower.includes("name") ||
          cellValueLower.includes("product")
        ) {
          initialMappings[index] = "Description";
        } else if (
          cellValueLower.includes("department") ||
          cellValueLower.includes("dept")
        ) {
          initialMappings[index] = "Department";
        } else if (
          cellValueLower.includes("quantity") ||
          cellValueLower.includes("qty")
        ) {
          initialMappings[index] = "Quantity";
        } else if (
          cellValueLower.includes("case") &&
          cellValueLower.includes("cost")
        ) {
          initialMappings[index] = "Case Cost";
        } else if (
          cellValueLower.includes("retail") ||
          cellValueLower.includes("price")
        ) {
          initialMappings[index] = "Unit Retail";
        } else if (
          cellValueLower.includes("unit") &&
          cellValueLower.includes("case")
        ) {
          initialMappings[index] = "Unit in Case";
        } else {
          initialMappings[index] = "";
        }
      });

      setColumnMappings(initialMappings);
      setColumnWidths(initialWidths);
      setCurrentPage(1); // Reset pagination
    }
  }, [excelData]);

  const handleColumnMappingChange = (columnIndex, value) => {
    setColumnMappings((prev) => ({
      ...prev,
      [columnIndex]: value,
    }));
  };

  // Column resizing handlers
  const handleMouseDown = (e, columnIndex) => {
    e.preventDefault();
    setResizing({
      columnIndex,
      startX: e.clientX,
      startWidth: columnWidths[columnIndex] || 200,
    });
  };

  const handleMouseMove = (e) => {
    if (!resizing) return;
    const deltaX = e.clientX - resizing.startX;
    const newWidth = Math.max(100, resizing.startWidth + deltaX);
    setColumnWidths((prev) => ({
      ...prev,
      [resizing.columnIndex]: newWidth,
    }));
  };

  const handleMouseUp = () => {
    setResizing(null);
  };

  // Modal resize handlers
  const handleModalMouseDown = (e, direction) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget
      .closest(".modal-container")
      .getBoundingClientRect();
    setModalResizing({
      direction,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: rect.width,
      startHeight: rect.height,
    });
  };

  const handleModalMouseMove = (e) => {
    if (!modalResizing) return;

    const { direction, startX, startY, startWidth, startHeight } =
      modalResizing;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    let newWidth = startWidth;
    let newHeight = startHeight;

    if (direction.includes("right")) {
      newWidth = Math.max(800, startWidth + deltaX);
    }
    if (direction.includes("left")) {
      newWidth = Math.max(800, startWidth - deltaX);
    }
    if (direction.includes("bottom")) {
      newHeight = Math.max(500, startHeight + deltaY);
    }
    if (direction.includes("top")) {
      newHeight = Math.max(500, startHeight - deltaY);
    }

    // Limit maximum size to window dimensions
    const maxWidth = window.innerWidth - 100;
    const maxHeight = window.innerHeight - 100;

    setModalSize({
      width: Math.min(newWidth, maxWidth),
      height: Math.min(newHeight, maxHeight),
    });
  };

  const handleModalMouseUp = () => {
    setModalResizing(null);
  };

  // Add global mouse event listeners for resizing
  useEffect(() => {
    if (resizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [resizing]);

  // Add global mouse event listeners for modal resizing
  useEffect(() => {
    if (modalResizing) {
      document.addEventListener("mousemove", handleModalMouseMove);
      document.addEventListener("mouseup", handleModalMouseUp);
      document.body.style.cursor =
        modalResizing.direction.includes("right") ||
        modalResizing.direction.includes("left")
          ? "ew-resize"
          : "ns-resize";
      if (
        modalResizing.direction.includes("right") &&
        modalResizing.direction.includes("bottom")
      ) {
        document.body.style.cursor = "nw-resize";
      } else if (
        modalResizing.direction.includes("left") &&
        modalResizing.direction.includes("bottom")
      ) {
        document.body.style.cursor = "ne-resize";
      }
      return () => {
        document.removeEventListener("mousemove", handleModalMouseMove);
        document.removeEventListener("mouseup", handleModalMouseUp);
        document.body.style.cursor = "default";
      };
    }
  }, [modalResizing]);

  // Pagination logic
  const totalRows = excelData?.data?.length || 0;
  const totalPages = Math.ceil(totalRows / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = excelData?.data?.slice(startIndex, endIndex) || [];

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleImport = async () => {
    // Validate that required columns are mapped
    const mappedColumns = Object.values(columnMappings).filter(
      (value) => value !== "",
    );
    if (mappedColumns.length === 0) {
      alert("Please map at least one column before importing");
      return;
    }

    // Check for required fields - only UPC and Quantity are required
    const requiredFields = ["UPC", "Quantity"];
    const missingRequired = requiredFields.filter(
      (field) => !Object.values(columnMappings).includes(field),
    );

    if (missingRequired.length > 0) {
      alert(
        `The following required fields are not mapped: ${missingRequired.join(", ")}.\n\nPlease map these fields before importing.`,
      );
      return;
    }

    setIsImporting(true);

    try {
      // Get token and location from localStorage
      const token = localStorage.getItem("zubipos_token");
      const selectedLocation = JSON.parse(
        localStorage.getItem("zubipos_location") || "{}",
      );
      const locationId = selectedLocation?.id;

      if (!locationId) {
        throw new Error(
          "No location selected. Please select a location first.",
        );
      }

      // Call the import service
      const result = await importService.importExcelFile(
        token,
        locationId,
        excelData.file,
        excelData.skipRows || 0,
        columnMappings,
      );

      onImportComplete(result);
    } catch (error) {
      console.error("Import error:", error);
      alert("Error importing file: " + error.message);
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen || !excelData) return null;

  const allData = excelData.data || [];
  const maxColumns =
    allData.length > 0 ? Math.max(...allData.map((row) => row.length)) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="modal-container bg-white rounded-lg shadow-xl flex flex-col relative"
        style={{
          width: `${modalSize.width}px`,
          height: `${modalSize.height}px`,
          maxWidth: "95vw",
          maxHeight: "95vh",
        }}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Map Excel Columns
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {excelData.file.name} • {excelData.data.length} rows • Skipped{" "}
              {excelData.skipRows} rows
            </p>
          </div>
          <button
            onClick={onClose}
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

        <div className="flex-1 flex flex-col p-4 min-h-0">
          <div className="mb-4">
            <p className="text-sm text-gray-700 mb-2">
              Map each column to the corresponding field.{" "}
              <span className="font-medium text-red-600">
                * UPC and Quantity are required
              </span>
            </p>
          </div>

          {/* Pagination Controls - Top */}
          <div className="flex-shrink-0 flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, totalRows)} of{" "}
                {totalRows} rows
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) =>
                  handleItemsPerPageChange(parseInt(e.target.value))
                }
                className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1"
                style={{
                  "--tw-ring-color": "rgb(255 153 25 / var(--tw-bg-opacity))",
                }}
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                ← Prev
              </button>
              <span className="text-xs text-gray-600 mx-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next →
              </button>
            </div>
          </div>

          <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-auto max-h-full">
              <table className="min-w-full">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    {Array.from({ length: maxColumns }, (_, index) => (
                      <th
                        key={index}
                        className="relative px-3 py-3 text-left border-b-2 border-gray-300 group bg-gray-50"
                        style={{
                          width: columnWidths[index] || 200,
                          minWidth: columnWidths[index] || 200,
                          maxWidth: columnWidths[index] || 200,
                        }}
                      >
                        <div className="mb-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Column {index + 1}
                            {columnMappings[index] === "UPC" ||
                            columnMappings[index] === "Quantity" ? (
                              <span className="text-red-600 ml-1">*</span>
                            ) : null}
                          </label>
                          <select
                            value={columnMappings[index] || ""}
                            onChange={(e) =>
                              handleColumnMappingChange(index, e.target.value)
                            }
                            className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1"
                            style={{
                              "--tw-ring-color":
                                "rgb(255 153 25 / var(--tw-bg-opacity))",
                            }}
                          >
                            {availableColumns.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                                {option.value === "UPC" ||
                                option.value === "Quantity"
                                  ? " *"
                                  : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                        {/* Resize handle matching DataGrid style */}
                        <div
                          className={`absolute right-0 top-0 bottom-0 w-3 cursor-col-resize transition-all ${
                            resizing?.columnIndex === index
                              ? "bg-orange-500 opacity-100"
                              : "bg-gray-300 opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-orange-400"
                          }`}
                          onMouseDown={(e) => handleMouseDown(e, index)}
                          title="Drag to resize column"
                        />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedData.map((row, rowIndex) => (
                    <tr
                      key={startIndex + rowIndex}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {Array.from({ length: maxColumns }, (_, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-3 py-2 text-sm text-gray-900 border-r border-gray-100 last:border-r-0 truncate"
                          style={{
                            width: columnWidths[colIndex] || 200,
                            maxWidth: columnWidths[colIndex] || 200,
                            minWidth: columnWidths[colIndex] || 200,
                          }}
                          title={row[colIndex] || ""}
                        >
                          {row[colIndex] || ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls - Bottom */}
          {totalPages > 1 && (
            <div className="flex-shrink-0 flex items-center justify-center mt-3 pt-2 border-t border-gray-200 gap-1">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                ««
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                «
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const startPage = Math.max(1, currentPage - 2);
                const pageNum = startPage + i;
                if (pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-2 py-1 text-xs border rounded ${
                      pageNum === currentPage
                        ? "border-orange-300 text-white"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                    style={
                      pageNum === currentPage
                        ? {
                            backgroundColor:
                              "rgb(255 153 25 / var(--tw-bg-opacity))",
                          }
                        : {}
                    }
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                »
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                »»
              </button>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Mapped Columns:</span>{" "}
            {Object.values(columnMappings).filter((v) => v !== "").length}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={isImporting}
              className="px-6 py-2 text-sm font-medium text-white rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{
                backgroundColor: "rgb(255 153 25 / var(--tw-bg-opacity))",
              }}
            >
              {isImporting && (
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
              {isImporting ? "Importing..." : "Import Data"}
            </button>
          </div>
        </div>

        {/* Resize handles */}
        <div
          className="absolute top-0 right-0 w-4 h-4 cursor-nw-resize opacity-0 hover:opacity-100 transition-opacity"
          onMouseDown={(e) => handleModalMouseDown(e, "top-right")}
          style={{
            background:
              "linear-gradient(-45deg, transparent 30%, #3b82f6 30%, #3b82f6 70%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nw-resize opacity-0 hover:opacity-100 transition-opacity"
          onMouseDown={(e) => handleModalMouseDown(e, "bottom-right")}
          style={{
            background:
              "linear-gradient(45deg, transparent 30%, #3b82f6 30%, #3b82f6 70%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-4 h-4 cursor-ne-resize opacity-0 hover:opacity-100 transition-opacity"
          onMouseDown={(e) => handleModalMouseDown(e, "bottom-left")}
          style={{
            background:
              "linear-gradient(-45deg, transparent 30%, #3b82f6 30%, #3b82f6 70%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-0 left-0 w-4 h-4 cursor-ne-resize opacity-0 hover:opacity-100 transition-opacity"
          onMouseDown={(e) => handleModalMouseDown(e, "top-left")}
          style={{
            background:
              "linear-gradient(45deg, transparent 30%, #3b82f6 30%, #3b82f6 70%, transparent 70%)",
          }}
        />

        {/* Edge resize handles */}
        <div
          className="absolute top-0 left-4 right-4 h-2 cursor-ns-resize opacity-0 hover:opacity-30 hover:bg-blue-500 transition-all"
          onMouseDown={(e) => handleModalMouseDown(e, "top")}
        />
        <div
          className="absolute bottom-0 left-4 right-4 h-2 cursor-ns-resize opacity-0 hover:opacity-30 hover:bg-blue-500 transition-all"
          onMouseDown={(e) => handleModalMouseDown(e, "bottom")}
        />
        <div
          className="absolute left-0 top-4 bottom-4 w-2 cursor-ew-resize opacity-0 hover:opacity-30 hover:bg-blue-500 transition-all"
          onMouseDown={(e) => handleModalMouseDown(e, "left")}
        />
        <div
          className="absolute right-0 top-4 bottom-4 w-2 cursor-ew-resize opacity-0 hover:opacity-30 hover:bg-blue-500 transition-all"
          onMouseDown={(e) => handleModalMouseDown(e, "right")}
        />
      </div>
    </div>
  );
};

export default ExcelPreviewModal;
