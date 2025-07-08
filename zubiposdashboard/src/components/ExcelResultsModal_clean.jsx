import { useState, useRef, useEffect } from "react";
import { departmentService } from "../services/departmentService";
import DepartmentDropdown from "./DepartmentDropdown";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import {
  calculateMarginPercentage,
  calculateUnitCost,
  formatMarginDisplay,
} from "../utils/marginCalculation";

const ExcelResultsModal = ({
  isOpen,
  onClose,
  importResults,
  onAddToPurchaseOrder,
}) => {
  const { token, selectedLocation } = useAuth();
  const { showSuccess, showError, showDeleteConfirm } = useNotification();

  // State
  const [selectedItems, setSelectedItems] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [columnWidths, setColumnWidths] = useState({});
  const [resizing, setResizing] = useState(null);
  const [activeFilterColumn, setActiveFilterColumn] = useState(null);
  const [tempFilterValues, setTempFilterValues] = useState({});
  const [showBulkOperations, setShowBulkOperations] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [bulkUpdateField, setBulkUpdateField] = useState("");
  const [bulkUpdateValue, setBulkUpdateValue] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);
  const [fullDataset, setFullDataset] = useState([]);
  const tableRef = useRef(null);

  // Add validation for required fields
  const validateItem = (item) => {
    const errors = [];

    if (!item.barCode || item.barCode.trim() === "") {
      errors.push("UPC is required");
    }
    if (!item.name || item.name.trim() === "") {
      errors.push("Description is required");
    }
    if (!item.departmentName || item.departmentName.trim() === "") {
      errors.push("Department is required");
    }
    if (!item.quantity || parseFloat(item.quantity) <= 0) {
      errors.push("Qty must be greater than 0");
    }
    if (!item.existingCaseCost || parseFloat(item.existingCaseCost) <= 0) {
      errors.push("Case Cost must be greater than 0");
    }
    if (!item.unitRetail || parseFloat(item.unitRetail) <= 0) {
      errors.push("Unit Retail must be greater than 0");
    }

    return errors;
  };

  // Define columns for the grid - EDI style
  const columns = [
    { key: "select", label: "", width: 50, type: "checkbox" },
    { key: "barCode", label: "UPC", width: 120, type: "text" },
    { key: "name", label: "Description", width: 250, type: "text" },
    {
      key: "departmentName",
      label: "Department",
      width: 120,
      type: "dropdown",
    },
    { key: "quantity", label: "Qty", width: 80, type: "number" },
    { key: "unitCase", label: "Unit In Case", width: 120, type: "number" },
    {
      key: "existingCaseCost",
      label: "Case Cost",
      width: 120,
      type: "currency",
    },
    { key: "unitCost", label: "Unit Cost", width: 120, type: "currency" },
    { key: "unitRetail", label: "Unit Retail", width: 120, type: "currency" },
    { key: "margin", label: "Margin", width: 100, type: "percentage" },
    { key: "status", label: "Status", width: 100, type: "text" },
    { key: "actions", label: "Actions", width: 80, type: "action" },
  ];

  // Load departments on modal open
  useEffect(() => {
    const loadDepartments = async () => {
      if (!isOpen || !token || !selectedLocation?.id) return;

      try {
        const response = await departmentService.getDepartments(
          token,
          selectedLocation.id,
        );
        if (response.status === "success" && response.data) {
          setDepartments(response.data);
        }
      } catch (error) {
        console.error("Error loading departments:", error);
        setDepartments([]);
      }
    };
    loadDepartments();
  }, [isOpen, token, selectedLocation]);

  // Initialize full dataset and filtered data
  useEffect(() => {
    if (importResults) {
      const newProducts = (importResults.NewProduct || []).map(
        (item, index) => ({
          ...item,
          id: item.id || `new-item-${Date.now()}-${index}`,
          status: "NEW",
        }),
      );

      const oldProducts = (importResults.OldProduct || []).map(
        (item, index) => ({
          ...item,
          id: item.id || `old-item-${Date.now()}-${index}`,
          status: "EXISTING",
        }),
      );

      const allItems = [...newProducts, ...oldProducts].filter(
        (item) => item !== null && item !== undefined,
      );

      // Recalculate margins, unit cost and set tax, age, ebt based on department
      const itemsWithCalculations = allItems.map((item) => {
        const unitCost = calculateUnitCost(
          item.existingCaseCost,
          item.unitCase,
        );
        const margin = calculateMarginPercentage(
          item.unitRetail,
          item.existingCaseCost,
          item.unitCase,
        );

        let updatedItem = {
          ...item,
          unitCost,
          margin,
        };

        // Set tax, age, and ebt based on department if departments are loaded
        if (item.departmentName && departments.length > 0) {
          const selectedDepartment = departments.find(
            (dept) => dept.name === item.departmentName,
          );
          if (selectedDepartment) {
            updatedItem.tax = selectedDepartment.tax
              ? selectedDepartment.tax.name
              : "no tax";
            updatedItem.age = selectedDepartment.minAge
              ? selectedDepartment.minAge.minAge
              : "no restriction";
            updatedItem.ebt = selectedDepartment.ebt || false;
          }
        }

        return updatedItem;
      });

      setFullDataset(itemsWithCalculations);
      setFilteredData(itemsWithCalculations);

      // Initialize column widths
      const initialWidths = {};
      columns.forEach((col) => {
        initialWidths[col.key] = col.width;
      });
      setColumnWidths(initialWidths);
    }
  }, [importResults, departments]);

  // Format value based on column type
  const formatValue = (value, column) => {
    if (column.type === "currency") {
      return `$${(parseFloat(value) || 0).toFixed(2)}`;
    }
    if (column.type === "percentage") {
      return formatMarginDisplay(parseFloat(value) || 0);
    }
    return value || "";
  };

  // Check if item has validation errors
  const hasValidationError = (item, field) => {
    return validationErrors.some(
      (error) =>
        error.item.id === item.id &&
        error.issues.some((issue) =>
          issue.toLowerCase().includes(field.toLowerCase()),
        ),
    );
  };

  // Render cell content - matching EDI Import style
  const renderCell = (row, column, rowIndex) => {
    const value = row[column.key];
    const isEditing = editingItem && editingItem.id === row.id;

    if (column.key === "select") {
      return (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={selectedItems[row.id] || false}
            onChange={() => handleItemSelect(row.id)}
            className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
          />
        </div>
      );
    }

    if (column.key === "actions") {
      return (
        <div className="flex items-center justify-center gap-1">
          {isEditing ? (
            <>
              <button
                onClick={handleEditSave}
                className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
                title="Save changes"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </button>
              <button
                onClick={handleEditCancel}
                className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                title="Cancel editing"
              >
                <svg
                  className="w-4 h-4"
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
            </>
          ) : (
            <>
              <button
                onClick={() => handleEditClick(row)}
                className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                title="Edit item"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                onClick={() => handleDeleteItem(row.id)}
                className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                title="Delete item"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      );
    }

    if (column.key === "status") {
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            row.status === "NEW"
              ? "bg-blue-100 text-blue-800"
              : "bg-orange-100 text-orange-800"
          }`}
        >
          {row.status === "NEW" ? "NEW" : "EXISTING"}
        </span>
      );
    }

    // Handle inline editing for editable cells
    const editableCells = [
      "barCode",
      "name",
      "departmentName",
      "quantity",
      "unitCase",
      "existingCaseCost",
      "unitRetail",
    ];
    if (isEditing && editableCells.includes(column.key)) {
      if (column.key === "departmentName") {
        return (
          <div className="w-full min-w-40">
            <DepartmentDropdown
              value={editingItem.departmentName || ""}
              onChange={(newValue) =>
                handleEditChange("departmentName", newValue)
              }
              placeholder="Select Department"
            />
          </div>
        );
      } else {
        return (
          <input
            type={
              column.type === "currency" || column.type === "number"
                ? "number"
                : "text"
            }
            value={editingItem[column.key] || ""}
            onChange={(e) => handleEditChange(column.key, e.target.value)}
            step={column.type === "currency" ? "0.01" : undefined}
            className="w-full px-2 py-1 text-sm border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        );
      }
    }

    // Auto-calculated fields during editing
    if ((column.key === "unitCost" || column.key === "margin") && isEditing) {
      const unitCost = calculateUnitCost(
        editingItem.existingCaseCost,
        editingItem.unitCase,
      );
      const margin = calculateMarginPercentage(
        editingItem.unitRetail,
        editingItem.existingCaseCost,
        editingItem.unitCase,
      );

      return (
        <div className="px-2 py-1 rounded text-sm bg-gray-50 text-gray-600">
          {column.key === "unitCost"
            ? `$${unitCost.toFixed(2)} (auto-calculated)`
            : `${formatMarginDisplay(margin)} (auto-calculated)`}
        </div>
      );
    }

    // Check if this cell has validation error
    const hasError = hasValidationError(row, column.key);

    // Apply margin color formatting
    const getMarginColorClass = () => {
      if (column.type === "percentage" && parseFloat(value) <= 0) {
        return "text-red-600 font-medium";
      }
      return "";
    };

    return (
      <div
        className={`px-2 py-1 rounded text-sm ${
          hasError ? "bg-red-100 border border-red-300 text-red-700" : ""
        } ${getMarginColorClass()}`}
      >
        {formatValue(value, column)}
        {hasError && (
          <svg
            className="w-3 h-3 text-red-500 inline-block ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
      </div>
    );
  };

  // Item selection handlers
  const handleItemSelect = (itemId) => {
    const newSelectedItems = {
      ...selectedItems,
      [itemId]: !selectedItems[itemId],
    };
    setSelectedItems(newSelectedItems);

    const selectedCount =
      Object.values(newSelectedItems).filter(Boolean).length;
    setShowBulkOperations(selectedCount > 0);
    setSelectAll(selectedCount === filteredData.length);
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    const newSelectedItems = {};
    if (newSelectAll) {
      filteredData.forEach((item) => {
        newSelectedItems[item.id] = true;
      });
    }
    setSelectedItems(newSelectedItems);
    setShowBulkOperations(newSelectAll && filteredData.length > 0);
  };

  // Edit handlers
  const handleEditClick = (item) => {
    setEditingItem({ ...item });
  };

  const handleEditSave = () => {
    if (!editingItem) return;

    // Recalculate margin and unit cost
    const unitCost = calculateUnitCost(
      editingItem.existingCaseCost,
      editingItem.unitCase,
    );
    const margin = calculateMarginPercentage(
      editingItem.unitRetail,
      editingItem.existingCaseCost,
      editingItem.unitCase,
    );

    const updatedItem = {
      ...editingItem,
      unitCost,
      margin,
    };

    // Update both full dataset and filtered data
    setFullDataset((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
    );
    setFilteredData((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
    );
    setEditingItem(null);
  };

  const handleEditCancel = () => {
    setEditingItem(null);
  };

  const handleEditChange = (field, value) => {
    if (field === "departmentName") {
      // Find the selected department and auto-set tax, age, and ebt
      const selectedDepartment = departments.find(
        (dept) => dept.name === value,
      );

      if (selectedDepartment) {
        setEditingItem((prev) => ({
          ...prev,
          [field]: value,
          tax: selectedDepartment.tax ? selectedDepartment.tax.name : "no tax",
          age: selectedDepartment.minAge
            ? selectedDepartment.minAge.minAge
            : "no restriction",
          ebt: selectedDepartment.ebt || false,
        }));
      } else {
        setEditingItem((prev) => {
          const updated = {
            ...prev,
            [field]: value,
          };

          // Recalculate unit cost and margin if cost or retail fields change
          if (["existingCaseCost", "unitCase", "unitRetail"].includes(field)) {
            updated.unitCost = calculateUnitCost(
              updated.existingCaseCost,
              updated.unitCase,
            );
            updated.margin = calculateMarginPercentage(
              updated.unitRetail,
              updated.existingCaseCost,
              updated.unitCase,
            );
          }

          return updated;
        });
      }
    } else {
      setEditingItem((prev) => {
        const updated = {
          ...prev,
          [field]: value,
        };

        // Recalculate unit cost and margin if cost or retail fields change
        if (["existingCaseCost", "unitCase", "unitRetail"].includes(field)) {
          updated.unitCost = calculateUnitCost(
            updated.existingCaseCost,
            updated.unitCase,
          );
          updated.margin = calculateMarginPercentage(
            updated.unitRetail,
            updated.existingCaseCost,
            updated.unitCase,
          );
        }

        return updated;
      });
    }
  };

  // Delete function
  const handleDeleteItem = (itemId) => {
    showDeleteConfirm(
      "Delete Item",
      "Are you sure you want to delete this item?",
      () => {
        setFullDataset((prev) => prev.filter((item) => item.id !== itemId));
        setFilteredData((prev) => prev.filter((item) => item.id !== itemId));
        setSelectedItems((prev) => {
          const newSelected = { ...prev };
          delete newSelected[itemId];
          return newSelected;
        });
      },
    );
  };

  const handleAddAllItems = () => {
    if (filteredData.length === 0) {
      showError(
        "No Items Available",
        "No items available to add to Purchase Order",
      );
      return;
    }

    // Validate all items
    const errors = [];
    filteredData.forEach((item, index) => {
      const itemErrors = validateItem(item);
      if (itemErrors.length > 0) {
        errors.push({
          index,
          item,
          issues: itemErrors,
        });
      }
    });

    setValidationErrors(errors);

    if (errors.length > 0) {
      return; // Don't proceed if there are validation errors
    }

    // Convert to the format expected by the Purchase Order
    const formattedItems = filteredData.map((item) => ({
      id: Date.now() + Math.random(), // Generate unique ID for grid
      product: item.name || "",
      unit: "EA",
      upc: item.barCode || "",
      description: item.name || "",
      department: item.departmentName || "",
      quantity: parseFloat(item.quantity) || 1,
      age: item.age || "no restriction",
      tax: item.tax || "no tax",
      ebt: item.ebt || false,
      unitCase: parseInt(item.unitCase) || 1,
      caseCost: parseFloat(item.existingCaseCost) || 0,
      retail: parseFloat(item.unitRetail) || 0,
      margin: parseFloat(item.margin) || 0,
      unitCost: parseFloat(item.unitCost) || 0,
      totalCost:
        (parseFloat(item.quantity) || 1) *
        (parseFloat(item.existingCaseCost) || 0),
    }));

    onAddToPurchaseOrder(formattedItems);
    onClose();
  };

  // Pagination
  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  if (!isOpen || !importResults) return null;

  const selectedCount = Object.values(selectedItems).filter(Boolean).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Import Results
            </h2>
            <div className="flex items-center gap-4 mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ {importResults.status}
              </span>
              <span className="text-sm text-gray-600">
                {importResults.count} items processed
              </span>
              {importResults.NewProduct?.length > 0 && (
                <span className="text-sm text-blue-600">
                  {importResults.NewProduct.length} new products
                </span>
              )}
              {importResults.OldProduct?.length > 0 && (
                <span className="text-sm text-orange-600">
                  {importResults.OldProduct.length} existing products
                </span>
              )}
            </div>
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

        {/* Data Grid Section */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Grid Header with Controls */}
          <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Imported Items ({filteredData.length} of {totalRows})
              </h3>
              <button
                onClick={handleAddAllItems}
                disabled={filteredData.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add All to Purchase Order ({filteredData.length} items)
              </button>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-3">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <h4 className="font-medium text-red-900 mb-1 text-sm">
                      Validation Errors Found
                    </h4>
                    <p className="text-xs text-red-700 mb-1">
                      {validationErrors.length} row(s) have validation errors.
                      Please fix the highlighted rows before adding to Purchase
                      Order.
                    </p>
                    <div className="text-xs text-red-600 space-y-1">
                      {validationErrors.slice(0, 3).map((error, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="font-medium">
                            Row {error.index + 1}:
                          </span>
                          <span>{error.item.name || error.item.barCode}</span>
                          <span className="text-red-500">-</span>
                          <span>{error.issues.join(", ")}</span>
                        </div>
                      ))}
                      {validationErrors.length > 3 && (
                        <div className="text-red-500 font-medium">
                          ... and {validationErrors.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setValidationErrors([])}
                    className="text-red-400 hover:text-red-600"
                  >
                    <svg
                      className="w-4 h-4"
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
              </div>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(endIndex, totalRows)} of{" "}
                  {totalRows} rows
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) =>
                    handleItemsPerPageChange(parseInt(e.target.value))
                  }
                  className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600 mx-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Data Grid */}
          <div className="flex-1 overflow-auto">
            <table ref={tableRef} className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="relative px-3 py-3 text-left group"
                      style={{ width: columnWidths[column.key] }}
                    >
                      {column.key === "select" ? (
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                            className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                            title="Select all visible rows"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            {column.label}
                          </span>
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedData.map((item, index) => {
                  const hasValidationError = validationErrors.some(
                    (error) => error.item.id === item.id,
                  );
                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        hasValidationError
                          ? "bg-red-50 border-red-200 hover:bg-red-100"
                          : selectedItems[item.id]
                            ? "bg-orange-50"
                            : editingItem?.id === item.id
                              ? "bg-blue-50"
                              : "hover:bg-gray-50"
                      }`}
                    >
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className="px-3 py-2 border-r border-gray-100 last:border-r-0"
                          style={{ width: columnWidths[column.key] }}
                        >
                          {renderCell(item, column, index)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="text-sm text-gray-600">
            {selectedCount > 0 && (
              <span>
                {selectedCount} of {totalRows} items selected
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelResultsModal;
