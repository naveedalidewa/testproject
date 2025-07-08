import { useState, useEffect, useRef, useCallback } from "react";
import { useNotification } from "../../contexts/NotificationContext";
import { useAuth } from "../../contexts/AuthContext";
import { allItemsService } from "../../services/allItemsService";
import { inventoryService } from "../../services/inventoryService";
import { departmentService } from "../../services/departmentService";
import { getTaxOptions, getAllTax } from "../../services/taxService";
import { getAgeOptions, getMinAge } from "../../services/ageService";
import {
  calculateMarginPercentage,
  calculateUnitCost,
  formatMarginDisplay,
} from "../../utils/marginCalculation";
import * as XLSX from "xlsx";
import DepartmentDropdown from "../DepartmentDropdown";
import TaxDropdown from "../TaxDropdown";
import AgeDropdown from "../AgeDropdown";
import SearchableDropdown from "../SearchableDropdown";
import DateRangePicker from "../DateRangePicker";
import { getVendors } from "../../services/vendorService";
import { uploadMedia } from "../../services/mediaService";
import {
  addProduct,
  addProductmodifier,
  addMultiPack,
  updateMultiPack,
  getItemFunctions,
  updatedItemsValues,
} from "../../services/productService";

const ItemsList = () => {
  const { showError, showSuccess, showWarning } = useNotification();
  const { token, selectedLocation } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const tableRef = useRef(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filter states
  const [filters, setFilters] = useState({
    payeeId: "",
    categoryId: "",
    departmentId: "",
    priceGroupId: "",
    type: 1,
    locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
    search: "",
    price: { operator: "", value: "" },
    caseCost: { operator: "", value: "" },
    margin: { operator: "", value: "" },
  });

  // Column configuration
  const [columns, setColumns] = useState([
    {
      key: "scanCode",
      label: "UPC",
      width: 150,
      visible: true,
      resizable: true,
    },
    {
      key: "description",
      label: "Description",
      width: 643,
      visible: true,
      resizable: true,
    },
    {
      key: "department",
      label: "Department",
      width: 188,
      visible: true,
      resizable: true,
    },
    {
      key: "quantity",
      label: "Qty",
      width: 80,
      visible: true,
      resizable: true,
    },
    {
      key: "unitCase",
      label: "UNIT IN CASE",
      width: 64,
      visible: true,
      resizable: true,
    },
    {
      key: "caseCost",
      label: "CASE COST",
      width: 83,
      visible: true,
      resizable: true,
    },
    {
      key: "unitCost",
      label: "UNIT COST",
      width: 80,
      visible: true,
      resizable: true,
    },
    {
      key: "unitRetail",
      label: "UNIT RETAIL",
      width: 91,
      visible: true,
      resizable: true,
    },
    {
      key: "margin",
      label: "MARGIN",
      width: 57,
      visible: true,
      resizable: true,
    },
    {
      key: "actions",
      label: "ACTION",
      width: 100,
      visible: true,
      resizable: false,
    },
  ]);

  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  // Filter state
  const [columnFilters, setColumnFilters] = useState({});
  const [activeFilterColumn, setActiveFilterColumn] = useState(null);

  // Modal states
  const [newItemModalOpen, setNewItemModalOpen] = useState(false);
  const [importExcelModalOpen, setImportExcelModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEditItem, setSelectedEditItem] = useState(null);
  const [itemOverviewModalOpen, setItemOverviewModalOpen] = useState(false);
  const [selectedOverviewItem, setSelectedOverviewItem] = useState(null);

  // Action dropdown state
  const [actionDropdownOpen, setActionDropdownOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());

  // Column resizing
  const [resizing, setResizing] = useState(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // Bulk update states
  const [bulkUpdateOpen, setBulkUpdateOpen] = useState(false);
  const [bulkUpdateField, setBulkUpdateField] = useState("");
  const [bulkUpdateValue, setBulkUpdateValue] = useState("");

  // Bulk update field options
  const bulkUpdateFields = [
    { key: "department", label: "Department" },
    { key: "caseCost", label: "Case Cost" },
    { key: "unitRetail", label: "Unit Retail" },
    { key: "unitCase", label: "Unit in Case" },
    { key: "margin", label: "Margin" },
  ];

  // Load items data
  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const requestData = {
        ...filters,
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        columnFilters: columnFilters, // Send column filters to API
      };

      const response = await allItemsService.getAllItems(requestData, token);

      if (response.success) {
        // Map API response to table format with calculated fields
        const mappedItems = response.data.map((item) => ({
          ...item,
          unitCost: calculateUnitCost(
            parseFloat(item.caseCost),
            parseInt(item.unitCase),
          ),
          margin: calculateMarginPercentage(
            parseFloat(item.unitRetail),
            parseFloat(item.caseCost),
            parseInt(item.unitCase),
          ),
          quantity: 1, // Default quantity
          department: "General", // Default department - you may want to add this to API
        }));

        setItems(mappedItems);
        setTotalItems(response.pagination?.totalItems || mappedItems.length);
        setTotalPages(
          response.pagination?.totalPages ||
            Math.ceil(mappedItems.length / itemsPerPage),
        );
      } else {
        setError("Failed to load items");
        showError("Error", "Failed to load items data");
      }
    } catch (err) {
      setError("Error loading items: " + err.message);
      showError("Error", `Error loading items: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [
    filters,
    currentPage,
    itemsPerPage,
    searchTerm,
    columnFilters,
    token,
    showError,
  ]);

  // Load items on mount and when dependencies change
  useEffect(() => {
    if (token) {
      loadItems();
    }
  }, [filters, currentPage, itemsPerPage, searchTerm, columnFilters, token]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".filter-dropdown") &&
        !event.target.closest('button[title="Filter column"]')
      ) {
        setActiveFilterColumn(null);
      }
    };

    if (activeFilterColumn) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeFilterColumn]);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    // Items will be loaded automatically due to useEffect dependencies
  };

  // Get sort icon - matching DataGrid style
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return (
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }

    return sortConfig.direction === "asc" ? (
      <svg
        className="w-4 h-4 text-orange-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        className="w-4 h-4 text-orange-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
  };

  // Filter options based on column type
  const getFilterOptions = (columnKey) => {
    const numericColumns = [
      "quantity",
      "unitCase",
      "caseCost",
      "unitCost",
      "unitRetail",
      "margin",
    ];
    const isNumeric = numericColumns.includes(columnKey);

    if (isNumeric) {
      return [
        { value: "equals", label: "Equals" },
        { value: "not_equals", label: "Not Equals" },
        { value: "greater_than", label: "Greater Than" },
        { value: "less_than", label: "Less Than" },
        { value: "between", label: "Between" },
        { value: "is_empty", label: "Is Empty" },
        { value: "is_not_empty", label: "Is Not Empty" },
      ];
    } else {
      return [
        { value: "equals", label: "Equals" },
        { value: "not_equals", label: "Not Equals" },
        { value: "contains", label: "Contains" },
        { value: "not_contains", label: "Does Not Contain" },
        { value: "starts_with", label: "Starts With" },
        { value: "ends_with", label: "Ends With" },
        { value: "is_empty", label: "Is Empty" },
        { value: "is_not_empty", label: "Is Not Empty" },
      ];
    }
  };

  // Handle filter changes
  const handleFilterChange = (columnKey, filterType, value, value2 = null) => {
    setColumnFilters((prev) => ({
      ...prev,
      [columnKey]: {
        type: filterType,
        value: value,
        value2: value2, // For 'between' filter
      },
    }));
    // Reset to first page when applying filters
    setCurrentPage(1);
  };

  // Clear filter for a column
  const clearColumnFilter = (columnKey) => {
    setColumnFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[columnKey];
      return newFilters;
    });
    // Reset to first page when clearing filters
    setCurrentPage(1);
  };

  // Get filter icon
  const getFilterIcon = (columnKey) => {
    const hasFilter = columnFilters[columnKey];
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          setActiveFilterColumn(
            activeFilterColumn === columnKey ? null : columnKey,
          );
        }}
        className={`p-1 rounded hover:bg-gray-200 transition-colors ${
          hasFilter ? "text-orange-600" : "text-gray-400"
        }`}
        title="Filter column"
      >
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
          />
        </svg>
      </button>
    );
  };

  // Handle sorting
  const handleSort = (columnKey) => {
    let direction = "asc";
    if (sortConfig.key === columnKey && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key: columnKey, direction });

    // Sort items locally
    const sortedItems = [...items].sort((a, b) => {
      const aVal = a[columnKey];
      const bVal = b[columnKey];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === "string") {
        return direction === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === "number") {
        return direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    setItems(sortedItems);
  };

  // Handle column resizing
  const handleMouseDown = (e, columnKey) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(columnKey);
    startXRef.current = e.clientX;
    const column = columns.find((col) => col.key === columnKey);
    startWidthRef.current = column.width;

    // Add cursor style to body
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (e) => {
      const diff = e.clientX - startXRef.current;
      const newWidth = Math.max(60, startWidthRef.current + diff);

      setColumns((prev) =>
        prev.map((col) =>
          col.key === columnKey ? { ...col, width: newWidth } : col,
        ),
      );
    };

    const handleMouseUp = () => {
      setResizing(null);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Cleanup resize state on unmount
  useEffect(() => {
    return () => {
      if (resizing) {
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        setResizing(null);
      }
    };
  }, [resizing]);

  // Handle item selection
  const handleItemSelect = (productId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((item) => item.productId)));
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    try {
      const exportData = items.map((item) => ({
        UPC: item.scanCode,
        Description: item.description,
        Department: item.department,
        Qty: item.quantity,
        "Unit in Case": item.unitCase,
        "Case Cost": item.caseCost,
        "Unit Cost": item.unitCost,
        "Unit Retail": item.unitRetail,
        "Margin %": item.margin,
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Items");

      XLSX.writeFile(
        workbook,
        `items_export_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      showSuccess("Success", "Items exported to Excel successfully");
    } catch (error) {
      showError("Export Error", "Failed to export items to Excel");
    }
  };

  // Action handlers
  const handleBulkAction = (action) => {
    console.log(`Performing ${action} on ${selectedItems.size} items`);
    setActionDropdownOpen(false);
    // Implement bulk actions here
  };

  // Handle bulk update
  const handleBulkUpdate = async () => {
    if (!bulkUpdateField || !bulkUpdateValue || selectedItems.size === 0) {
      showError(
        "Invalid Update",
        "Please select field, value, and items to update",
      );
      return;
    }

    try {
      setLoading(true);

      const selectedItemIds = Array.from(selectedItems);
      console.log("Selected item IDs:", selectedItemIds);

      // Find the selected items from the items array
      const selectedItemsData = items.filter((item) =>
        selectedItemIds.includes(item.productId),
      );

      console.log("Selected items data:", selectedItemsData);

      if (selectedItemsData.length === 0) {
        throw new Error("No matching items found for selected IDs");
      }

      // Build update payload with better error handling
      const updatePayload = {
        updateItems: selectedItemsData.map((item) => {
          console.log("Processing item:", item);

          const mappedItem = {
            description:
              bulkUpdateField === "description"
                ? bulkUpdateValue
                : item.description || "",
            productPriceId: item.productPriceId || "",
            unitCase:
              bulkUpdateField === "unitCase"
                ? bulkUpdateValue
                : (item.unitCase || item.unitInCase || "1").toString(),
            caseCost:
              bulkUpdateField === "caseCost"
                ? bulkUpdateValue
                : (item.caseCost || "0.00").toString(),
            unitAfterDiscount: item.unitAfterDiscount || "0.00",
            unitRetail:
              bulkUpdateField === "unitRetail"
                ? bulkUpdateValue
                : (item.unitRetail || "0.00").toString(),
            margin:
              bulkUpdateField === "margin"
                ? bulkUpdateValue.replace("%", "")
                : (item.margin || "0").toString().replace("%", ""),
            productId: item.productId || "",
            locationId: selectedLocation.id,
          };

          console.log("Mapped item:", mappedItem);
          return mappedItem;
        }),
      };

      console.log("Bulk update payload:", updatePayload);

      const response = await updatedItemsValues(token, updatePayload);

      if (response.status === "success") {
        showSuccess(
          "Success",
          `Updated ${selectedItemsData.length} items successfully`,
        );

        // Refresh items list to show updated values
        loadItems();
      } else {
        showError(
          "Update Failed",
          response.message || "Failed to update items",
        );
      }
    } catch (error) {
      console.error("Error bulk updating items:", error);
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
      showError(
        "Update Error",
        `An error occurred while updating items: ${error.message}`,
      );
    } finally {
      setLoading(false);
      // Reset form
      setBulkUpdateField("");
      setBulkUpdateValue("");
      setSelectedItems(new Set());
    }
  };

  const handleDeleteSelected = () => {
    if (selectedItems.size === 0) {
      showError("Delete Failed", "Please select items to delete");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedItems.size} selected items? This action cannot be undone.`,
      )
    ) {
      const selectedItemIds = Array.from(selectedItems);
      console.log("Deleting items:", selectedItemIds);

      showSuccess(
        "Delete Complete",
        `Deleted ${selectedItems.size} items successfully`,
      );

      // Reset selection
      setSelectedItems(new Set());
    }
  };

  // Filter Dropdown Component
  const FilterDropdown = ({ columnKey, onClose }) => {
    const [filterType, setFilterType] = useState(
      columnFilters[columnKey]?.type || "equals",
    );
    const [filterValue, setFilterValue] = useState(
      columnFilters[columnKey]?.value || "",
    );
    const [filterValue2, setFilterValue2] = useState(
      columnFilters[columnKey]?.value2 || "",
    );
    const options = getFilterOptions(columnKey);
    const numericColumns = [
      "quantity",
      "unitCase",
      "caseCost",
      "unitCost",
      "unitRetail",
      "margin",
    ];
    const isNumeric = numericColumns.includes(columnKey);

    const applyFilter = () => {
      if (
        filterType === "is_empty" ||
        filterType === "is_not_empty" ||
        (filterType === "between" && filterValue && filterValue2) ||
        (filterType !== "between" && filterValue)
      ) {
        handleFilterChange(columnKey, filterType, filterValue, filterValue2);
        onClose();
      }
    };

    const clearFilter = () => {
      clearColumnFilter(columnKey);
      onClose();
    };

    return (
      <div className="filter-dropdown absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-[9999] w-72">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Filter Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {filterType !== "is_empty" && filterType !== "is_not_empty" && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {filterType === "between" ? "From Value" : "Value"}
              </label>
              <input
                type={isNumeric ? "number" : "text"}
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                placeholder="Enter value..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}

          {filterType === "between" && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                To Value
              </label>
              <input
                type={isNumeric ? "number" : "text"}
                value={filterValue2}
                onChange={(e) => setFilterValue2(e.target.value)}
                placeholder="Enter end value..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={applyFilter}
              className="px-3 py-1.5 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm"
            >
              Apply
            </button>
            <button
              onClick={clearFilter}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
            >
              Clear
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Icons
  const SearchIcon = () => (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );

  const SortIcon = ({ direction }) => (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d={direction === "asc" ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
      />
    </svg>
  );

  const ChevronDownIcon = () => (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );

  const DownloadIcon = () => (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="max-w-8xl mx-auto">
        {/* Header with Search and Actions */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Items Management
            </h1>
            <p className="text-gray-600">Manage your inventory items</p>
          </div>
          <div className="flex items-center gap-3"></div>
          <input
            placeholder="Search items..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent block mt-auto"
            style={{ width: "331px" }}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-center">
              <div
                className="animate-spin rounded-full h-8 w-8 border-b-2"
                style={{
                  borderColor: "rgb(255 153 25 / var(--tw-bg-opacity))",
                }}
              ></div>
              <span className="ml-3 text-gray-600">Loading items...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="text-red-500 text-lg mb-2">⚠️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Error</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => loadItems()}
                className="text-white px-4 py-2 rounded-md text-sm font-semibold"
                style={{
                  backgroundColor: "rgb(255 153 25 / var(--tw-bg-opacity))",
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Items Table */}
        {!loading && !error && (
          <div className="relative">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Items Grid
                  </h3>
                  <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 text-xs font-bold text-white bg-orange-500 rounded-full">
                    {items.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Search Input Section */}
                  <div className="relative group">
                    <div className="flex flex-row"></div>
                  </div>

                  {/* EDI/File Import - keeping empty for now */}
                  <div className="relative group"></div>

                  {/* Action Buttons Section */}
                  <div className="relative group">
                    <div className="flex flex-row gap-2">
                      <button
                        onClick={() => setNewItemModalOpen(true)}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        <span>New Item</span>
                      </button>
                      <button
                        onClick={() => setImportExcelModalOpen(true)}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                          />
                        </svg>
                        <span>Import Excel</span>
                      </button>
                      <button
                        onClick={handleExportExcel}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <DownloadIcon />
                        <span className="ml-1">Export Excel</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bulk Update Section - shown when items are selected */}
              {selectedItems.size > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-orange-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 bg-orange-600 text-white text-xs font-bold rounded-full">
                        {selectedItems.size}
                      </div>
                      <span className="text-sm font-medium text-orange-900">
                        {selectedItems.size} item
                        {selectedItems.size > 1 ? "s" : ""} selected
                      </span>
                      <button
                        onClick={() => setSelectedItems(new Set())}
                        className="text-orange-600 hover:text-orange-800 text-sm"
                      >
                        Clear selection
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    {/* Field Selection */}
                    <div className="md:col-span-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Update Field
                      </label>
                      <select
                        value={bulkUpdateField}
                        onChange={(e) => setBulkUpdateField(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Select field...</option>
                        {bulkUpdateFields.map((field) => (
                          <option key={field.key} value={field.key}>
                            {field.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Value Input */}
                    <div className="md:col-span-4">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        New Value
                      </label>
                      {bulkUpdateField === "department" ? (
                        <DepartmentDropdown
                          value={bulkUpdateValue}
                          onChange={(value) => setBulkUpdateValue(value)}
                          placeholder="Select department..."
                        />
                      ) : (
                        <input
                          type={
                            bulkUpdateField?.includes("Cost") ||
                            bulkUpdateField === "unitRetail"
                              ? "number"
                              : "text"
                          }
                          value={bulkUpdateValue}
                          onChange={(e) => {
                            let value = e.target.value;
                            if (bulkUpdateField === "margin") {
                              // Only allow numbers and % symbol for margin
                              value = value.replace(/[^0-9.%]/g, "");
                              // Ensure only one % symbol at the end
                              if (value.includes("%")) {
                                value = value.replace(/%/g, "") + "%";
                              }
                            }
                            setBulkUpdateValue(value);
                          }}
                          placeholder={
                            bulkUpdateField === "margin"
                              ? "Enter percentage (e.g., 25%)"
                              : "Enter new value..."
                          }
                          step={
                            bulkUpdateField?.includes("Cost") ||
                            bulkUpdateField === "unitRetail"
                              ? "0.01"
                              : undefined
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="md:col-span-5 flex gap-2">
                      <button
                        onClick={handleBulkUpdate}
                        disabled={!bulkUpdateField || !bulkUpdateValue}
                        className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md transition-colors"
                      >
                        Update Selected ({selectedItems.size})
                      </button>
                      <button
                        onClick={handleDeleteSelected}
                        disabled={selectedItems.size === 0}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md transition-colors"
                      >
                        Inactive Selected ({selectedItems.size})
                      </button>
                      <button
                        onClick={() => {
                          setBulkUpdateField("");
                          setBulkUpdateValue("");
                        }}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div
                className={`overflow-x-auto ${activeFilterColumn ? "overflow-visible" : ""}`}
              >
                <table className="w-full">
                  {/* Table Header */}
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {/* Select All Checkbox */}
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={
                            selectedItems.size === items.length &&
                            items.length > 0
                          }
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                      </th>
                      {columns
                        .filter((col) => col.visible)
                        .map((column) => (
                          <th
                            key={column.key}
                            className="relative px-3 py-3 text-left group"
                            style={{ width: column.width }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    column.key !== "actions" &&
                                    handleSort(column.key)
                                  }
                                  className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-orange-600 transition-colors"
                                >
                                  {column.label}
                                  {column.key !== "actions" &&
                                    getSortIcon(column.key)}
                                </button>
                                {column.key !== "actions" && (
                                  <div className="relative">
                                    {getFilterIcon(column.key)}
                                    {activeFilterColumn === column.key && (
                                      <FilterDropdown
                                        columnKey={column.key}
                                        onClose={() =>
                                          setActiveFilterColumn(null)
                                        }
                                      />
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Resize handle */}
                              {column.resizable && (
                                <div
                                  className={`absolute right-0 top-0 bottom-0 w-3 cursor-col-resize transition-all ${
                                    resizing === column.key
                                      ? "bg-orange-500 opacity-100"
                                      : "bg-gray-300 opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-orange-400"
                                  }`}
                                  onMouseDown={(e) =>
                                    handleMouseDown(e, column.key)
                                  }
                                  title="Drag to resize column"
                                />
                              )}
                            </div>
                          </th>
                        ))}
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody className="divide-y divide-gray-100">
                    {items.map((item, index) => (
                      <tr
                        key={item.productId}
                        className={`hover:bg-gray-50 transition-colors ${selectedItems.has(item.productId) ? "bg-orange-50" : ""}`}
                      >
                        {/* Select Checkbox */}
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(item.productId)}
                            onChange={() => handleItemSelect(item.productId)}
                            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                          />
                        </td>

                        {/* UPC */}
                        <td
                          className="px-3 py-2 border-r border-gray-100 last:border-r-0"
                          style={{ width: columns[0].width }}
                        >
                          <div className="px-2 py-1 rounded text-sm font-normal cursor-pointer hover:bg-gray-50">
                            {item.scanCode}
                          </div>
                        </td>

                        {/* Description */}
                        <td
                          className="px-3 py-2 border-r border-gray-100 last:border-r-0"
                          style={{ width: columns[1].width }}
                        >
                          <div
                            className="px-2 py-1 rounded text-sm font-normal cursor-pointer hover:bg-gray-50"
                            title={item.description}
                          >
                            {item.description}
                          </div>
                        </td>

                        {/* Department */}
                        <td
                          className="px-3 py-2 border-r border-gray-100 last:border-r-0"
                          style={{ width: columns[2].width }}
                        >
                          <div className="px-2 py-1 rounded text-sm font-normal cursor-pointer hover:bg-gray-50">
                            {item.department}
                          </div>
                        </td>

                        {/* Qty */}
                        <td
                          className="px-3 py-2 border-r border-gray-100 last:border-r-0"
                          style={{ width: columns[3].width }}
                        >
                          <div className="px-2 py-1 rounded text-sm font-normal cursor-pointer hover:bg-gray-50">
                            {item.quantity}
                          </div>
                        </td>

                        {/* Unit in Case */}
                        <td
                          className="px-3 py-2 border-r border-gray-100 last:border-r-0"
                          style={{ width: columns[4].width }}
                        >
                          <div className="px-2 py-1 rounded text-sm font-normal cursor-pointer hover:bg-gray-50">
                            {item.unitCase}
                          </div>
                        </td>

                        {/* Case Cost */}
                        <td
                          className="px-3 py-2 border-r border-gray-100 last:border-r-0"
                          style={{ width: columns[5].width }}
                        >
                          <div className="px-2 py-1 rounded text-sm font-normal cursor-pointer hover:bg-gray-50">
                            ${parseFloat(item.caseCost).toFixed(2)}
                          </div>
                        </td>

                        {/* Unit Cost */}
                        <td
                          className="px-3 py-2 border-r border-gray-100 last:border-r-0"
                          style={{ width: columns[6].width }}
                        >
                          <div className="px-2 py-1 rounded text-sm font-normal cursor-pointer hover:bg-gray-50">
                            ${item.unitCost.toFixed(2)}
                          </div>
                        </td>

                        {/* Unit Retail */}
                        <td
                          className="px-3 py-2 border-r border-gray-100 last:border-r-0"
                          style={{ width: columns[7].width }}
                        >
                          <div className="px-2 py-1 rounded text-sm font-normal cursor-pointer hover:bg-gray-50">
                            ${parseFloat(item.unitRetail).toFixed(2)}
                          </div>
                        </td>

                        {/* Margin */}
                        <td
                          className="px-3 py-2 border-r border-gray-100 last:border-r-0"
                          style={{ width: columns[8].width }}
                        >
                          <div
                            className={`px-2 py-1 rounded text-sm font-normal cursor-pointer hover:bg-gray-50 ${
                              item.margin <= 0
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {item.margin.toFixed(2)}%
                          </div>
                        </td>

                        {/* Actions */}
                        <td
                          className="px-3 py-2 border-r border-gray-100 last:border-r-0"
                          style={{ width: columns[9].width }}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <div className="relative group">
                              <button
                                onClick={() => {
                                  setSelectedEditItem(item);
                                  setEditMode(true);
                                  setNewItemModalOpen(true);
                                }}
                                className="p-1 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded transition-colors"
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
                              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                                <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                                  Edit Item
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                </div>
                              </div>
                            </div>
                            <div className="relative group">
                              <button
                                onClick={() =>
                                  console.log("Inactive item:", item.productId)
                                }
                                className="p-1 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded transition-colors"
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
                                    d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </button>
                              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                                <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                                  Inactive Item
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                </div>
                              </div>
                            </div>
                            <div className="relative group">
                              <button
                                onClick={() => {
                                  setSelectedOverviewItem(item);
                                  setItemOverviewModalOpen(true);
                                }}
                                className="p-1 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded transition-colors"
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
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </button>
                              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                                <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                                  Item Overview
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {items.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg mb-2">���</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No items found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search criteria or add new items.
                  </p>
                </div>
              )}

              {/* Pagination */}
              {items.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    {/* Row count and items per page */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>
                        Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                        {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                        {totalItems} items
                      </span>
                      <div className="flex items-center gap-2">
                        <span>Show:</span>
                        <select
                          value={itemsPerPage}
                          onChange={(e) =>
                            handleItemsPerPageChange(Number(e.target.value))
                          }
                          className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                        </select>
                        <span>per page</span>
                      </div>
                    </div>

                    {/* Pagination buttons */}
                    {totalPages > 1 && (
                      <div className="flex items-center gap-2">
                        {/* Previous button */}
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>

                        {/* Page numbers */}
                        <div className="flex gap-1">
                          {Array.from(
                            { length: Math.min(5, totalPages) },
                            (_, i) => {
                              let pageNumber;
                              if (totalPages <= 5) {
                                pageNumber = i + 1;
                              } else if (currentPage <= 3) {
                                pageNumber = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNumber = totalPages - 4 + i;
                              } else {
                                pageNumber = currentPage - 2 + i;
                              }

                              return (
                                <button
                                  key={pageNumber}
                                  onClick={() => handlePageChange(pageNumber)}
                                  className={`px-3 py-1 text-sm border rounded ${
                                    currentPage === pageNumber
                                      ? "bg-orange-500 text-white border-orange-500"
                                      : "border-gray-300 hover:bg-gray-100"
                                  }`}
                                >
                                  {pageNumber}
                                </button>
                              );
                            },
                          )}
                        </div>

                        {/* Next button */}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* New Item Modal */}
      <NewItemModal
        isOpen={newItemModalOpen}
        isEditMode={editMode}
        editItem={selectedEditItem}
        onClose={() => {
          setNewItemModalOpen(false);
          setEditMode(false);
          setSelectedEditItem(null);
        }}
        onSave={(newItem) => {
          // Add logic to handle saving new item
          console.log("New item to save:", newItem);
          setNewItemModalOpen(false);
          setEditMode(false);
          setSelectedEditItem(null);
          // Refresh items list
          loadItems();
        }}
      />

      {/* Item Overview Modal */}
      <ItemOverviewModal
        isOpen={itemOverviewModalOpen}
        item={selectedOverviewItem}
        onClose={() => {
          setItemOverviewModalOpen(false);
          setSelectedOverviewItem(null);
        }}
      />

      {/* Import Excel Modal Placeholder */}
      {importExcelModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Import Excel
            </h3>
            <p className="text-gray-600 mb-4">
              Import Excel functionality will be implemented here.
            </p>
            <button
              onClick={() => setImportExcelModalOpen(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// New Item Modal Component
const NewItemModal = ({
  isOpen,
  isEditMode = false,
  editItem = null,
  onClose,
  onSave,
}) => {
  const { token, selectedLocation } = useAuth();
  const { showSuccess, showError, showDeleteConfirm } = useNotification();
  const [activeTab, setActiveTab] = useState("basic");
  const [isLoading, setIsLoading] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [upcNotFound, setUpcNotFound] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [taxOptions, setTaxOptions] = useState([]);
  const [ageOptions, setAgeOptions] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [isUpcLocked, setIsUpcLocked] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

  // Basic tab form data - matching EditItemModal structure
  const [basicData, setBasicData] = useState({
    upc: "",
    description: "",
    department: "",
    vendor: "",
    quantity: 1,
    unitCase: "",
    caseCost: "",
    retail: "",
    margin: "",
    age: "",
    tax: "",
    ebt: false,
    productImage: null,
    productImagePreview: null,
    uploadedImageUrl: null,
  });

  // Modifier tab data
  const [modifiers, setModifiers] = useState([]);

  // Volume Pack tab data
  const [volumePacks, setVolumePacks] = useState([]);

  // Reset form state when modal opens or initialize with edit data
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editItem) {
        // Initialize with edit item data
        setBasicData({
          upc: editItem.scanCode || "",
          description: "",
          department: "",
          vendor: "",
          quantity: 1,
          unitCase: "",
          caseCost: "",
          retail: "",
          margin: "",
          age: "",
          tax: "",
          ebt: false,
          productImage: null,
          productImagePreview: null,
          uploadedImageUrl: null,
        });
        setModifiers([]);
        setVolumePacks([]);
        setActiveTab("basic");
        setUpcNotFound(false);
        setIsUpcLocked(false);

        // Trigger UPC lookup if we have a UPC from edit item
        if (editItem.scanCode) {
          setTimeout(() => {
            lookupUPC(editItem.scanCode);
          }, 500); // Small delay to ensure components are ready
        }
      } else {
        // Reset all form data to initial state for new item
        setBasicData({
          upc: "",
          description: "",
          department: "",
          vendor: "",
          quantity: 1,
          unitCase: "",
          caseCost: "",
          retail: "",
          margin: "",
          age: "",
          tax: "",
          ebt: false,
          productImage: null,
          productImagePreview: null,
          uploadedImageUrl: null,
        });
        setModifiers([]);
        setVolumePacks([]);
        setActiveTab("basic");
        setUpcNotFound(false);
        setIsUpcLocked(false);
      }
    }
  }, [isOpen, isEditMode, editItem]);

  // Load departments, tax options, and age options
  useEffect(() => {
    const loadDropdownData = async () => {
      if (!selectedLocation?.id || !token) return;

      try {
        // Load departments using correct API call like EditItemModal
        const deptResponse = await departmentService.getDepartments(
          token,
          selectedLocation.id,
        );
        if (deptResponse.status === "success") {
          setDepartments(deptResponse.data);
        }

        // Load tax options using getAllTax with token (like EdiImportModal)
        const taxBody = { locationId: selectedLocation.id };
        const taxResponse = await getAllTax(token, taxBody);
        console.log("NewItemModal getAllTax response:", taxResponse);

        if (taxResponse.status === "success") {
          console.log("NewItemModal setting tax options:", taxResponse.data);
          setTaxOptions(taxResponse.data);
        } else {
          console.error("Failed to load tax options:", taxResponse);
          setTaxOptions([]);
        }

        // Load age options using getMinAge with token (like EdiImportModal)
        const ageBody = { locationId: selectedLocation.id };
        const ageResponse = await getMinAge(token, ageBody);
        console.log("NewItemModal getMinAge response:", ageResponse);

        if (ageResponse.status === "success") {
          console.log("NewItemModal setting age options:", ageResponse.data);
          setAgeOptions(ageResponse.data);
        } else {
          console.error("Failed to load age options:", ageResponse);
          setAgeOptions([]);
        }

        // Load vendors using getVendors
        const vendorResponse = await getVendors(selectedLocation.id, {}, token);
        console.log("NewItemModal getVendors response:", vendorResponse);

        if (vendorResponse.status === "success") {
          console.log("NewItemModal setting vendors:", vendorResponse.data);
          setVendors(vendorResponse.data);
        } else {
          console.error("Failed to load vendors:", vendorResponse);
          setVendors([]);
        }
      } catch (error) {
        console.error("Error loading dropdown data:", error);
      }
    };

    if (isOpen) {
      loadDropdownData();
    }
  }, [selectedLocation, token, isOpen]);

  // Calculate margin when retail, case cost, or unit case changes
  useEffect(() => {
    if (basicData.retail && basicData.caseCost && basicData.unitCase) {
      const margin = calculateMarginPercentage(
        parseFloat(basicData.retail),
        parseFloat(basicData.caseCost),
        parseInt(basicData.unitCase),
      );
      setBasicData((prev) => ({ ...prev, margin: margin.toFixed(2) }));
    }
  }, [basicData.retail, basicData.caseCost, basicData.unitCase]);

  // Handle department change and auto-set tax and EBT - matching EditItemModal logic
  const handleDepartmentChange = (departmentName) => {
    console.log("handleDepartmentChange called with:", departmentName);
    console.log("Available departments:", departments);

    const selectedDepartment = departments.find(
      (dept) => dept.name === departmentName,
    );

    console.log("Selected department:", selectedDepartment);

    if (selectedDepartment) {
      const newTax = selectedDepartment.tax
        ? selectedDepartment.tax.name
        : "no tax";
      const newAge = selectedDepartment.minAge
        ? selectedDepartment.minAge.minAge
        : "no restriction";
      const newEbt = selectedDepartment.ebt || false;

      console.log("Setting new values:", { newTax, newAge, newEbt });

      setBasicData((prev) => {
        console.log("Previous basicData:", prev);
        const newBasicData = {
          ...prev,
          department: departmentName,
          tax: newTax,
          ebt: newEbt,
          age: newAge,
        };
        console.log("New basicData:", newBasicData);
        return newBasicData;
      });
    } else {
      console.log("Department not found, only updating department name");
      setBasicData((prev) => ({ ...prev, department: departmentName }));
    }
  };

  // Handle age change and auto-set tax and EBT based on department
  const handleAgeChange = (ageValue) => {
    const selectedDepartment = departments.find(
      (dept) => dept.name === basicData.department,
    );

    if (selectedDepartment) {
      setBasicData((prev) => ({
        ...prev,
        age: ageValue,
        tax: selectedDepartment.tax ? selectedDepartment.tax.name : "no tax",
        ebt: selectedDepartment.ebt || false,
      }));
    } else {
      setBasicData((prev) => ({ ...prev, age: ageValue }));
    }
  };

  // Handle vendor selection
  const handleVendorChange = (vendorId) => {
    const selectedVendor = vendors.find((vendor) => vendor.id === vendorId);
    if (selectedVendor) {
      setBasicData((prev) => ({ ...prev, vendor: selectedVendor.id }));
    }
  };

  // Handle other input changes
  const handleInputChange = (field, value) => {
    setBasicData((prev) => ({ ...prev, [field]: value }));
  };

  // UPC lookup functionality - using correct API
  const lookupUPC = async (upc) => {
    console.log("Looking up UPC:", upc);
    setIsLookingUp(true);
    try {
      const response = await inventoryService.getInventoryByScanCode(
        token,
        upc,
        selectedLocation.id,
      );
      console.log("UPC lookup response:", response);

      if (response.status === "success" && response.data) {
        const data = response.data;
        console.log("Item found:", data);

        // Find department name by matching departmentId
        console.log(
          "Looking for departmentId:",
          data.departmentId,
          "in departments:",
          departments,
        );
        const department = departments.find(
          (dept) => dept.id === data.departmentId,
        );
        const departmentName = department
          ? department.name
          : data.departmentName || "";

        // Find tax name by matching taxId
        console.log(
          "Looking for taxId:",
          data.taxId,
          "in tax options:",
          taxOptions,
        );
        const tax = taxOptions.find((taxOption) => taxOption.id === data.taxId);
        const taxName = tax ? tax.name : "no tax";
        console.log("Found tax:", tax, "taxName:", taxName);

        // Find age by matching minAgeId
        console.log(
          "Looking for minAgeId:",
          data.minAgeId,
          "in age options:",
          ageOptions,
        );
        const age = ageOptions.find(
          (ageOption) => ageOption.id === data.minAgeId,
        );
        const ageName = age ? age.minAge : "no restriction";
        console.log("Found age:", age, "ageName:", ageName);

        // Calculate margin from lookup data
        const marginCalculated = calculateMarginPercentage(
          data.unitRetail || 0,
          data.caseCost || 0,
          data.unitCase || 1,
        );

        // Find vendor by matching payeeId
        console.log(
          "Looking for payeeId:",
          data.payeeId,
          "in vendors:",
          vendors,
        );
        const vendor = vendors.find((vendor) => vendor.id === data.payeeId);
        const vendorId = vendor ? vendor.id : "";
        console.log("Found vendor:", vendor, "vendorId:", vendorId);

        // Map API response to form data with correct field mapping
        setBasicData((prev) => ({
          ...prev,
          description: data.name || "",
          department: departmentName,
          vendor: vendorId,
          unitCase: data.unitCase || 1,
          caseCost: data.caseCost || "",
          retail: data.unitRetail || "",
          margin: marginCalculated.toFixed(2), // Calculate and set margin immediately
          ebt: data.allowEbt || false,
          tax: taxName,
          age: ageName,
          // Handle image from API response
          productImagePreview: data.image || null,
          uploadedImageUrl: data.image || null,
          // Store additional fields for API detection and payload
          productId: data.id || "",
          productPriceId: data.productPriceId || "",
          departmentId: data.departmentId || "",
          taxId: data.taxId || "",
          minAgeId: data.minAgeId || "",
          vendorItemCode: data.vendorItemCode || "",
          categoryId: data.categoryId || "",
          caseDiscount: data.caseDiscount || "0.00",
          size: data.size || "0",
          priceType: data.priceType || 0,
          scaleType: data.scaleType || "",
          maxInv: data.maxInv || "",
          minInv: data.minInv || "",
          priceGroupId: data.priceGroupId || null,
        }));

        // Populate modifiers from productChildren if available
        if (data.productChildren && Array.isArray(data.productChildren)) {
          const existingModifiers = data.productChildren.map((child) => ({
            id: Date.now() + Math.random(), // Generate unique temp ID for form
            name: child.name || "",
            price: child.price || "",
            image: null,
            imagePreview: child.image || null,
            isUploading: false,
            uploadedImageUrl: child.image || null,
            productChildId: child.id, // Store the actual DB ID
            barCode: child.barCode || "",
            isFromAPI: true, // Flag to identify existing modifiers
          }));
          setModifiers(existingModifiers);
          console.log(
            "Populated modifiers from productChildren:",
            existingModifiers,
          );
        }

        // Fetch volume packs if productPriceId is available
        if (data.productPriceId) {
          try {
            const itemFunctionsResponse = await getItemFunctions(token, {
              productPriceId: data.productPriceId,
              type: 5,
              locationId: selectedLocation.id,
            });

            console.log("ItemFunctions response:", itemFunctionsResponse);

            if (
              itemFunctionsResponse.status === "success" &&
              itemFunctionsResponse.data
            ) {
              const existingVolumePacks = itemFunctionsResponse.data.map(
                (pack) => ({
                  id: Date.now() + Math.random(), // Generate unique temp ID for form
                  packQuantity: pack.quantity.toString(),
                  unitCost: pack.cost,
                  packCost: (
                    parseFloat(pack.quantity) * parseFloat(pack.cost)
                  ).toFixed(2),
                  packRetailPrice: pack.retail,
                  packMargin: pack.margin,
                  // Store API data for potential updates
                  multipackId: pack.id, // Store the original ID from ItemFunctions response
                  productPriceId: pack.productPriceId,
                  isFromAPI: true,
                }),
              );
              setVolumePacks(existingVolumePacks);
              console.log(
                "Populated volume packs from ItemFunctions:",
                existingVolumePacks,
              );
            }
          } catch (error) {
            console.error("Error fetching volume packs:", error);
          }
        }

        setUpcNotFound(false); // Clear not found state on successful lookup
        setIsUpcLocked(true); // Lock UPC field when item is found
      } else {
        console.log("Item not found for UPC:", upc, "Response:", response);
        setUpcNotFound(true); // Show not found message
      }
    } catch (error) {
      console.error("UPC lookup error:", error);
      setUpcNotFound(true);
    } finally {
      setIsLookingUp(false);
    }
  };

  // Handle UPC input changes
  const handleUPCChange = (e) => {
    const value = e.target.value;
    setBasicData((prev) => ({ ...prev, upc: value }));
    setUpcNotFound(false); // Clear not found message when typing
  };

  // Handle UPC blur or Enter key
  const handleUPCBlur = () => {
    if (basicData.upc) {
      lookupUPC(basicData.upc);
    }
  };

  const handleUPCKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleUPCBlur();
    }
  };

  // Clear UPC and reset form
  const handleClearUPC = () => {
    setBasicData({
      upc: "",
      description: "",
      department: "",
      vendor: "",
      quantity: 1,
      unitCase: "",
      caseCost: "",
      retail: "",
      margin: "",
      age: "",
      tax: "",
      ebt: false,
      productImage: null,
      productImagePreview: null,
      uploadedImageUrl: null,
    });
    setModifiers([]);
    setVolumePacks([]);
    setIsUpcLocked(false);
    setUpcNotFound(false);
  };

  const addModifier = () => {
    setModifiers((prev) => [
      ...prev,
      {
        id: Date.now(),
        image: null,
        imagePreview: null,
        name: "",
        price: "",
        isUploading: false,
        uploadedImageUrl: null,
        productChildId: "", // For existing modifiers from API
        barCode: "", // For existing barCode from API
        isFromAPI: false, // Flag to identify new vs existing modifiers
      },
    ]);
  };

  const removeModifier = (id) => {
    const modifierToRemove = modifiers.find((mod) => mod.id === id);

    // Show custom confirmation dialog
    showDeleteConfirm(
      "Remove Modifier",
      `Are you sure you want to remove this modifier "${modifierToRemove?.name || "N/A"}"?`,
      async () => {
        // If modifier has productChildId (from API), call addProductmodifier to mark as deleted
        if (modifierToRemove?.productChildId) {
          try {
            setIsLoading(true);

            // Get the product ID by looking up the UPC
            const lookupResponse =
              await inventoryService.getInventoryByScanCode(
                token,
                basicData.upc,
                selectedLocation.id,
              );

            if (
              lookupResponse.status === "success" &&
              lookupResponse.data?.id
            ) {
              const productId = lookupResponse.data.id;

              // Prepare modifier payload with isDeleted: true
              const deletePayload = {
                productChild: [
                  {
                    id: modifierToRemove.productChildId,
                    franchiseId: selectedLocation.franchiseId || "",
                    name: modifierToRemove.name,
                    price: modifierToRemove.price || "0",
                    image:
                      modifierToRemove.uploadedImageUrl ||
                      modifierToRemove.imagePreview ||
                      "",
                    isActive: true,
                    isDeleted: true, // Mark as deleted
                    barCode: modifierToRemove.barCode || basicData.upc,
                    productId: productId,
                    productChildId: modifierToRemove.productChildId,
                    locationId: selectedLocation.id,
                    updatedAt: new Date().toISOString(),
                  },
                ],
              };

              console.log("Deleting modifier payload:", deletePayload);

              const response = await addProductmodifier(token, deletePayload);

              if (response.status === "success") {
                // Remove from local state after successful API call
                setModifiers((prev) => prev.filter((mod) => mod.id !== id));
                showSuccess("Modifier removed successfully!");
              } else {
                console.error("Failed to delete modifier:", response);
                showError(
                  "Failed to remove modifier: " +
                    (response.message || "Unknown error"),
                );
              }
            } else {
              console.error("Failed to get product ID for modifier deletion");
              showError("Failed to remove modifier - couldn't get product ID");
            }
          } catch (error) {
            console.error("Error deleting modifier:", error);
            showError("An error occurred while removing the modifier");
          } finally {
            setIsLoading(false);
          }
        } else {
          // For new modifiers (no productChildId), just remove from local state
          setModifiers((prev) => prev.filter((mod) => mod.id !== id));
        }
      },
    );
  };

  const updateModifier = (id, field, value) => {
    setModifiers((prev) =>
      prev.map((mod) => (mod.id === id ? { ...mod, [field]: value } : mod)),
    );
  };

  const addVolumePack = () => {
    // Calculate unit cost from Basic Info: caseCost / unitCase
    const unitCost =
      basicData.caseCost && basicData.unitCase
        ? (
            parseFloat(basicData.caseCost) / parseFloat(basicData.unitCase)
          ).toFixed(2)
        : "0.00";

    setVolumePacks((prev) => [
      ...prev,
      {
        id: Date.now(),
        packQuantity: "",
        unitCost: unitCost,
        packCost: "0.00",
        packRetailPrice: "",
        packMargin: "",
        multipackId: null, // New volume packs don't have an ID
        isFromAPI: false,
      },
    ]);
  };

  const removeVolumePack = async (id) => {
    const packToRemove = volumePacks.find((pack) => pack.id === id);

    // Show custom confirmation dialog
    showDeleteConfirm(
      "Remove Volume Pack",
      `Are you sure you want to remove this volume pack (Quantity: ${packToRemove?.packQuantity || "N/A"})?`,
      async () => {
        // If pack has multipackId (from API), call updateMultiPack to mark as deleted
        if (packToRemove?.multipackId) {
          try {
            setIsLoading(true);

            const deletePayload = {
              locationId: selectedLocation.id,
              isDeleted: true,
              productPriceId: packToRemove.productPriceId,
              quantity: parseInt(packToRemove.packQuantity) || 1,
              cost: packToRemove.unitCost || "0.00",
              retail: packToRemove.packRetailPrice || "0.00",
              margin: packToRemove.packMargin || "0.00",
              multipackId: packToRemove.multipackId,
            };

            console.log("Deleting volume pack payload:", deletePayload);

            const response = await updateMultiPack(token, deletePayload);

            if (response.status === "success") {
              // Remove from local state after successful API call
              setVolumePacks((prev) => prev.filter((pack) => pack.id !== id));
              showSuccess("Volume pack removed successfully!");
            } else {
              console.error("Failed to delete volume pack:", response);
              showError(
                "Failed to remove volume pack: " +
                  (response.message || "Unknown error"),
              );
            }
          } catch (error) {
            console.error("Error deleting volume pack:", error);
            showError("An error occurred while removing the volume pack");
          } finally {
            setIsLoading(false);
          }
        } else {
          // For new packs (no multipackId), just remove from local state
          setVolumePacks((prev) => prev.filter((pack) => pack.id !== id));
        }
      },
    );
  };

  const updateVolumePack = (id, field, value) => {
    setVolumePacks((prev) =>
      prev.map((pack) => {
        if (pack.id === id) {
          const updatedPack = { ...pack, [field]: value };

          // Calculate pack cost when quantity changes
          if (field === "packQuantity" && value && pack.unitCost) {
            const packCost = (
              parseFloat(value) * parseFloat(pack.unitCost)
            ).toFixed(2);
            updatedPack.packCost = packCost;

            // Recalculate margin if pack retail price exists
            if (pack.packRetailPrice) {
              const margin = calculateMarginPercentage(
                parseFloat(pack.packRetailPrice), // Pack Retail Price
                parseFloat(packCost), // Pack Cost
                1, // Quantity is 1 for margin calculation
              );
              updatedPack.packMargin = margin.toFixed(2);
            }
          }

          // Calculate pack margin when pack retail price changes
          if (field === "packRetailPrice" && value && updatedPack.packCost) {
            const margin = calculateMarginPercentage(
              parseFloat(value), // Pack Retail Price
              parseFloat(updatedPack.packCost), // Pack Cost
              1, // Quantity is 1 for margin calculation
            );
            updatedPack.packMargin = margin.toFixed(2);
          }

          return updatedPack;
        }
        return pack;
      }),
    );
  };

  const handleImageUpload = async (modifierId, file) => {
    if (file) {
      // Show preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        updateModifier(modifierId, "image", file);
        updateModifier(modifierId, "imagePreview", e.target.result);
      };
      reader.readAsDataURL(file);

      // Upload to API
      try {
        updateModifier(modifierId, "isUploading", true);
        const uploadResponse = await uploadMedia(file);
        console.log("Modifier image upload response:", uploadResponse);

        if (
          uploadResponse.status === "success" ||
          uploadResponse.status === "successs"
        ) {
          const uploadedLink = uploadResponse.data[0]?.uploadedLink;
          if (uploadedLink) {
            updateModifier(modifierId, "uploadedImageUrl", uploadedLink);
            updateModifier(modifierId, "isUploading", false);
            console.log("Modifier image uploaded successfully:", uploadedLink);
          }
        }
      } catch (error) {
        console.error("Error uploading modifier image:", error);
        updateModifier(modifierId, "isUploading", false);
      }
    }
  };

  // Handle product image upload
  const handleProductImageUpload = async (file) => {
    if (file) {
      // Show preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        setBasicData((prev) => ({
          ...prev,
          productImage: file,
          productImagePreview: e.target.result,
        }));
      };
      reader.readAsDataURL(file);

      // Upload to API
      setIsImageUploading(true);
      try {
        const uploadResponse = await uploadMedia(file, token);
        console.log("Image upload response:", uploadResponse);

        if (
          uploadResponse.status === "successs" &&
          uploadResponse.data &&
          uploadResponse.data.length > 0
        ) {
          const uploadedImageUrl = uploadResponse.data[0].uploadedLink;
          setBasicData((prev) => ({
            ...prev,
            uploadedImageUrl: uploadedImageUrl,
          }));
        } else {
          showError(
            "Failed to upload image: " +
              (uploadResponse.message || "Unknown error"),
          );
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        showError("Failed to upload image: " + error.message);
      } finally {
        setIsImageUploading(false);
      }
    }
  };

  const handleSave = async () => {
    // Validate required fields matching EditItemModal validation
    const requiredFields = [
      "upc",
      "description",
      "department",
      "unitCase",
      "caseCost",
      "retail",
    ];
    const missingFields = requiredFields.filter((field) => !basicData[field]);

    // Additional validations
    if (basicData.unitCase && parseFloat(basicData.unitCase) <= 0) {
      showError("Validation Error", "Unit Case must be greater than 0");
      return;
    }

    if (basicData.caseCost && parseFloat(basicData.caseCost) <= 0) {
      showError("Validation Error", "Case Cost must be greater than 0");
      return;
    }

    if (basicData.retail && parseFloat(basicData.retail) <= 0) {
      showError("Validation Error", "Unit Retail must be greater than 0");
      return;
    }

    if (missingFields.length > 0) {
      showError(
        "Validation Error",
        `Please fill in required fields: ${missingFields.join(", ")}`,
      );
      return;
    }

    try {
      setIsLoading(true);

      // Find selected department, tax, and age data
      const selectedDepartment = departments.find(
        (dept) => dept.name === basicData.department,
      );
      const selectedTax = taxOptions.find((tax) => tax.name === basicData.tax);
      const selectedAge = ageOptions.find(
        (age) => age.minAge === basicData.age,
      );
      const selectedVendor = vendors.find(
        (vendor) => vendor.id === basicData.vendor,
      );

      // Build the API payload according to the specified format
      const apiPayload = {
        taxId: selectedTax?.id || "",
        unitRetail: parseFloat(basicData.retail) || 0,
        caseCost: parseFloat(basicData.caseCost) || 0,
        unitCase: parseInt(basicData.unitCase) || 1,
        description: basicData.description,
        departmentId: selectedDepartment?.id || "",
        categoryId: "",
        priceGroup: [
          {
            priceGroupId: null,
            locationId: selectedLocation.id,
            productPriceId: "",
            productId: "",
            price: parseFloat(basicData.retail) || 0,
            priceType: null,
            cashPrice: null,
            minAgeId: selectedAge?.id || "",
            taxId: selectedTax?.id || "",
            departmentLocationId: selectedDepartment?.locationId || null,
            departmentTaxId: selectedTax?.id || "",
            departmentEbt: basicData.ebt || false,
            departmentminAgeId: selectedAge?.id || "",
            name: selectedDepartment?.name || "",
            taxName: basicData.tax || "no tax",
            minAge: basicData.age || "no restriction",
            tax: selectedTax?.tax || "0.00",
            allowEbt: basicData.ebt || false,
          },
        ],
        payeeId: basicData.vendor || "",
        productType: 0,
        scaleType: "",
        newScanCode: "",
        quantity: parseInt(basicData.quantity) || 0,
        caseDiscount: "0",
        caseRebate: "0",
        loyaltyPoints: 0,
        unitOfMeasure: "",
        size: "",
        unitAfterDiscount: "0", // This would need calculation
        margin: basicData.margin || "0",
        marginAfterRebate: basicData.margin || "0",
        departmentLocationId: null,
        departmentTaxId: null,
        maxInv: "",
        minInv: "",
        minAgeId: selectedAge?.id || "",
        allowEbt: basicData.ebt || false,
        locationId: selectedLocation.id,
        name: basicData.description,
        barCode: basicData.upc,
        vendorItemCode: "",
        itemEntry: false,
        priceType: 0,
        image: basicData.uploadedImageUrl || "",
      };

      console.log("Sending product payload:", apiPayload);

      const response = await addProduct(token, apiPayload);

      if (response.status === "success") {
        // Always show simple success message regardless of modifiers/volume packs
        const successMessage = "Product added successfully!";

        // If there are modifiers with names, add them (image is optional)
        const validModifiers = modifiers.filter(
          (mod) => mod.name && mod.name.trim() !== "",
        );

        if (validModifiers.length > 0) {
          try {
            // Get the product ID by looking up the UPC
            const lookupResponse =
              await inventoryService.getInventoryByScanCode(
                token,
                basicData.upc,
                selectedLocation.id,
              );

            if (
              lookupResponse.status === "success" &&
              lookupResponse.data?.id
            ) {
              const productId = lookupResponse.data.id;
              console.log("Got product ID for modifiers:", productId);

              // Prepare modifier payload with productChild wrapper
              const modifierPayload = {
                productChild: validModifiers.map((modifier) => {
                  const baseModifier = {
                    name: modifier.name,
                    price: modifier.price || "0",
                    image:
                      modifier.uploadedImageUrl || modifier.imagePreview || "",
                    isActive: true,
                    barCode: modifier.barCode || basicData.upc,
                    productId: productId,
                    productChildId: modifier.productChildId || "",
                    locationId: selectedLocation.id,
                  };

                  // Add additional fields for existing modifiers
                  if (modifier.productChildId) {
                    // Existing modifier - include all fields from API response
                    const existingModifier = {
                      id: modifier.productChildId,
                      franchiseId: selectedLocation.franchiseId || "", // Add if available
                      ...baseModifier,
                      isDeleted: false,
                      updatedAt: new Date().toISOString(),
                    };

                    // Only include createdAt if it exists
                    if (modifier.createdAt) {
                      existingModifier.createdAt = modifier.createdAt;
                    }

                    return existingModifier;
                  } else {
                    // New modifier
                    return {
                      ...baseModifier,
                      tempCreate: true,
                    };
                  }
                }),
              };

              console.log("Sending modifier payload:", modifierPayload);

              const modifierResponse = await addProductmodifier(
                token,
                modifierPayload,
              );

              if (modifierResponse.status === "success") {
                console.log(
                  `${validModifiers.length} modifier(s) added successfully`,
                );
              } else {
                console.error("Failed to add modifiers:", modifierResponse);
              }
            } else {
              console.error(
                "Failed to get product ID for modifiers:",
                lookupResponse,
              );
            }
          } catch (modifierError) {
            console.error("Error adding modifiers:", modifierError);
          }
        }

        // If there are volume packs, add them
        const validVolumePacks = volumePacks.filter(
          (pack) => pack.packQuantity && pack.packRetailPrice,
        );

        if (validVolumePacks.length > 0) {
          try {
            // Get the product ID by looking up the UPC (reuse if already done for modifiers)
            let productPriceId = null;

            if (validModifiers.length > 0) {
              // Already have the lookup response from modifiers
              const lookupResponse =
                await inventoryService.getInventoryByScanCode(
                  token,
                  basicData.upc,
                  selectedLocation.id,
                );

              if (
                lookupResponse.status === "success" &&
                lookupResponse.data?.productPriceId
              ) {
                productPriceId = lookupResponse.data.productPriceId;
              }
            } else {
              // Need to do lookup for volume packs
              const lookupResponse =
                await inventoryService.getInventoryByScanCode(
                  token,
                  basicData.upc,
                  selectedLocation.id,
                );

              if (
                lookupResponse.status === "success" &&
                lookupResponse.data?.productPriceId
              ) {
                productPriceId = lookupResponse.data.productPriceId;
              }
            }

            if (productPriceId) {
              console.log(
                "Got productPriceId for volume packs:",
                productPriceId,
              );

              // Add or update each volume pack
              for (const pack of validVolumePacks) {
                if (pack.multipackId) {
                  // Existing volume pack - call updateMultiPack
                  const updatePayload = {
                    locationId: selectedLocation.id,
                    isDeleted: false,
                    productPriceId: productPriceId,
                    quantity: parseInt(pack.packQuantity) || 1,
                    cost: pack.unitCost || "0.00",
                    retail: pack.packRetailPrice || "0.00",
                    margin: pack.packMargin || "0.00",
                    multipackId: pack.multipackId,
                  };

                  console.log("Updating volume pack payload:", updatePayload);

                  const volumePackResponse = await updateMultiPack(
                    token,
                    updatePayload,
                  );

                  if (volumePackResponse.status !== "success") {
                    console.error(
                      "Failed to update volume pack:",
                      volumePackResponse,
                    );
                    break; // Stop on first failure
                  }
                } else {
                  // New volume pack - call addMultiPack
                  const addPayload = {
                    margin: pack.packMargin || "0.00",
                    retail: parseFloat(pack.packRetailPrice) || 0,
                    cost: pack.unitCost || "0.00",
                    quantity: parseInt(pack.packQuantity) || 1,
                    locationId: selectedLocation.id,
                    productPriceId: productPriceId,
                  };

                  console.log("Adding new volume pack payload:", addPayload);

                  const volumePackResponse = await addMultiPack(
                    token,
                    addPayload,
                  );

                  if (volumePackResponse.status !== "success") {
                    console.error(
                      "Failed to add volume pack:",
                      volumePackResponse,
                    );
                    break; // Stop on first failure
                  }
                }
              }

              console.log(
                `${validVolumePacks.length} volume pack(s) added successfully`,
              );
            } else {
              console.error("Failed to get productPriceId for volume packs");
            }
          } catch (volumePackError) {
            console.error("Error adding volume packs:", volumePackError);
          }
        }

        showSuccess(successMessage);
        // Call onSave callback to refresh the items list
        if (onSave) {
          onSave();
        }
        onClose();
      } else {
        showError(
          "Failed to add product: " + (response.message || "Unknown error"),
        );
      }
    } catch (error) {
      console.error("Error adding product:", error);
      showError("An error occurred while adding the product");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 backdrop-blur-sm">
      <div className="relative top-2 mx-2 my-2 border w-auto max-w-4xl shadow-2xl rounded-xl bg-white max-h-[85vh] flex flex-col sm:mx-auto sm:w-full">
        {/* Small Loading Overlay */}
        {(isLoading || isLookingUp) && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50 rounded-xl">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-3"></div>
              {isLoading ? (
                <>
                  <p className="text-sm font-medium text-gray-700">
                    Saving Product...
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Processing data</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-700">
                    Looking up UPC...
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Getting item details
                  </p>
                </>
              )}
            </div>
          </div>
        )}
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-gray-100 rounded-t-xl flex-shrink-0"
          style={{ backgroundColor: "#ffedd5" }}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg
                className="w-5 h-5 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isEditMode ? "Edit Item" : "Add New Item"}
              </h2>
              <p className="text-sm text-gray-600">
                {isEditMode
                  ? "Edit an inventory item"
                  : "Create a new inventory item"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white hover:bg-opacity-80 rounded-lg transition-all duration-200"
          >
            <svg
              className="w-6 h-6"
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

        {/* Tab Navigation */}
        <div className="px-6 py-3 bg-gray-50 flex-shrink-0">
          <nav className="flex space-x-1">
            {["basic", "modifier", "volumePack"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-orange-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm"
                }`}
              >
                <div className="flex items-center space-x-2">
                  {tab === "basic" && (
                    <>
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span>Basic Info</span>
                    </>
                  )}
                  {tab === "modifier" && (
                    <>
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
                          d="M4.871 4A17.926 17.926 0 003 12c0 2.874.673 5.59 1.871 8m14.13 0a17.926 17.926 0 001.87-8 17.926 17.926 0 00-1.87-8M9 9h1.246a1 1 0 01.961.725l1.586 5.55a1 1 0 00.961.725H15"
                        />
                      </svg>
                      <span>Modifiers</span>
                    </>
                  )}
                  {tab === "volumePack" && (
                    <>
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
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                      <span>Volume Packs</span>
                    </>
                  )}
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 px-6 py-4 overflow-y-auto">
          {/* Basic Tab */}
          {activeTab === "basic" && (
            <div className="space-y-3">
              {/* Form Section Header */}
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Product Information
                </h3>
                <p className="text-sm text-gray-600">
                  Enter the basic details for this inventory item
                </p>
              </div>
              {/* UPC, Product Image and Preview Layout */}
              <div>
                <div className="grid grid-cols-12 gap-3">
                  {/* Left section - UPC and Description */}
                  <div className="col-span-9">
                    {/* UPC and Image Upload Row */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          UPC *
                        </label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={basicData.upc}
                              onChange={handleUPCChange}
                              onBlur={handleUPCBlur}
                              onKeyDown={handleUPCKeyDown}
                              disabled={isUpcLocked}
                              placeholder="Enter UPC"
                              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                                isUpcLocked
                                  ? "bg-gray-50 cursor-not-allowed text-gray-600"
                                  : ""
                              }`}
                            />
                            {isLoading && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                              </div>
                            )}
                            {isUpcLocked && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <svg
                                  className="w-4 h-4 text-green-500"
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
                              </div>
                            )}
                          </div>
                          {isUpcLocked && (
                            <button
                              type="button"
                              onClick={handleClearUPC}
                              className="px-2 py-2 bg-red-500 text-white text-xs font-medium rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Image
                          {isImageUploading && (
                            <span className="ml-2 text-xs text-orange-600">
                              Uploading...
                            </span>
                          )}
                          {basicData.uploadedImageUrl && (
                            <span className="ml-2 text-xs text-green-600">
                              ✓ Uploaded
                            </span>
                          )}
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleProductImageUpload(e.target.files[0])
                          }
                          disabled={isImageUploading}
                          className="block w-full px-3 py-2 text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Description Row */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <input
                        type="text"
                        value={basicData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        placeholder="Item description"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Right section - Preview */}
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preview
                    </label>
                    <div className="w-full h-28 flex items-center justify-center border border-gray-200 rounded-md bg-gray-50">
                      {basicData.productImagePreview ? (
                        <img
                          src={basicData.productImagePreview}
                          alt="Product Preview"
                          className="w-16 h-20 object-cover rounded border border-gray-200"
                        />
                      ) : (
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
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                {/* UPC Not Found Message */}
                {upcNotFound && (
                  <div className="mt-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                    ⚠️ Item not found - You are adding a new item
                  </div>
                )}
              </div>

              {/* Department and Vendor */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <DepartmentDropdown
                    value={basicData.department}
                    onChange={handleDepartmentChange}
                    placeholder="Select Department"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor
                  </label>
                  <SearchableDropdown
                    options={vendors}
                    onChange={handleVendorChange}
                    value={basicData.vendor}
                    placeholder="Select Vendor"
                    displayKey="name"
                    valueKey="id"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Quantity and Unit/Case */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={basicData.quantity}
                    onChange={(e) =>
                      handleInputChange("quantity", e.target.value)
                    }
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit in Case *
                  </label>
                  <input
                    type="number"
                    value={basicData.unitCase}
                    onChange={(e) =>
                      handleInputChange("unitCase", e.target.value)
                    }
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Case Cost, Unit Cost, Retail, and Margin */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Case Cost *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={basicData.caseCost}
                    onChange={(e) =>
                      handleInputChange("caseCost", e.target.value)
                    }
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Cost
                  </label>
                  <input
                    type="text"
                    value={
                      basicData.caseCost && basicData.unitCase
                        ? `$${calculateUnitCost(basicData.caseCost, basicData.unitCase).toFixed(2)}`
                        : ""
                    }
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                    placeholder="Auto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Retail *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={basicData.retail}
                    onChange={(e) =>
                      handleInputChange("retail", e.target.value)
                    }
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Margin (%)
                  </label>
                  <input
                    type="text"
                    value={
                      basicData.margin
                        ? formatMarginDisplay(parseFloat(basicData.margin))
                        : ""
                    }
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                    placeholder="Auto"
                  />
                </div>
              </div>

              {/* Age, Tax, and EBT */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <AgeDropdown
                    value={basicData.age}
                    onChange={handleAgeChange}
                    preloadedOptions={ageOptions}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax
                  </label>
                  <TaxDropdown
                    value={basicData.tax}
                    onChange={(value) => handleInputChange("tax", value)}
                    preloadedOptions={taxOptions}
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={basicData.ebt}
                      onChange={(e) =>
                        handleInputChange("ebt", e.target.checked)
                      }
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      EBT Eligible
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Modifier Tab */}
          {activeTab === "modifier" && (
            <div className="space-y-4">
              {/* Header Section */}
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Product Modifiers
                  </h3>
                  <p className="text-sm text-gray-600">
                    Add optional modifications that customers can choose
                  </p>
                </div>
                <button
                  onClick={addModifier}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-sm font-medium rounded-lg hover:from-orange-700 hover:to-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add Modifier
                </button>
              </div>

              <div className="space-y-4">
                {modifiers.map((modifier, index) => (
                  <div
                    key={modifier.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-semibold text-orange-600">
                            {index + 1}
                          </span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          Modifier {index + 1}
                        </h4>
                      </div>
                      <button
                        onClick={() => removeModifier(modifier.id)}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
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
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center">
                          <svg
                            className="w-4 h-4 mr-2 text-orange-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          Image
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleImageUpload(modifier.id, e.target.files[0])
                            }
                            className="block w-full px-3 py-2 text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        {modifier.imagePreview && (
                          <div className="mt-3">
                            <img
                              src={modifier.imagePreview}
                              alt="Preview"
                              className="w-20 h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
                            />
                            {modifier.isUploading && (
                              <p className="text-xs text-orange-600 mt-1">
                                Uploading...
                              </p>
                            )}
                            {!modifier.isUploading &&
                              modifier.uploadedImageUrl && (
                                <p className="text-xs text-green-600 mt-1">
                                  ✓ Uploaded
                                </p>
                              )}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center">
                          <svg
                            className="w-4 h-4 mr-2 text-orange-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                            />
                          </svg>
                          Name *
                        </label>
                        <input
                          type="text"
                          value={modifier.name}
                          onChange={(e) =>
                            updateModifier(modifier.id, "name", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-all duration-200"
                          placeholder="e.g., Extra Cheese, Large Size..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center">
                          <svg
                            className="w-4 h-4 mr-2 text-orange-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                            />
                          </svg>
                          Price ($)
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                            $
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            value={modifier.price}
                            onChange={(e) =>
                              updateModifier(
                                modifier.id,
                                "price",
                                e.target.value,
                              )
                            }
                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-all duration-200"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {modifiers.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <svg
                      className="w-12 h-12 mx-auto text-gray-400 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4.871 4A17.926 17.926 0 003 12c0 2.874.673 5.59 1.871 8m14.13 0a17.926 17.926 0 001.87-8 17.926 17.926 0 00-1.87-8M9 9h1.246a1 1 0 01.961.725l1.586 5.55a1 1 0 00.961.725H15"
                      />
                    </svg>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      No modifiers yet
                    </h4>
                    <p className="text-gray-500 mb-3">
                      Add optional modifications for this item
                    </p>
                    <button
                      onClick={addModifier}
                      className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors duration-200"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Add Your First Modifier
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Volume Pack Tab */}
          {activeTab === "volumePack" && (
            <div className="space-y-4">
              {/* Header Section */}
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Volume Packs
                  </h3>
                  <p className="text-sm text-gray-600">
                    Add bulk pricing options for this item
                  </p>
                </div>
                <button
                  onClick={addVolumePack}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-sm font-medium rounded-lg hover:from-orange-700 hover:to-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add Volume Pack
                </button>
              </div>

              <div className="space-y-4">
                {volumePacks.map((pack, index) => (
                  <div
                    key={pack.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900">
                        Volume Pack {index + 1}
                      </h4>
                      <button
                        onClick={() => removeVolumePack(pack.id)}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
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
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pack Quantity
                        </label>
                        <input
                          type="number"
                          value={pack.packQuantity}
                          onChange={(e) =>
                            updateVolumePack(
                              pack.id,
                              "packQuantity",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Quantity..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unit Cost
                        </label>
                        <input
                          type="text"
                          value={pack.unitCost}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pack Cost
                        </label>
                        <input
                          type="text"
                          value={pack.packCost}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pack Retail Price
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={pack.packRetailPrice}
                          onChange={(e) =>
                            updateVolumePack(
                              pack.id,
                              "packRetailPrice",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pack Margin (%)
                        </label>
                        <input
                          type="text"
                          value={pack.packMargin ? pack.packMargin + "%" : ""}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {volumePacks.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <svg
                      className="w-12 h-12 mx-auto text-gray-400 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      No volume packs yet
                    </h4>
                    <p className="text-gray-500 mb-3">
                      Add bulk pricing options for this item
                    </p>
                    <button
                      onClick={addVolumePack}
                      className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors duration-200"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Add Your First Volume Pack
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <span className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Required fields: UPC, Description
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <svg
                  className="w-4 h-4 mr-2"
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
                Save Item
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Item Overview Modal Component
const ItemOverviewModal = ({ isOpen, item, onClose }) => {
  const { token, selectedLocation } = useAuth();
  const [activeTab, setActiveTab] = useState("sales");
  const [salesData, setSalesData] = useState([]);
  const [purchaseData, setPurchaseData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get current month date range as default
  const getCurrentMonthRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const formatDate = (date) => {
      return date.toISOString().split("T")[0];
    };

    return {
      from: formatDate(startDate),
      to: formatDate(endDate),
    };
  };

  const [dateRange, setDateRange] = useState(getCurrentMonthRange());

  // Calculate margin percentage
  const calculateMargin = (retail, cost) => {
    if (!retail || !cost || retail === 0) return "0.00";
    const margin =
      ((parseFloat(retail) - parseFloat(cost)) / parseFloat(retail)) * 100;
    return margin.toFixed(2);
  };

  // Helper function to format dates for API
  const formatDateForAPI = (dateString, isStartDate) => {
    if (!dateString) return new Date().toISOString();
    const [year, month, day] = dateString.split("-").map(Number);

    if (isStartDate) {
      // Start date: beginning of day (6:00 AM UTC)
      return new Date(Date.UTC(year, month - 1, day, 6, 0, 0)).toISOString();
    } else {
      // End date: end of day (5:59:59 AM UTC next day)
      return new Date(
        Date.UTC(year, month - 1, day + 1, 5, 59, 59, 999),
      ).toISOString();
    }
  };

  // Load sales data when modal opens, tab changes, or date range changes
  useEffect(() => {
    const loadSalesData = async () => {
      if (!isOpen || !item || activeTab !== "sales") return;

      try {
        setLoading(true);

        const requestData = {
          barCode: item.scanCode || item.barCode,
          locationId: [selectedLocation.id],
          type: 3, // Sales history type
          startDate: formatDateForAPI(dateRange.from, true),
          endDate: formatDateForAPI(dateRange.to, false),
        };

        console.log("Loading sales data with request:", requestData);

        const response = await getItemFunctions(token, requestData);

        if (response.status === "success") {
          setSalesData(response.data || []);
        } else {
          console.error("Failed to load sales data:", response);
          setSalesData([]);
        }
      } catch (error) {
        console.error("Error loading sales data:", error);
        setSalesData([]);
      } finally {
        setLoading(false);
      }
    };

    loadSalesData();
  }, [isOpen, item, activeTab, dateRange, token, selectedLocation]);

  // Load purchase data when modal opens, tab changes, or date range changes
  useEffect(() => {
    const loadPurchaseData = async () => {
      if (!isOpen || !item || activeTab !== "purchase") return;

      try {
        setLoading(true);

        const requestData = {
          barCode: item.scanCode || item.barCode,
          locationId: [selectedLocation.id],
          type: 4, // Purchase history type
          startDate: formatDateForAPI(dateRange.from, true),
          endDate: formatDateForAPI(dateRange.to, false),
        };

        console.log("Loading purchase data with request:", requestData);

        const response = await getItemFunctions(token, requestData);

        if (response.status === "success") {
          setPurchaseData(response.data || []);
        } else {
          console.error("Failed to load purchase data:", response);
          setPurchaseData([]);
        }
      } catch (error) {
        console.error("Error loading purchase data:", error);
        setPurchaseData([]);
      } finally {
        setLoading(false);
      }
    };

    loadPurchaseData();
  }, [isOpen, item, activeTab, dateRange, token, selectedLocation]);

  // Reset date range to current month when modal opens
  useEffect(() => {
    if (isOpen) {
      setDateRange(getCurrentMonthRange());
      setActiveTab("sales");
      setSalesData([]);
      setPurchaseData([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 backdrop-blur-sm">
      <div className="relative top-2 mx-2 my-2 border w-auto max-w-[90vw] shadow-2xl rounded-xl bg-white min-h-[700px] max-h-[90vh] flex flex-col sm:mx-auto sm:w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-xl flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Item Overview</h2>
              <p className="text-sm text-gray-600">
                {item?.description || "Item Details"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white hover:bg-opacity-80 rounded-lg transition-all duration-200"
          >
            <svg
              className="w-6 h-6"
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

        {/* Tab Navigation */}
        <div className="flex-shrink-0 px-6 pt-6">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {["sales", "purchase", "auditLog"].map((tab) => {
              const tabIcon = {
                sales: (
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                ),
                purchase: (
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
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                ),
                auditLog: (
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
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                ),
              };

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm capitalize transition-all duration-200 flex-1 justify-center ${
                    activeTab === tab
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {tabIcon[tab]}
                  {tab === "auditLog" ? "Audit Log" : tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4 flex flex-col">
          {activeTab === "sales" && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Sales History
                </h3>
              </div>

              {/* Date Range Picker */}
              <div className="mb-6">
                <div className="w-64">
                  <DateRangePicker
                    label="Date Range"
                    value={dateRange}
                    onChange={setDateRange}
                    placeholder="Select date range"
                    disableClear={true}
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <span className="ml-3 text-gray-600">
                    Loading sales data...
                  </span>
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  {/* Table Container */}
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex-1">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Date & Time
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Quantity
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Unit Cost
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Retail Price
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Margin (%)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {salesData.length > 0 ? (
                          salesData.map((sale, index) => (
                            <tr
                              key={index}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                                {new Date(sale.date).toLocaleDateString()}{" "}
                                {new Date(sale.date).toLocaleTimeString()}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                                {sale.quantity}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                                ${sale.cost}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                                ${sale.retail}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {calculateMargin(sale.retail, sale.cost)}%
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="5"
                              className="px-4 py-8 text-center text-gray-500"
                            >
                              No sales data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer - matching Purchase Orders style */}
                  {salesData.length > 0 && (
                    <div className="flex items-center justify-between mt-4 px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
                      <div>
                        Showing 1 to {salesData.length} of {salesData.length}{" "}
                        results
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Items per page:</span>
                        <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                          <option>{salesData.length}</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Close button at bottom right */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {activeTab === "purchase" && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Purchase History
                </h3>
              </div>

              {/* Date Range Picker */}
              <div className="mb-6">
                <div className="w-64">
                  <DateRangePicker
                    label="Date Range"
                    value={dateRange}
                    onChange={setDateRange}
                    placeholder="Select date range"
                    disableClear={true}
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <span className="ml-3 text-gray-600">
                    Loading purchase data...
                  </span>
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  {/* Table Container */}
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex-1">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Payee Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Quantity
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Cost
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Retail
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {purchaseData.length > 0 ? (
                          purchaseData.map((purchase, index) => (
                            <tr
                              key={index}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                                {new Date(purchase.date).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                                {purchase.payeeName}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                                {purchase.quantity}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                                ${purchase.cost}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                ${purchase.retail}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="5"
                              className="px-4 py-8 text-center text-gray-500"
                            >
                              No purchase data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer - matching Sales tab style */}
                  {purchaseData.length > 0 && (
                    <div className="flex items-center justify-between mt-4 px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
                      <div>
                        Showing 1 to {purchaseData.length} of{" "}
                        {purchaseData.length} results
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Items per page:</span>
                        <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                          <option>{purchaseData.length}</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Close button at bottom right */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {activeTab === "auditLog" && (
            <div className="text-center py-8">
              <p className="text-gray-500">Audit log coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemsList;
