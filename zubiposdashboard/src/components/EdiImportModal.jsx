import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import {
  importEdiFile,
  convertEdiItemsToPOFormat,
} from "../services/ediService";
import { getEdiVendors } from "../services/ediVendorService";
import { departmentService } from "../services/departmentService";
import { getAllTax } from "../services/taxService";
import { getMinAge } from "../services/ageService";
import SearchableDropdown from "./SearchableDropdown";
import DepartmentDropdown from "./DepartmentDropdown";
import {
  calculateMarginPercentage,
  formatMarginDisplay,
} from "../utils/marginCalculation";

const EdiImportModal = ({ isOpen, onClose, onImport }) => {
  const { selectedLocation, token } = useAuth();
  const { showError, showSuccess } = useNotification();

  // State management
  const [selectedVendor, setSelectedVendor] = useState("");
  const [vendors, setVendors] = useState([]);
  const [vendorLoading, setVendorLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importedData, setImportedData] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Department data
  const [departments, setDepartments] = useState([]);
  const [departmentLoading, setDepartmentLoading] = useState(false);

  // Tax and Age options
  const [taxOptions, setTaxOptions] = useState([]);
  const [ageOptions, setAgeOptions] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Column resizing and table interaction state
  const [columnWidths, setColumnWidths] = useState({});
  const [resizing, setResizing] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // Filter popup state
  const [activeFilterColumn, setActiveFilterColumn] = useState(null);
  const [tempFilterValues, setTempFilterValues] = useState({});

  // Bulk selection state
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkOperations, setShowBulkOperations] = useState(false);
  const [bulkUpdateField, setBulkUpdateField] = useState("");
  const [bulkUpdateValue, setBulkUpdateValue] = useState("");

  // Inline editing state
  const [editingCell, setEditingCell] = useState(null);
  const [editingValues, setEditingValues] = useState({});

  // Validation state
  const [validationErrors, setValidationErrors] = useState([]);
  const [showValidationError, setShowValidationError] = useState(false);

  // Refs for column resizing
  const tableRef = useRef(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // Load vendors, departments, tax and age options when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchVendors();
      fetchDepartments();
      fetchTaxOptions();
      fetchAgeOptions();
    }
  }, [isOpen]);

  // Update filtered data when imported data or filters change
  useEffect(() => {
    if (importedData) {
      applyFiltersAndSort();
    }
  }, [importedData, filters, sortConfig]);

  // Reset to first page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredData.length]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const fetchVendors = async () => {
    const locationId =
      selectedLocation?.id || "142b5b91-3ff7-4777-ac88-3d28a0960783";

    try {
      setVendorLoading(true);
      const response = await getEdiVendors(locationId, token);
      if (response.status === "success") {
        setVendors(response.data);
      }
    } catch (error) {
      console.error("Error fetching EDI vendors:", error);
      showError("EDI Vendor Load Error", "Failed to load EDI vendors");
    } finally {
      setVendorLoading(false);
    }
  };

  const fetchDepartments = async () => {
    const locationId =
      selectedLocation?.id || "142b5b91-3ff7-4777-ac88-3d28a0960783";

    if (!locationId) return;

    try {
      setDepartmentLoading(true);

      const response = await departmentService.getDepartments(
        token,
        locationId,
      );

      if (response.status === "success") {
        setDepartments(response.data);
      } else {
        console.error("Failed to fetch departments:", response.message);
        // Fallback to empty array if API fails
        setDepartments([]);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      // Fallback to empty array if API fails
      setDepartments([]);
    } finally {
      setDepartmentLoading(false);
    }
  };

  const fetchTaxOptions = async () => {
    const locationId =
      selectedLocation?.id || "142b5b91-3ff7-4777-ac88-3d28a0960783";

    if (!locationId) return;

    try {
      const body = { locationId };
      const response = await getAllTax(token, body);

      if (response.status === "success") {
        const mappedTax = response.data.map((tax) => ({
          id: tax.id,
          name: tax.name,
          tax: tax.tax,
          value: tax.name,
          label: tax.name,
        }));
        setTaxOptions(mappedTax);
      } else {
        setTaxOptions([]);
      }
    } catch (error) {
      console.error("Error fetching tax options:", error);
      setTaxOptions([]);
    }
  };

  const fetchAgeOptions = async () => {
    const locationId =
      selectedLocation?.id || "142b5b91-3ff7-4777-ac88-3d28a0960783";

    if (!locationId) return;

    try {
      const body = { locationId };
      const response = await getMinAge(token, body);

      if (response.status === "success") {
        const mappedAge = response.data.map((age) => ({
          id: age.id,
          minAge: age.minAge,
          value: age.minAge,
          label: age.minAge,
        }));
        setAgeOptions(mappedAge);
      } else {
        setAgeOptions([]);
      }
    } catch (error) {
      console.error("Error fetching age options:", error);
      setAgeOptions([]);
    }
  };

  // Margin calculation utilities
  const calculateMargin = (caseCost, unitCase, retail) => {
    const cost = parseFloat(caseCost) || 0;
    const units = parseFloat(unitCase) || 1;
    const retailPrice = parseFloat(retail) || 0;

    if (retailPrice === 0) return 0;

    const unitCost = cost / units;
    const margin = retailPrice - unitCost;
    const marginPercentage = (margin / retailPrice) * 100;

    return marginPercentage;
  };

  const updateItemWithCalculations = (item, field, value) => {
    const updatedItem = { ...item, [field]: value };

    // Recalculate unitCost if case cost or unit case changes
    if (field === "caseCost" || field === "unitCase") {
      const caseCost = parseFloat(updatedItem.caseCost) || 0;
      const unitCase = parseFloat(updatedItem.unitCase) || 1;
      updatedItem.unitCost = caseCost / unitCase;
    }

    // Recalculate margin if case cost, unit case, or retail changes
    if (field === "caseCost" || field === "unitCase" || field === "retail") {
      const margin = calculateMarginPercentage(
        updatedItem.retail,
        updatedItem.caseCost,
        updatedItem.unitCase,
      );
      updatedItem.margin = margin;
    }

    return updatedItem;
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [".csv", ".xlsx", ".xls", ".edi", ".txt"];
      const fileExtension = "." + file.name.split(".").pop().toLowerCase();

      if (allowedTypes.includes(fileExtension)) {
        setSelectedFile(file);
      } else {
        showError(
          "Invalid File Type",
          `Please select a valid file type: ${allowedTypes.join(", ")}`,
        );
        event.target.value = "";
      }
    }
  };

  const handleProcess = async () => {
    if (!selectedVendor) {
      showError("Vendor Required", "Please select a vendor before processing");
      return;
    }

    if (!selectedFile) {
      showError("File Required", "Please select a file to import");
      return;
    }

    const locationId =
      selectedLocation?.id || "142b5b91-3ff7-4777-ac88-3d28a0960783";

    setIsProcessing(true);
    try {
      // Import EDI file
      const ediResponse = await importEdiFile(selectedFile, locationId, token);

      // Convert to display format with status
      const formattedItems = convertEdiItemsToPOFormat(
        ediResponse,
        departments,
        taxOptions,
        ageOptions,
      );

      // Add status and vendor info to items
      const itemsWithStatus = [
        ...formattedItems
          .filter((item) => item.isNewProduct !== false)
          .map((item) => ({ ...item, status: "New" })),
        ...formattedItems
          .filter((item) => item.isNewProduct === false)
          .map((item) => ({ ...item, status: "Old" })),
      ];

      setImportedData(itemsWithStatus);
      // Success notification removed to avoid popup behind modal
    } catch (error) {
      console.error("EDI import error:", error);
      showError(
        "Import Failed",
        `Failed to process EDI file: ${error.message}`,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const applyFiltersAndSort = () => {
    if (!importedData) return;

    let filtered = [...importedData];

    // Apply filters
    Object.entries(filters).forEach(([column, filterValue]) => {
      if (filterValue && filterValue.trim() !== "") {
        if (filterValue === "EMPTY_VALUE_FILTER") {
          filtered = filtered.filter((item) => {
            const cellValue = item[column];
            return !cellValue || cellValue.toString().trim() === "";
          });
        } else if (filterValue === "NON_EMPTY_VALUE_FILTER") {
          filtered = filtered.filter((item) => {
            const cellValue = item[column];
            return cellValue && cellValue.toString().trim() !== "";
          });
        } else {
          filtered = filtered.filter((item) => {
            const cellValue = String(item[column] || "").toLowerCase();
            return cellValue.includes(filterValue.toLowerCase());
          });
        }
      }
    });

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key] || "";
        const bValue = b[sortConfig.key] || "";

        if (sortConfig.direction === "asc") {
          return String(aValue).localeCompare(String(bValue));
        } else {
          return String(bValue).localeCompare(String(aValue));
        }
      });
    }

    setFilteredData(filtered);
  };

  const handleSort = (columnKey) => {
    setSortConfig((prev) => ({
      key: columnKey,
      direction:
        prev.key === columnKey && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleFilterChange = (column, value) => {
    setFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  // Filter popup handlers
  const handleFilterIconClick = (e, columnKey) => {
    e.stopPropagation();
    if (activeFilterColumn === columnKey) {
      setActiveFilterColumn(null);
    } else {
      setActiveFilterColumn(columnKey);
      setTempFilterValues({
        [columnKey]: filters[columnKey] || "",
      });
    }
  };

  const handleFilterApply = (columnKey) => {
    const value = tempFilterValues[columnKey] || "";
    handleFilterChange(columnKey, value);
    setActiveFilterColumn(null);
    setTempFilterValues({});
  };

  const handleFilterClear = (columnKey) => {
    handleFilterChange(columnKey, "");
    setActiveFilterColumn(null);
    setTempFilterValues({});
  };

  const handleFilterCancel = () => {
    setActiveFilterColumn(null);
    setTempFilterValues({});
  };

  const handleTempFilterChange = (columnKey, value) => {
    setTempFilterValues((prev) => ({
      ...prev,
      [columnKey]: value,
    }));
  };

  // Inline editing handlers
  const handleCellEdit = (rowIndex, columnKey) => {
    const actualIndex = startIndex + rowIndex;
    const item = paginatedData[rowIndex];

    setEditingCell({ rowIndex: actualIndex, columnKey });
    setEditingValues({
      ...editingValues,
      [`${actualIndex}-${columnKey}`]: item[columnKey] || "",
    });
  };

  const handleCellChange = (rowIndex, columnKey, value) => {
    const key = `${rowIndex}-${columnKey}`;

    // If department is being changed, auto-set tax, age, and ebt
    if (columnKey === "department") {
      const selectedDepartment = departments.find(
        (dept) => dept.name === value,
      );

      if (selectedDepartment) {
        // Set department and related fields including all IDs
        const updatedValues = {
          ...editingValues,
          [key]: value,
          [`${rowIndex}-tax`]: selectedDepartment.tax
            ? selectedDepartment.tax.name
            : "no tax",
          [`${rowIndex}-age`]: selectedDepartment.minAge
            ? selectedDepartment.minAge.minAge
            : "no restriction",
          [`${rowIndex}-ebt`]: selectedDepartment.ebt || false,
          // Store IDs for API calls
          [`${rowIndex}-departmentId`]: selectedDepartment.id,
          [`${rowIndex}-departmentLocationId`]:
            selectedDepartment.departmentLocationId,
          [`${rowIndex}-taxId`]: selectedDepartment.tax
            ? selectedDepartment.tax.id
            : "",
          [`${rowIndex}-minAgeId`]: selectedDepartment.minAge
            ? selectedDepartment.minAge.id
            : "",
          [`${rowIndex}-departmentTaxId`]: selectedDepartment.tax
            ? selectedDepartment.tax.id
            : "",
          [`${rowIndex}-departmentminAgeId`]: selectedDepartment.minAge
            ? selectedDepartment.minAge.id
            : "",
        };
        setEditingValues(updatedValues);
      } else {
        setEditingValues({
          ...editingValues,
          [key]: value,
        });
      }
    } else {
      setEditingValues({
        ...editingValues,
        [key]: value,
      });
    }
  };

  const handleCellSave = (rowIndex, columnKey) => {
    const key = `${rowIndex}-${columnKey}`;
    const value = editingValues[key];

    // Find the actual item in filteredData using the row index from pagination
    const paginatedRowIndex = rowIndex - startIndex;
    const itemToUpdate = paginatedData[paginatedRowIndex];

    if (!itemToUpdate) {
      console.error("Item not found for update");
      return;
    }

    // Start with the item update
    let updatedItem = updateItemWithCalculations(
      itemToUpdate,
      columnKey,
      value,
    );

    // If department was changed, also update tax, age, ebt and all IDs
    if (columnKey === "department") {
      const taxKey = `${rowIndex}-tax`;
      const ageKey = `${rowIndex}-age`;
      const ebtKey = `${rowIndex}-ebt`;
      const departmentIdKey = `${rowIndex}-departmentId`;
      const departmentLocationIdKey = `${rowIndex}-departmentLocationId`;
      const taxIdKey = `${rowIndex}-taxId`;
      const minAgeIdKey = `${rowIndex}-minAgeId`;
      const departmentTaxIdKey = `${rowIndex}-departmentTaxId`;
      const departmentminAgeIdKey = `${rowIndex}-departmentminAgeId`;

      if (editingValues[taxKey] !== undefined) {
        updatedItem.tax = editingValues[taxKey];
      }
      if (editingValues[ageKey] !== undefined) {
        updatedItem.age = editingValues[ageKey];
      }
      if (editingValues[ebtKey] !== undefined) {
        updatedItem.ebt = editingValues[ebtKey];
      }
      // Update all IDs for API calls
      if (editingValues[departmentIdKey] !== undefined) {
        updatedItem.departmentId = editingValues[departmentIdKey];
      }
      if (editingValues[departmentLocationIdKey] !== undefined) {
        updatedItem.departmentLocationId =
          editingValues[departmentLocationIdKey];
      }
      if (editingValues[taxIdKey] !== undefined) {
        updatedItem.taxId = editingValues[taxIdKey];
      }
      if (editingValues[minAgeIdKey] !== undefined) {
        updatedItem.minAgeId = editingValues[minAgeIdKey];
      }
      if (editingValues[departmentTaxIdKey] !== undefined) {
        updatedItem.departmentTaxId = editingValues[departmentTaxIdKey];
      }
      if (editingValues[departmentminAgeIdKey] !== undefined) {
        updatedItem.departmentminAgeId = editingValues[departmentminAgeIdKey];
      }
    }

    // Update both filteredData and importedData
    const newFilteredData = [...filteredData];
    const newImportedData = [...importedData];

    // Find and update in filteredData
    const filteredIndex = newFilteredData.findIndex(
      (item) =>
        item.id === itemToUpdate.id ||
        (item.upc === itemToUpdate.upc &&
          item.description === itemToUpdate.description),
    );
    if (filteredIndex !== -1) {
      newFilteredData[filteredIndex] = updatedItem;
    }

    // Find and update in importedData
    const importedIndex = newImportedData.findIndex(
      (item) =>
        item.id === itemToUpdate.id ||
        (item.upc === itemToUpdate.upc &&
          item.description === itemToUpdate.description),
    );
    if (importedIndex !== -1) {
      newImportedData[importedIndex] = updatedItem;
    }

    setFilteredData(newFilteredData);
    setImportedData(newImportedData);
    setEditingCell(null);

    // Clean up editing values
    const newEditingValues = { ...editingValues };
    delete newEditingValues[key];

    // If department was changed, also clean up related fields and IDs
    if (columnKey === "department") {
      delete newEditingValues[`${rowIndex}-tax`];
      delete newEditingValues[`${rowIndex}-age`];
      delete newEditingValues[`${rowIndex}-ebt`];
      delete newEditingValues[`${rowIndex}-departmentId`];
      delete newEditingValues[`${rowIndex}-departmentLocationId`];
      delete newEditingValues[`${rowIndex}-taxId`];
      delete newEditingValues[`${rowIndex}-minAgeId`];
      delete newEditingValues[`${rowIndex}-departmentTaxId`];
      delete newEditingValues[`${rowIndex}-departmentminAgeId`];
    }

    setEditingValues(newEditingValues);
  };

  const handleCellCancel = () => {
    setEditingCell(null);
  };

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all current page items
      const newSelection = new Set(selectedRows);
      paginatedData.forEach((item) => {
        const itemId = item.id || `${item.upc}-${item.description}`;
        newSelection.delete(itemId);
      });
      setSelectedRows(newSelection);
    } else {
      // Select all current page items
      const newSelection = new Set(selectedRows);
      paginatedData.forEach((item) => {
        const itemId = item.id || `${item.upc}-${item.description}`;
        newSelection.add(itemId);
      });
      setSelectedRows(newSelection);
    }
  };

  const handleRowSelect = (item, rowIndex) => {
    const itemId = item.id || `${item.upc}-${item.description}`;
    const newSelection = new Set(selectedRows);

    if (selectedRows.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }

    setSelectedRows(newSelection);
  };

  // Bulk operations handlers
  const handleBulkUpdate = () => {
    if (!bulkUpdateField || !bulkUpdateValue || selectedRows.size === 0) {
      showError(
        "Invalid Input",
        "Please select field, value, and rows to update",
      );
      return;
    }

    // Update selected items with calculations
    const newFilteredData = [...filteredData];
    const newImportedData = [...importedData];

    selectedRows.forEach((itemId) => {
      // Find the item in current filtered data using the item ID
      const itemToUpdate = filteredData.find((item) => {
        const currentItemId = item.id || `${item.upc}-${item.description}`;
        return currentItemId === itemId;
      });

      if (itemToUpdate) {
        let updatedItem = updateItemWithCalculations(
          itemToUpdate,
          bulkUpdateField,
          bulkUpdateValue,
        );

        // If bulk updating department, also update tax, age, and ebt
        if (bulkUpdateField === "department") {
          const selectedDepartment = departments.find(
            (dept) => dept.name === bulkUpdateValue,
          );

          if (selectedDepartment) {
            updatedItem = {
              ...updatedItem,
              tax: selectedDepartment.tax
                ? selectedDepartment.tax.name
                : "no tax",
              age: selectedDepartment.minAge
                ? selectedDepartment.minAge.minAge
                : "no restriction",
              ebt: selectedDepartment.ebt || false,
              // Update all IDs for API calls
              departmentId: selectedDepartment.id,
              departmentLocationId: selectedDepartment.departmentLocationId,
              taxId: selectedDepartment.tax ? selectedDepartment.tax.id : "",
              minAgeId: selectedDepartment.minAge
                ? selectedDepartment.minAge.id
                : "",
              departmentTaxId: selectedDepartment.tax
                ? selectedDepartment.tax.id
                : "",
              departmentminAgeId: selectedDepartment.minAge
                ? selectedDepartment.minAge.id
                : "",
            };
          }
        }

        // Find and update in filteredData
        const filteredIndex = newFilteredData.findIndex(
          (item) =>
            item.id === itemToUpdate.id ||
            (item.upc === itemToUpdate.upc &&
              item.description === itemToUpdate.description),
        );
        if (filteredIndex !== -1) {
          newFilteredData[filteredIndex] = updatedItem;
        }

        // Find and update in importedData
        const importedIndex = newImportedData.findIndex(
          (item) =>
            item.id === itemToUpdate.id ||
            (item.upc === itemToUpdate.upc &&
              item.description === itemToUpdate.description),
        );
        if (importedIndex !== -1) {
          newImportedData[importedIndex] = updatedItem;
        }
      }
    });

    setFilteredData(newFilteredData);
    setImportedData(newImportedData);

    showSuccess(
      "Bulk Update Complete",
      `Updated ${selectedRows.size} rows with ${bulkUpdateField}: ${bulkUpdateValue}`,
    );

    // Reset bulk operations
    setBulkUpdateField("");
    setBulkUpdateValue("");
    setSelectedRows(new Set());
  };

  const handleBulkDelete = () => {
    if (selectedRows.size === 0) {
      showError("No Selection", "Please select rows to delete");
      return;
    }

    // Get items to delete using item IDs
    const itemsToDelete = [];
    selectedRows.forEach((itemId) => {
      const itemToDelete = filteredData.find((item) => {
        const currentItemId = item.id || `${item.upc}-${item.description}`;
        return currentItemId === itemId;
      });
      if (itemToDelete) {
        itemsToDelete.push(itemToDelete);
      }
    });

    // Remove items from both data arrays using item identification
    const newFilteredData = filteredData.filter(
      (item) =>
        !itemsToDelete.some(
          (deleteItem) =>
            item.id === deleteItem.id ||
            (item.upc === deleteItem.upc &&
              item.description === deleteItem.description),
        ),
    );

    const newImportedData = importedData.filter(
      (item) =>
        !itemsToDelete.some(
          (deleteItem) =>
            item.id === deleteItem.id ||
            (item.upc === deleteItem.upc &&
              item.description === deleteItem.description),
        ),
    );

    setFilteredData(newFilteredData);
    setImportedData(newImportedData);
    setSelectedRows(new Set());

    showSuccess(
      "Bulk Delete Complete",
      `Deleted ${selectedRows.size} selected rows`,
    );
  };

  const handleClearSelection = () => {
    setSelectedRows(new Set());
    setBulkUpdateField("");
    setBulkUpdateValue("");
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Column resizing handlers
  const handleMouseDown = (e, columnKey) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(columnKey);
    startXRef.current = e.clientX;
    startWidthRef.current = columnWidths[columnKey];

    // Add cursor style to body
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (e) => {
      if (!resizing && columnKey) {
        const diff = e.clientX - startXRef.current;
        const newWidth = Math.max(60, startWidthRef.current + diff);

        setColumnWidths((prev) => ({
          ...prev,
          [columnKey]: newWidth,
        }));
      }
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

  // Edit and delete handlers
  const handleEditItem = (rowIndex) => {
    // Enable inline editing for the entire row
    const actualIndex = startIndex + rowIndex;
    const item = paginatedData[rowIndex];

    // Set all editable cells for this row to editing mode
    const editableCells = [
      "description",
      "department",
      "quantity",
      "unitCase",
      "caseCost",
      "retail",
    ];
    const newEditingValues = { ...editingValues };

    editableCells.forEach((field) => {
      newEditingValues[`${actualIndex}-${field}`] = item[field] || "";
    });

    setEditingValues(newEditingValues);
    setEditingItem({ index: actualIndex, data: { ...item } });
    console.log("Edit item 1:", item);
  };

  const handleDeleteItem = (rowIndex) => {
    const item = paginatedData[rowIndex];

    if (!item) return;

    // Remove item from both data arrays
    const newFilteredData = filteredData.filter(
      (dataItem) =>
        dataItem.id !== item.id &&
        !(
          dataItem.upc === item.upc && dataItem.description === item.description
        ),
    );

    const newImportedData = importedData.filter(
      (dataItem) =>
        dataItem.id !== item.id &&
        !(
          dataItem.upc === item.upc && dataItem.description === item.description
        ),
    );

    setFilteredData(newFilteredData);
    setImportedData(newImportedData);

    // Remove from selection if it was selected
    const itemId = item.id || `${item.upc}-${item.description}`;
    if (selectedRows.has(itemId)) {
      const newSelection = new Set(selectedRows);
      newSelection.delete(itemId);
      setSelectedRows(newSelection);
    }

    console.log("Deleted item:", item);
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

  // Format value based on column type - matching DataGrid
  const formatValue = (value, column) => {
    if (column.type === "currency") {
      return `$${(parseFloat(value) || 0).toFixed(2)}`;
    }
    if (column.type === "percentage") {
      return formatMarginDisplay(parseFloat(value) || 0);
    }
    if (column.type === "boolean") {
      return value ? "Yes" : "No";
    }
    return value || "";
  };

  // Validation function for Add to Purchase Order
  const validateItemsForPurchaseOrder = (items) => {
    const errors = [];

    items.forEach((item, index) => {
      const issues = [];

      if (!item.department || item.department.trim() === "") {
        issues.push("Department is required");
      }

      if (
        !item.quantity ||
        item.quantity === "" ||
        parseFloat(item.quantity) <= 0
      ) {
        issues.push("Quantity must be greater than 0");
      }

      if (issues.length > 0) {
        errors.push({
          index,
          item,
          issues,
        });
      }
    });

    return errors;
  };

  const applyPendingEdits = (data) => {
    // Apply any pending edits from editingValues to the data
    const updatedData = data.map((item, index) => {
      const actualIndex = index; // Assuming we're working with the full dataset
      let updatedItem = { ...item };

      // Check if there are any pending edits for this row
      Object.keys(editingValues).forEach((key) => {
        const [rowIndex, fieldKey] = key.split("-");
        if (parseInt(rowIndex) === actualIndex) {
          if (fieldKey === "department") {
            // Special handling for department changes
            const departmentValue = editingValues[key];
            updatedItem.department = departmentValue;

            // Also apply related fields that were updated with department
            const taxKey = `${rowIndex}-tax`;
            const ageKey = `${rowIndex}-age`;
            const ebtKey = `${rowIndex}-ebt`;
            const departmentIdKey = `${rowIndex}-departmentId`;
            const departmentLocationIdKey = `${rowIndex}-departmentLocationId`;
            const taxIdKey = `${rowIndex}-taxId`;
            const minAgeIdKey = `${rowIndex}-minAgeId`;
            const departmentTaxIdKey = `${rowIndex}-departmentTaxId`;
            const departmentminAgeIdKey = `${rowIndex}-departmentminAgeId`;

            if (editingValues[taxKey] !== undefined)
              updatedItem.tax = editingValues[taxKey];
            if (editingValues[ageKey] !== undefined)
              updatedItem.age = editingValues[ageKey];
            if (editingValues[ebtKey] !== undefined)
              updatedItem.ebt = editingValues[ebtKey];
            if (editingValues[departmentIdKey] !== undefined)
              updatedItem.departmentId = editingValues[departmentIdKey];
            if (editingValues[departmentLocationIdKey] !== undefined)
              updatedItem.departmentLocationId =
                editingValues[departmentLocationIdKey];
            if (editingValues[taxIdKey] !== undefined)
              updatedItem.taxId = editingValues[taxIdKey];
            if (editingValues[minAgeIdKey] !== undefined)
              updatedItem.minAgeId = editingValues[minAgeIdKey];
            if (editingValues[departmentTaxIdKey] !== undefined)
              updatedItem.departmentTaxId = editingValues[departmentTaxIdKey];
            if (editingValues[departmentminAgeIdKey] !== undefined)
              updatedItem.departmentminAgeId =
                editingValues[departmentminAgeIdKey];
          } else {
            // Handle other field edits
            updatedItem[fieldKey] = editingValues[key];
          }
        }
      });

      // Recalculate margin and other computed fields if cost/retail changed
      if (
        updatedItem.caseCost !== item.caseCost ||
        updatedItem.retail !== item.retail ||
        updatedItem.unitCase !== item.unitCase
      ) {
        const caseCost = parseFloat(updatedItem.caseCost) || 0;
        const unitCase = parseFloat(updatedItem.unitCase) || 1;
        const retail = parseFloat(updatedItem.retail) || 0;

        updatedItem.unitCost = caseCost / unitCase;
        updatedItem.margin = calculateMarginPercentage(
          retail,
          caseCost,
          unitCase,
        );
        updatedItem.totalCost =
          (parseFloat(updatedItem.quantity) || 1) * (caseCost / unitCase);
      }

      return updatedItem;
    });

    return updatedData;
  };

  const handleImport = () => {
    if (filteredData && filteredData.length > 0) {
      // Apply any pending edits before validation and import
      const dataWithEdits = applyPendingEdits(filteredData);

      // Validate items before importing
      const validation = validateItemsForPurchaseOrder(dataWithEdits);

      if (validation.length > 0) {
        setValidationErrors(validation);
        setShowValidationError(true);

        // Show error message with count of invalid items
        showError(
          "Validation Error",
          `${validation.length} item(s) have missing Department or invalid Quantity. Please fix the highlighted rows before adding to Purchase Order.`,
        );
        return;
      }

      // Clear any previous validation errors
      setValidationErrors([]);
      setShowValidationError(false);

      console.log("Sending EDI data with applied edits:", dataWithEdits);

      // Close modal immediately
      handleClose();

      // Start the import process
      onImport(dataWithEdits);
    }
  };

  // Render cell content - matching DataGrid style with inline editing
  const renderCell = (row, column, rowIndex) => {
    const value = row[column.key];
    const itemId = row.id || `${row.upc}-${row.description}`;
    const actualIndex = startIndex + rowIndex;
    const isEditing = editingItem && editingItem.index === actualIndex;
    const editKey = `${actualIndex}-${column.key}`;
    const editValue = editingValues[editKey];

    if (column.key === "select") {
      return (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={selectedRows.has(itemId)}
            onChange={() => handleRowSelect(row, rowIndex)}
            className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
          />
        </div>
      );
    }

    if (column.key === "action") {
      return (
        <div className="flex items-center justify-center gap-1">
          {isEditing ? (
            <>
              {/* Save Button */}
              <button
                key="save-btn"
                onClick={() => {
                  // Save all edited fields for this row
                  const editableCells = [
                    "description",
                    "department",
                    "quantity",
                    "unitCase",
                    "caseCost",
                    "retail",
                    "age",
                    "tax",
                    "ebt",
                  ];

                  // Get the item to update from current paginated data
                  const paginatedRowIndex = rowIndex;
                  const itemToUpdate = paginatedData[paginatedRowIndex];

                  if (itemToUpdate) {
                    // Build updated item from all editing values
                    let updatedItem = { ...itemToUpdate };

                    editableCells.forEach((field) => {
                      const key = `${actualIndex}-${field}`;
                      if (editingValues[key] !== undefined) {
                        updatedItem = updateItemWithCalculations(
                          updatedItem,
                          field,
                          editingValues[key],
                        );
                      }
                    });

                    // If department was changed, ensure tax, age, and ebt are also updated
                    const departmentKey = `${actualIndex}-department`;
                    if (editingValues[departmentKey] !== undefined) {
                      const selectedDepartment = departments.find(
                        (dept) => dept.name === editingValues[departmentKey],
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

                    // Update both filteredData and importedData
                    const newFilteredData = [...filteredData];
                    const newImportedData = [...importedData];

                    // Find and update in filteredData
                    const filteredIndex = newFilteredData.findIndex(
                      (item) =>
                        item.id === itemToUpdate.id ||
                        (item.upc === itemToUpdate.upc &&
                          item.description === itemToUpdate.description),
                    );
                    if (filteredIndex !== -1) {
                      newFilteredData[filteredIndex] = updatedItem;
                    }

                    // Find and update in importedData
                    const importedIndex = newImportedData.findIndex(
                      (item) =>
                        item.id === itemToUpdate.id ||
                        (item.upc === itemToUpdate.upc &&
                          item.description === itemToUpdate.description),
                    );
                    if (importedIndex !== -1) {
                      newImportedData[importedIndex] = updatedItem;
                    }

                    setFilteredData(newFilteredData);
                    setImportedData(newImportedData);

                    console.log("newEditingValues", { ...editingValues });

                    // Clean up all editing values for this row
                    const newEditingValues = { ...editingValues };
                    editableCells.forEach((field) => {
                      const key = `${actualIndex}-${field}`;
                      delete newEditingValues[key];
                    });

                    setEditingValues(newEditingValues);
                  }

                  setEditingItem(null);
                }}
                className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
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

              {/* Cancel Button */}
              <button
                key="cancel-btn"
                onClick={() => {
                  setEditingItem(null);
                  setEditingValues({});
                }}
                className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
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
              {/* Edit Button */}
              <button
                key="edit-btn"
                onClick={() => handleEditItem(rowIndex)}
                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
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

              {/* Delete Button */}
              <button
                key="delete-btn"
                onClick={() => handleDeleteItem(rowIndex)}
                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
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
          className={`inline-flex px-2 py-1 text-xs rounded-full ${
            value === "New"
              ? "bg-green-100 text-green-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {value}
        </span>
      );
    }

    // Handle inline editing for editable cells
    const editableCells = [
      "description",
      "department",
      "quantity",
      "unitCase",
      "caseCost",
      "retail",
      "age",
      "tax",
      "ebt",
    ];
    if (isEditing && editableCells.includes(column.key)) {
      if (column.key === "department") {
        return (
          <div className="w-full min-w-40">
            <DepartmentDropdown
              value={editValue !== undefined ? editValue : value}
              onChange={(newValue) => {
                handleCellChange(actualIndex, column.key, newValue);
              }}
              placeholder="Select Department"
            />
          </div>
        );
      } else if (column.key === "ebt") {
        return (
          <div className="flex justify-center">
            <input
              type="checkbox"
              checked={editValue !== undefined ? editValue : value}
              onChange={(e) =>
                handleCellChange(actualIndex, column.key, e.target.checked)
              }
              className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
            />
          </div>
        );
      } else if (column.key === "age" || column.key === "tax") {
        // Age and Tax are read-only (auto-set by department)
        return (
          <div className="px-2 py-1 rounded text-sm bg-gray-50 text-gray-600">
            {editValue !== undefined ? editValue : value} (auto-set by
            department)
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
            value={editValue !== undefined ? editValue : value}
            onChange={(e) =>
              handleCellChange(actualIndex, column.key, e.target.value)
            }
            step={column.type === "currency" ? "0.01" : undefined}
            className="w-full px-2 py-1 text-sm border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        );
      }
    }

    // Readonly margin during editing
    if (column.key === "margin" && isEditing) {
      return (
        <div className="px-2 py-1 rounded text-sm bg-gray-50 text-gray-600">
          {formatValue(value, column)} (auto-calculated)
        </div>
      );
    }

    // Check if this cell has validation error
    const hasError =
      showValidationError &&
      validationErrors.some((error) => {
        const originalIndex = filteredData.findIndex(
          (filteredItem) =>
            filteredItem.id === row.id ||
            (filteredItem.upc === row.upc &&
              filteredItem.description === row.description),
        );
        if (error.index === originalIndex) {
          if (column.key === "department") {
            return error.issues.some((issue) => issue.includes("Department"));
          }
          if (column.key === "quantity") {
            return error.issues.some((issue) => issue.includes("Quantity"));
          }
        }
        return false;
      });

    // Special rendering for EBT field when not editing
    if (column.key === "ebt" && !isEditing) {
      return (
        <div className="flex justify-center">
          {value ? (
            <span className="text-green-600 font-bold">✓</span>
          ) : (
            <span className="text-gray-400">✗</span>
          )}
        </div>
      );
    }

    // Apply margin color formatting if this is a percentage column
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

  const handleClose = () => {
    setSelectedVendor("");
    setSelectedFile(null);
    setImportedData(null);
    setFilteredData([]);
    setFilters({});
    setSortConfig({ key: null, direction: "asc" });
    setCurrentPage(1);
    setItemsPerPage(50);
    setEditingItem(null);
    setEditingCell(null);
    setEditingValues({});
    setActiveFilterColumn(null);
    setTempFilterValues({});
    setSelectedRows(new Set());
    setBulkUpdateField("");
    setBulkUpdateValue("");
    setValidationErrors([]);
    setShowValidationError(false);
    setIsProcessing(false);
    onClose();
  };

  // Column definitions
  const columns = [
    { key: "select", label: "", width: 50, type: "checkbox" },
    { key: "status", label: "Product Type", width: 100, type: "text" },
    { key: "upc", label: "UPC", width: 120, type: "text" },
    { key: "description", label: "Description", width: 250, type: "text" },
    { key: "department", label: "Department", width: 120, type: "dropdown" },
    { key: "quantity", label: "Qty", width: 80, type: "number" },
    { key: "unitCase", label: "Unit In Case", width: 120, type: "number" },
    { key: "caseCost", label: "Case Cost", width: 120, type: "currency" },
    { key: "unitCost", label: "Unit Cost", width: 120, type: "currency" },
    { key: "retail", label: "Unit Retail", width: 120, type: "currency" },
    { key: "margin", label: "Margin", width: 100, type: "percentage" },
    { key: "action", label: "Action", width: 80, type: "action" },
  ];

  // Bulk update field options
  const bulkUpdateFields = [
    { key: "department", label: "Department", type: "dropdown" },
    { key: "quantity", label: "Quantity", type: "number" },
    { key: "unitCase", label: "Unit In Case", type: "number" },
    { key: "caseCost", label: "Case Cost", type: "currency" },
    { key: "unitCost", label: "Unit Cost", type: "currency" },
    { key: "retail", label: "Unit Retail", type: "currency" },
  ];

  // Initialize column widths
  useEffect(() => {
    const initialWidths = {};
    columns.forEach((col) => {
      initialWidths[col.key] = col.width || 120;
    });
    setColumnWidths(initialWidths);
  }, []);

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

  // Click outside handler to close filter popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        activeFilterColumn &&
        !event.target.closest(".filter-popup-container")
      ) {
        setActiveFilterColumn(null);
        setTempFilterValues({});
      }
    };

    if (activeFilterColumn) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [activeFilterColumn]);

  // Update select all state based on current selections
  useEffect(() => {
    if (paginatedData.length === 0) {
      setSelectAll(false);
      return;
    }

    const currentPageItemIds = paginatedData.map(
      (item) => item.id || `${item.upc}-${item.description}`,
    );
    const allCurrentPageSelected = currentPageItemIds.every((id) =>
      selectedRows.has(id),
    );
    setSelectAll(allCurrentPageSelected);
  }, [paginatedData, selectedRows, startIndex]);

  // Show/hide bulk operations based on selection
  useEffect(() => {
    setShowBulkOperations(selectedRows.size > 0);
  }, [selectedRows]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-2">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[98vw] h-[96vh] flex flex-col border border-gray-200">
        {/* Header - Compressed */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">EDI File Import</h2>
            <p className="text-xs text-gray-600">
              Import items from EDI vendor files
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white hover:bg-opacity-50 rounded-lg"
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

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Controls Section - Compressed */}
          <div className="p-3 border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Import Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              {/* Vendor Dropdown */}
              <div className="relative">
                <SearchableDropdown
                  label="EDI Vendor *"
                  value={selectedVendor}
                  onChange={setSelectedVendor}
                  options={vendors}
                  placeholder="Select EDI vendor"
                  searchPlaceholder="Search EDI vendors..."
                  loading={vendorLoading}
                  displayKey="name"
                  valueKey="id"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload EDI File *
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept=".txt"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 file:transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Process Button */}
              <div>
                <button
                  onClick={handleProcess}
                  disabled={isProcessing || !selectedVendor || !selectedFile}
                  className="w-full py-3 px-6 text-black rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl font-semibold"
                  style={{
                    backgroundColor: "rgb(255 153 25 / var(--tw-bg-opacity))",
                  }}
                >
                  {isProcessing && (
                    <svg
                      className="w-5 h-5 animate-spin"
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
                  {isProcessing ? "Processing File..." : "Process EDI File"}
                </button>
              </div>
            </div>
          </div>

          {/* Data Grid Section */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Grid Header with Filters - Compressed */}
            <div className="p-2 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900">
                  {importedData
                    ? `Imported Items (${filteredData.length} of ${importedData.length})`
                    : "Import Preview"}
                </h3>
                {importedData && (
                  <button
                    onClick={handleImport}
                    disabled={filteredData.length === 0}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Add to Purchase Order ({filteredData.length} items)
                  </button>
                )}
              </div>

              {/* Bulk Operations Toolbar */}
              {showBulkOperations && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 mb-2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="font-medium text-orange-900">
                        {selectedRows.size} row
                        {selectedRows.size !== 1 ? "s" : ""} selected
                      </span>
                    </div>
                    <button
                      onClick={handleClearSelection}
                      className="text-orange-600 hover:text-orange-800 text-sm"
                    >
                      Clear Selection
                    </button>
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
                        <option key="empty-field" value="">
                          Select field...
                        </option>
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
                            bulkUpdateField === "retail"
                              ? "number"
                              : "text"
                          }
                          value={bulkUpdateValue}
                          onChange={(e) => setBulkUpdateValue(e.target.value)}
                          placeholder="Enter new value..."
                          step={
                            bulkUpdateField?.includes("Cost") ||
                            bulkUpdateField === "retail"
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
                        className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                      >
                        Update Selected
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                      >
                        Delete Selected
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Validation Error Banner - Compressed */}
              {showValidationError && validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-2">
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0"
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
                        Please fix the highlighted rows before adding to
                        Purchase Order.
                      </p>
                      <div className="text-xs text-red-600 space-y-1">
                        {validationErrors.slice(0, 3).map((error, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="font-medium">
                              Row {error.index + 1}:
                            </span>
                            <span>
                              {error.item.description || error.item.upc}
                            </span>
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
                      onClick={() => {
                        setShowValidationError(false);
                        setValidationErrors([]);
                      }}
                      className="text-red-400 hover:text-red-600 p-1"
                      title="Dismiss"
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
            </div>

            {/* Data Grid */}
            <div className="flex-1 overflow-auto">
              <table ref={tableRef} className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
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
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleSort(column.key)}
                                className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-orange-600 transition-colors"
                              >
                                {column.label}
                                {getSortIcon(column.key)}
                              </button>

                              {/* Filter Icon */}
                              {column.key !== "action" &&
                                column.key !== "select" && (
                                  <div className="relative">
                                    <button
                                      onClick={(e) =>
                                        handleFilterIconClick(e, column.key)
                                      }
                                      className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                                        filters[column.key]
                                          ? "text-orange-600"
                                          : "text-gray-400"
                                      } ${activeFilterColumn === column.key ? "bg-gray-200" : ""}`}
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

                                    {/* Filter Popup */}
                                    {activeFilterColumn === column.key && (
                                      <div className="filter-popup-container absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-48 z-50">
                                        <div className="space-y-3">
                                          <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                              Filter {column.label}
                                            </label>
                                            <input
                                              type="text"
                                              value={
                                                tempFilterValues[column.key] ||
                                                ""
                                              }
                                              onChange={(e) =>
                                                handleTempFilterChange(
                                                  column.key,
                                                  e.target.value,
                                                )
                                              }
                                              placeholder={`Enter ${column.label.toLowerCase()}...`}
                                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                              autoFocus
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                  handleFilterApply(column.key);
                                                } else if (e.key === "Escape") {
                                                  handleFilterCancel();
                                                }
                                              }}
                                            />
                                          </div>
                                          <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                                            <button
                                              onClick={() => {
                                                setTempFilterValues({
                                                  ...tempFilterValues,
                                                  [column.key]:
                                                    "EMPTY_VALUE_FILTER",
                                                });
                                              }}
                                              className="text-xs text-blue-600 hover:text-blue-800"
                                            >
                                              Filter Empty Values
                                            </button>
                                            <span className="text-xs text-gray-400">
                                              |
                                            </span>
                                            <button
                                              onClick={() => {
                                                setTempFilterValues({
                                                  ...tempFilterValues,
                                                  [column.key]:
                                                    "NON_EMPTY_VALUE_FILTER",
                                                });
                                              }}
                                              className="text-xs text-blue-600 hover:text-blue-800"
                                            >
                                              Filter Non-Empty Values
                                            </button>
                                          </div>
                                          <div className="flex gap-2 text-xs">
                                            <button
                                              onClick={() =>
                                                handleFilterApply(column.key)
                                              }
                                              className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                                            >
                                              Apply
                                            </button>
                                            <button
                                              onClick={() =>
                                                handleFilterClear(column.key)
                                              }
                                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                            >
                                              Clear
                                            </button>
                                            <button
                                              onClick={handleFilterCancel}
                                              className="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                            </div>

                            {/* Resize handle */}
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
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {importedData ? (
                    filteredData.length > 0 ? (
                      paginatedData.map((item, index) => {
                        // Check if this item has validation errors
                        const hasValidationError =
                          showValidationError &&
                          validationErrors.some((error) => {
                            const originalIndex = filteredData.findIndex(
                              (filteredItem) =>
                                filteredItem.id === item.id ||
                                (filteredItem.upc === item.upc &&
                                  filteredItem.description ===
                                    item.description),
                            );
                            return error.index === originalIndex;
                          });

                        return (
                          <tr
                            key={`${item.id || "item"}-${index}-${startIndex}`}
                            className={`transition-colors ${
                              hasValidationError
                                ? "bg-red-50 border-red-200 hover:bg-red-100"
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
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={columns.length}
                          className="px-3 py-8 text-center text-gray-500"
                        >
                          No items match the current filters
                        </td>
                      </tr>
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="px-3 py-12 text-center text-gray-500"
                      >
                        <div className="flex flex-col items-center">
                          <svg
                            className="w-12 h-12 mb-3 text-gray-300"
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
                          <p className="text-lg font-medium">No Data Yet</p>
                          <p className="text-sm">
                            Select vendor and file, then click Process to import
                            items
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {importedData && filteredData.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  {/* Row count and items per page */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>
                      Showing {startIndex + 1} to{" "}
                      {Math.min(startIndex + itemsPerPage, filteredData.length)}{" "}
                      of {filteredData.length} items
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
                        <option key="5" value={5}>
                          5
                        </option>
                        <option key="10" value={10}>
                          10
                        </option>
                        <option key="25" value={25}>
                          25
                        </option>
                        <option key="50" value={50}>
                          50
                        </option>
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
      </div>
    </div>
  );
};

export default EdiImportModal;
