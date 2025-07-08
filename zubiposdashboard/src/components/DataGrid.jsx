import { useState, useRef, useEffect } from "react";
import SearchableDropdown from "./SearchableDropdown";
import { dropdownService } from "../services/dropdownService";
import { useNotification } from "../contexts/NotificationContext";
import {
  formatMarginDisplay,
  calculateMarginPercentage,
  calculateUnitCost,
  calculateTotalCost,
} from "../utils/marginCalculation";
import { deletePurchaseOrderProduct } from "../services/purchaseOrderService";
import {
  importEdiFile,
  convertEdiItemsToPOFormat,
} from "../services/ediService";
import { addProduct } from "../services/productService";
import {
  updatePurchaseOrderProduct,
  addPurchaseOrderProductEdi,
} from "../services/purchaseOrderService";
import { useAuth } from "../contexts/AuthContext";
import DepartmentDropdown from "./DepartmentDropdown";
import EditItemModal from "./EditItemModal";
import EdiImportModal from "./EdiImportModal";
import ExcelImportModal from "./ExcelImportModal";
import ExcelPreviewModal from "./ExcelPreviewModal";
import ExcelResultsModal from "./ExcelResultsModal";
import LoadingOverlay from "./LoadingOverlay";

const DataGrid = ({
  data = [],
  columns = [],
  editOnlyFields = [],
  onDataChange,
  onAddRow,
  onRemoveRow,
  readOnly = false,
  onPageChange = null,
  onItemsPerPageChange = null,
  externalPagination = null, // New prop for external pagination data
  taxOptions = [], // Tax options from parent
  ageOptions = [], // Age options from parent
  departmentOptions = [], // Department options from parent
  vendors = [], // Vendors from parent
  purchaseOrderId = null, // Purchase order ID from parent
  currentVendorId = null, // Current Purchase Order's selected vendor ID
  onRefreshData = null, // Callback to refresh data after API operations
}) => {
  const {
    showError,
    showWarning,
    showDeleteConfirm,
    showSuccess,
    showToastSuccess,
    showToastError,
  } = useNotification();
  const { selectedLocation, locations, token } = useAuth();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [editingCell, setEditingCell] = useState(null);
  const [columnWidths, setColumnWidths] = useState({});
  const [resizing, setResizing] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editingRow, setEditingRow] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [ediImporting, setEdiImporting] = useState(false);
  const [excelImporting, setExcelImporting] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [ediModalOpen, setEdiModalOpen] = useState(false);
  const [excelImportModalOpen, setExcelImportModalOpen] = useState(false);
  const [excelPreviewModalOpen, setExcelPreviewModalOpen] = useState(false);
  const [excelResultsModalOpen, setExcelResultsModalOpen] = useState(false);
  const [excelData, setExcelData] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [dropdownOptions, setDropdownOptions] = useState({
    department: [],
    age: [],
    tax: [],
  });
  const [loadingOptions, setLoadingOptions] = useState(false);
  const tableRef = useRef(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // Item addition states
  const [activeAddMethod, setActiveAddMethod] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [fileImportProgress, setFileImportProgress] = useState(0);
  const [scannerActive, setScannerActive] = useState(false);
  const [scannedCode, setScannedCode] = useState("");
  const fileInputRef = useRef(null);

  // Required fields for validation
  const requiredFields = [
    "upc",
    "description",
    "department",
    "quantity",
    "unitCase",
  ];
  const [waitingForUser, setWaitingForUser] = useState(true);
  const [pendingData, setPendingData] = useState(null);

  // Initialize column widths
  useEffect(() => {
    const initialWidths = {};
    columns.forEach((col) => {
      initialWidths[col.key] = col.width || 120;
    });
    setColumnWidths(initialWidths);
  }, [columns]);

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

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];

    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination - use external pagination if provided, otherwise internal
  const isExternalPagination = externalPagination !== null;
  const totalPages = isExternalPagination
    ? externalPagination.totalPages
    : Math.ceil(sortedData.length / itemsPerPage);
  const currentPageNumber = isExternalPagination
    ? externalPagination.currentPage
    : currentPage;
  const totalItems = isExternalPagination
    ? externalPagination.totalItems
    : sortedData.length;
  const currentItemsPerPage = isExternalPagination
    ? externalPagination.itemsPerPage
    : itemsPerPage;

  // For external pagination, use data as-is (already paginated by API)
  // For internal pagination, slice the data
  const startIndex = isExternalPagination
    ? 0
    : (currentPage - 1) * itemsPerPage;
  const paginatedData = isExternalPagination
    ? sortedData
    : sortedData.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  // Load dropdown options on component mount
  useEffect(() => {
    const loadDropdownOptions = async () => {
      if (!selectedLocation?.id) return;

      setLoadingOptions(true);
      try {
        // Load department options (this service should exist)
        const departmentOpts = await dropdownService.getDepartments();

        // Initialize with empty arrays for now - they'll be populated during actual usage
        setDropdownOptions({
          department: departmentOpts,
          age: [],
          tax: [],
        });
      } catch (error) {
        console.error("Error loading dropdown options:", error);
        // Set empty fallbacks
        setDropdownOptions({
          department: [],
          age: [],
          tax: [],
        });
      } finally {
        setLoadingOptions(false);
      }
    };

    loadDropdownOptions();
  }, [selectedLocation?.id]);

  // Item addition methods
  const handleFileImport = async (file) => {
    console.log("Selected location in DataGrid:", selectedLocation);
    console.log("Available locations:", locations);

    // Use selected location or fallback to default location ID
    const locationId =
      selectedLocation?.id || "142b5b91-3ff7-4777-ac88-3d28a0960783";

    if (!locationId) {
      const errorMessage =
        locations && locations.length > 0
          ? "Please select a location from the dropdown in the header before importing files"
          : "No locations available. Please ensure you have access to at least one location";

      showError("Location Required", errorMessage);
      return;
    }

    // First validate existing rows
    const invalidRows = validateAllRows();

    if (invalidRows.length > 0) {
      const errorMessage = invalidRows
        .map(
          (row) =>
            `Row ${row.rowIndex}: Missing ${row.missingFields.join(", ")}`,
        )
        .join("\n");

      showError(
        "Incomplete Required Fields",
        `Please complete the following required fields before importing new items:\n\n${errorMessage}\n\nRequired fields: UPC, Description, Department, Qty, Unit/Case`,
      );
      return;
    }

    setFileImportProgress(0);
    try {
      // Start progress animation
      const progressInterval = setInterval(() => {
        setFileImportProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90; // Stop at 90%, complete when API responds
          }
          return prev + 10;
        });
      }, 200);

      // Import EDI file
      const ediResponse = await importEdiFile(file, locationId);

      // Complete progress
      clearInterval(progressInterval);
      setFileImportProgress(100);

      // Convert EDI items to Purchase Order format
      const formattedItems = convertEdiItemsToPOFormat(
        ediResponse,
        dropdownOptions.department,
        dropdownOptions.tax,
        dropdownOptions.age,
      );

      // Add items to the beginning of the list
      if (formattedItems.length > 0) {
        formattedItems.forEach((item) => {
          if (onAddRow) {
            onAddRow(item, true); // Add to beginning
          }
        });

        showSuccess(
          "Import Successful",
          `Successfully imported ${formattedItems.length} items from ${file.name}`,
        );
      }

      // Reset after success
      setTimeout(() => {
        setFileImportProgress(0);
        setActiveAddMethod(null);
      }, 2000);
    } catch (error) {
      console.error("File import error:", error);
      showError("Import Failed", `Failed to import file: ${error.message}`);
      setFileImportProgress(0);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = [".csv", ".xlsx", ".xls", ".edi", ".txt"];
      const fileExtension = "." + file.name.split(".").pop().toLowerCase();

      if (validTypes.includes(fileExtension)) {
        handleFileImport(file);
      } else {
        showWarning(
          "Invalid File Type",
          "Please select a valid file type: CSV, Excel, EDI, or TXT",
        );
      }
    }
  };

  const searchDatabase = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      // Simulate database search
      setTimeout(() => {
        const mockResults = [
          {
            id: "DB001",
            name: "Samsung Galaxy S24",
            category: "Electronics",
            price: 899.99,
            available: true,
          },
          {
            id: "DB002",
            name: 'Samsung SmartTV 55"',
            category: "Electronics",
            price: 649.99,
            available: true,
          },
          {
            id: "DB003",
            name: "Samsung Wireless Earbuds",
            category: "Electronics",
            price: 149.99,
            available: false,
          },
        ].filter(
          (item) =>
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.id.toLowerCase().includes(query.toLowerCase()),
        );

        setSearchResults(mockResults);
        setSearchLoading(false);
      }, 800);
    } catch (error) {
      console.error("Database search error:", error);
      setSearchLoading(false);
    }
  };

  const addItemFromDatabase = async (item) => {
    try {
      // First validate existing rows
      const invalidRows = validateAllRows();

      if (invalidRows.length > 0) {
        const errorMessage = invalidRows
          .map(
            (row) =>
              `Row ${row.rowIndex}: Missing ${row.missingFields.join(", ")}`,
          )
          .join("\n");

        showError(
          "Incomplete Required Fields",
          `Please complete the following required fields before adding new items:\n\n${errorMessage}\n\nRequired fields: UPC, Description, Department, Qty, Unit/Case`,
        );
        return;
      }

      // Create new item for the grid
      const newItem = {
        id: Date.now(),
        product: item.name,
        upc: item.id,
        description: item.name,
        department: item.category,
        quantity: 1,
        age: "New",
        tax: "Taxable",
        ebt: false,
        unitCase: 1,
        caseCost: item.price * 0.7,
        retail: item.price,
        margin: (item.price * 0.3).toFixed(2),
        unitCost: item.price * 0.7,
        totalCost: item.price * 0.7,
      };

      // Add to grid via onAddRow callback
      if (onAddRow) {
        onAddRow(newItem);
      }

      // Reset states
      setActiveAddMethod(null);
      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      console.error("Error adding item from database:", error);
    }
  };

  const handleScannerInput = (code) => {
    // First validate existing rows
    const invalidRows = validateAllRows();

    if (invalidRows.length > 0) {
      const errorMessage = invalidRows
        .map(
          (row) =>
            `Row ${row.rowIndex}: Missing ${row.missingFields.join(", ")}`,
        )
        .join("\n");

      showError(
        "Incomplete Required Fields",
        `Please complete the following required fields before scanning new items:\n\n${errorMessage}\n\nRequired fields: UPC, Description, Department, Qty, Unit/Case`,
      );
      return;
    }

    setScannedCode(code);
    searchDatabase(code);
  };

  const startScanner = () => {
    setScannerActive(true);
    console.log("Scanner activated");
  };

  const stopScanner = () => {
    setScannerActive(false);
    setScannedCode("");
    setActiveAddMethod(null);
  };

  // Validation functions
  const validateRow = (row) => {
    const missingFields = [];

    if (!row.upc || row.upc.toString().trim() === "") missingFields.push("UPC");
    if (!row.description || row.description.toString().trim() === "")
      missingFields.push("Description");
    if (!row.department || row.department.toString().trim() === "")
      missingFields.push("Department");
    if (
      !row.quantity ||
      row.quantity.toString().trim() === "" ||
      row.quantity <= 0
    )
      missingFields.push("Qty");
    if (
      !row.unitCase ||
      row.unitCase.toString().trim() === "" ||
      row.unitCase <= 0
    )
      missingFields.push("Unit/Case");

    return missingFields;
  };

  const validateAllRows = () => {
    const invalidRows = [];

    data.forEach((row, index) => {
      const missingFields = validateRow(row);
      if (missingFields.length > 0) {
        invalidRows.push({
          rowIndex: index + 1,
          missingFields: missingFields,
        });
      }
    });

    return invalidRows;
  };

  const handleManualEntry = () => {
    // Open EditItemModal for manual entry
    setItemModalOpen(true);
  };

  // Handle save from EditItemModal
  const handleSaveNewItem = (itemData) => {
    // Calculate all fields using centralized functions
    const caseCost = parseFloat(itemData.caseCost) || 0;
    const unitCase = parseFloat(itemData.unitCase) || 1;
    const retail = parseFloat(itemData.retail) || 0;
    const quantity = parseFloat(itemData.quantity) || 1;

    const processedItem = {
      id: editingRow !== null ? editFormData.id : Date.now(), // Keep existing ID for edits
      upc: itemData.upc,
      description: itemData.description,
      department: itemData.department,
      quantity: quantity,
      unit: "EA",
      age: itemData.age,
      tax: itemData.tax,
      ebt: itemData.ebt,
      unitCase: unitCase,
      caseCost: caseCost,
      retail: retail,
      // Use centralized calculation functions
      margin: calculateMarginPercentage(retail, caseCost, unitCase),
      unitCost: calculateUnitCost(caseCost, unitCase),
      totalCost: calculateTotalCost(quantity, caseCost, unitCase),
    };

    if (editingRow !== null) {
      // Edit existing item - find the correct item in the data array
      const newData = [...data];
      // Find the item by ID to handle pagination correctly
      const itemIndex = newData.findIndex(
        (item) => item.id === editFormData.id,
      );
      if (itemIndex !== -1) {
        newData[itemIndex] = processedItem;
        onDataChange(newData);
      }
      setEditingRow(null);
      setEditFormData({});
    } else {
      // Add new item to the beginning of the array
      if (onAddRow) {
        onAddRow(processedItem, true); // Add flag to indicate it should be added to the beginning
      }
    }
    setItemModalOpen(false);
  };

  // Handle EDI import with new addPurchaseOrderProductEdi API
  const handleEdiImport = async (importedItems) => {
    if (importedItems && importedItems.length > 0) {
      // Set loading state
      setEdiImporting(true);

      try {
        // Separate items into newProduct and oldProduct arrays based on Product Type
        const newProduct = [];
        const oldProduct = [];

        importedItems.forEach((item) => {
          // Check Product Type: "New Product" vs "Existing"
          console.log("Processing item:", {
            description: item.description,
            status: item.status,
            productType: item.productType,
            isNewProduct: item.isNewProduct,
          });

          const isNewProduct =
            item.status === "New Product" ||
            item.status === "new" ||
            item.productType === "New Product" ||
            item.isNewProduct === true;

          // Helper function to find taxId by name from taxOptions
          const findTaxIdByName = (taxName) => {
            if (!taxName || !taxOptions || taxOptions.length === 0) return "";
            console.log(
              "Finding taxId for:",
              taxName,
              "in options:",
              taxOptions,
            );
            const tax = taxOptions.find(
              (t) =>
                t.name === taxName ||
                t.label === taxName ||
                t.value === taxName,
            );
            console.log("Found tax:", tax);
            return tax?.id || "";
          };

          // Helper function to find minAgeId by age value from ageOptions
          const findAgeIdByValue = (ageValue) => {
            if (!ageValue || !ageOptions || ageOptions.length === 0) return "";
            console.log(
              "Finding ageId for:",
              ageValue,
              "in options:",
              ageOptions,
            );
            const age = ageOptions.find(
              (a) =>
                a.minAge === ageValue ||
                a.label === ageValue ||
                a.value === ageValue,
            );
            console.log("Found age:", age);
            return age?.id || "";
          };

          // Debug logging for tax and age options
          console.log("EDI Import Debug - Available options:", {
            taxOptionsCount: taxOptions?.length || 0,
            ageOptionsCount: ageOptions?.length || 0,
            currentVendorId,
            itemTax: item.tax,
            itemAge: item.age,
            taxOptions: taxOptions?.map((t) => ({
              id: t.id,
              name: t.name,
              value: t.value,
              label: t.label,
            })),
            ageOptions: ageOptions?.map((a) => ({
              id: a.id,
              minAge: a.minAge,
              value: a.value,
              label: a.label,
            })),
          });

          // Map item to EDI API format with proper field population and string conversions
          const mappedItem = {
            id: item.productId || item.id || "",
            barCode: item.upc || item.barCode || "",
            name: item.description || item.name || "",
            productPriceId: item.productPriceId || "",
            priceGroupId: item.priceGroupId || "",
            priceGroupName: item.priceGroupName || "",

            // Department related fields - ensure they're properly populated
            departmentId: item.departmentId || "",
            departmentLocationId: item.departmentLocationId || "",
            departmentTaxId:
              item.departmentTaxId || findTaxIdByName(item.tax) || null,
            departmentminAgeId:
              item.departmentminAgeId || findAgeIdByValue(item.age) || null,
            departmentName: item.departmentName || item.department || "",

            categoryId: item.categoryId || "",
            categoryName: item.categoryName || "",
            ebt: item.ebt || false,
            quantity: parseFloat(item.quantity) || 1,
            unitCase: parseFloat(item.unitCase) || 1,
            existingCaseCost:
              item.existingCaseCost ||
              (parseFloat(item.caseCost) || 0).toString(),

            // All cost/price fields as strings
            caseCost: (parseFloat(item.caseCost) || 0).toString(),
            unitCost: (parseFloat(item.unitCost) || 0).toString(),
            caseDiscount: item.caseDiscount || "0.00",
            unitRetail: (
              parseFloat(item.retail || item.unitRetail) || 0
            ).toString(),
            suggestedRetail: (
              parseFloat(item.suggestedRetail || item.retail) || 0
            ).toString(),
            margin: (parseFloat(item.margin) || 0).toString(),
            marginAfterRebate: item.marginAfterRebate || "0.00",

            // Age and Tax IDs - map from names to IDs
            minAgeId: item.minAgeId || findAgeIdByValue(item.age),
            taxId: item.taxId || findTaxIdByName(item.tax),

            size: item.size || "0",
            vendorItemCode: item.vendorItemCode || "",
            productType: isNewProduct ? 1 : 0, // 1 for new, 0 for existing
            changePrice: {
              caseCost: 0,
              unitRetail: 0,
              newcaseCost: (parseFloat(item.caseCost) || 0).toString(),
              newunitRetail: (parseFloat(item.retail) || 0).toString(),
            },
            productTypeUi: isNewProduct ? "new" : "old",

            // PayeeId - get from Purchase Order's selected vendor
            payeeId: item.payeeId || currentVendorId || "",
          };

          console.log(
            `Item "${item.description}" - isNewProduct: ${isNewProduct}`,
          );

          if (isNewProduct) {
            console.log(`Adding "${item.description}" to newProduct array`);
            // Create simplified mapping for new products
            const newProductItem = {
              detailCode: "B",
              barCode: item.upc || item.barCode || "",
              name: item.description || item.name || "",
              priceGroupId: "",
              productPriceId: null,
              priceGroupName: "",
              department: "",
              departmentId: item.departmentId || "",
              departmentLocationId: item.departmentLocationId || "",
              departmentTaxId:
                item.departmentTaxId || findTaxIdByName(item.tax) || null,
              departmentminAgeId:
                item.departmentminAgeId || findAgeIdByValue(item.age) || null,
              category: "",
              ebt: item.ebt || false,
              quantity: parseFloat(item.quantity) || 1,
              unitCase: parseFloat(item.unitCase) || 1,
              existingCaseCost: (parseFloat(item.caseCost) || 0).toString(),
              caseCost: (parseFloat(item.caseCost) || 0).toString(),
              unitCost: parseFloat(item.unitCost) || 0,
              caseDiscount: 0,
              unitRetail: (
                parseFloat(item.retail || item.unitRetail) || 0
              ).toString(),
              suggestedRetail: (
                parseFloat(item.suggestedRetail || item.retail) || 0
              ).toString(),
              margin: (parseFloat(item.margin) || 0).toString(),
              tax: "",
              minAge: "",
              size: "",
              vendorItemCode: item.vendorItemCode || "",
              productType: 0,
              colorScan: "#F3AC45",
              productTypeUi: "new",
              departmentName: item.departmentName || item.department || "",
              payeeId: item.payeeId || currentVendorId || "",
            };
            newProduct.push(newProductItem);
          } else {
            console.log(`Adding "${item.description}" to oldProduct array`);
            oldProduct.push(mappedItem);
          }
        });

        // Prepare API payload
        const apiPayload = {
          purchaseOrderId: purchaseOrderId,
          locationId: selectedLocation?.id,
          newProduct,
          oldProduct,
        };

        console.log("Final separation results:");
        console.log(
          "New Products:",
          newProduct.map((p) => ({ name: p.name, status: p.productTypeUi })),
        );
        console.log(
          "Old Products:",
          oldProduct.map((p) => ({ name: p.name, status: p.productTypeUi })),
        );
        console.log(
          `Separated items - New: ${newProduct.length}, Old: ${oldProduct.length}`,
        );
        console.log("Calling addPurchaseOrderProductEdi with:", apiPayload);

        // Call the EDI API
        const response = await addPurchaseOrderProductEdi(token, apiPayload);

        console.log("addPurchaseOrderProductEdi", response.status);
        // Handle response and show appropriate message
        if (response.status === "success") {
          // Refresh the data to show the new items and update order summary
          if (onRefreshData) {
            console.log("onRefreshData", onRefreshData, purchaseOrderId);
            onRefreshData(purchaseOrderId);
          }
        } else {
          showError(
            "EDI Import Failed",
            response.message || "Failed to import EDI items",
          );
        }
      } catch (error) {
        console.error("Error processing EDI import:", error);
        showError(
          "EDI Import Error",
          "An error occurred while processing the EDI import",
        );
      } finally {
        setEdiImporting(false);
      }
    }
  };

  // Handle Excel import workflow
  const handleExcelPreview = (excelData) => {
    setExcelData(excelData);
    setExcelImportModalOpen(false);
    setExcelPreviewModalOpen(true);
  };

  const handleExcelImportComplete = (results) => {
    setImportResults(results);
    setExcelPreviewModalOpen(false);
    setExcelResultsModalOpen(true);
  };

  const handleAddToPurchaseOrder = async (
    selectedItems,
    useApiIntegration = false,
  ) => {
    if (!selectedItems || selectedItems.length === 0) return;

    if (useApiIntegration) {
      // This is handled directly in ExcelResultsModal with API integration
      return;
    }

    // Fallback behavior for non-API scenarios
    selectedItems.forEach((item) => {
      if (onAddRow) {
        onAddRow(item, true); // Add to beginning
      }
    });
    showSuccess(
      "Items Added",
      `Successfully added ${selectedItems.length} items to purchase order`,
    );
    setExcelResultsModalOpen(false);
  };

  // Icon components
  const UploadIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7,10 12,15 17,10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );

  const ScannerIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <path d="M7 8h10" />
      <path d="M7 12h10" />
      <path d="M7 16h10" />
    </svg>
  );

  const SearchIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );

  const CloseIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );

  const DatabaseIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 3 4 3 9 3s9 0 9-3V5" />
      <path d="M3 12c0 3 4 3 9 3s9 0 9-3" />
    </svg>
  );

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Call external callback if provided (for API pagination)
    if (onPageChange) {
      onPageChange(page);
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    // Call external callback if provided (for API pagination)
    if (onItemsPerPageChange) {
      onItemsPerPageChange(newItemsPerPage);
    }
  };

  // Handle edit row
  const handleEditRow = (rowIndex) => {
    if (!readOnly) {
      // Get the actual item from paginatedData instead of using indices
      const itemToEdit = paginatedData[rowIndex];
      if (itemToEdit) {
        setEditingRow(rowIndex); // Store the visual row index
        setEditFormData({ ...itemToEdit });
        setItemModalOpen(true); // Use EditItemModal instead of custom modal
      }
    }
  };

  // Handle delete row
  const handleDeleteRow = (rowIndex) => {
    // Get the actual item from paginatedData
    const itemToDelete = paginatedData[rowIndex];
    if (itemToDelete) {
      showDeleteConfirm(
        "Delete Item",
        "Are you sure you want to delete this item? This action cannot be undone.",
        async () => {
          try {
            // Check if we have purchaseOrderProductId for API call
            if (itemToDelete.purchaseOrderProductId) {
              console.log(
                "Deleting item with purchaseOrderProductId:",
                itemToDelete.purchaseOrderProductId,
              );

              // Call the delete API with new format
              const deleteData = {
                purchaseOrderProductId: itemToDelete.purchaseOrderProductId,
                productPriceId: itemToDelete.productPriceId,
              };

              console.log("Calling delete API with:", deleteData);
              const response = await deletePurchaseOrderProduct(
                token,
                deleteData,
              );

              if (response.status === "success") {
                showToastSuccess(
                  response.message || "Item deleted successfully",
                );

                // Find the original index in the full data array by ID and remove from local state
                const originalIndex = data.findIndex(
                  (item) => item.id === itemToDelete.id,
                );
                if (originalIndex !== -1) {
                  onRemoveRow(originalIndex);

                  // Check if we need to adjust pagination after deletion
                  // If this was the last item on the current page and there are previous pages
                  if (paginatedData.length === 1 && currentPageNumber > 1) {
                    // Go to previous page if current page will be empty
                    if (isExternalPagination && onRefreshData) {
                      // For external pagination, refresh with previous page
                      onRefreshData();
                    } else {
                      // For internal pagination, adjust current page
                      setCurrentPage(currentPageNumber - 1);
                    }
                  } else if (isExternalPagination && onRefreshData) {
                    // Always refresh external pagination to get updated data
                    onRefreshData();
                  }
                }
              } else {
                showToastError(response.message || "Failed to delete item");
              }
            } else {
              // Fallback to local deletion if no purchaseOrderProductId (for new items)
              const originalIndex = data.findIndex(
                (item) => item.id === itemToDelete.id,
              );
              if (originalIndex !== -1) {
                onRemoveRow(originalIndex);
                showToastSuccess("Item removed successfully");
              }
            }
          } catch (error) {
            console.error("Error deleting item:", error);
            showToastError("An error occurred while deleting the item");
          }
        },
      );
    }
  };

  // Handle sort
  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  // Handle cell editing
  const handleCellClick = (rowIndex, columnKey) => {
    // Disable inline editing - users must use edit button
    return;
  };

  // Reset editing state when readOnly changes
  useEffect(() => {
    if (readOnly) {
      setEditingCell(null);
    }
  }, [readOnly]);

  const handleCellChange = (rowIndex, columnKey, value) => {
    const newData = [...data];
    newData[rowIndex] = { ...newData[rowIndex], [columnKey]: value };
    onDataChange(newData);
  };

  const handleCellBlur = () => {
    setEditingCell(null);
  };

  // Handle column resizing
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

  // Get sort icon
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

  // Render cell content
  const renderCell = (row, column, rowIndex) => {
    const isEditing =
      editingCell?.rowIndex === rowIndex &&
      editingCell?.columnKey === column.key;
    const value = row[column.key];

    if (column.key === "action") {
      if (readOnly) {
        return (
          <div className="flex items-center justify-center gap-1">
            <span className="text-xs text-gray-400">View Only</span>
          </div>
        );
      }

      return (
        <div className="flex items-center justify-center gap-1">
          {/* Edit Button */}
          <button
            onClick={() => handleEditRow(rowIndex)}
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
            onClick={() => handleDeleteRow(rowIndex)}
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
        </div>
      );
    }

    if (isEditing) {
      // Special handling for department dropdown
      if (column.key === "department") {
        return (
          <div className="w-full min-w-40">
            <DepartmentDropdown
              value={value || ""}
              onChange={(newValue) => {
                handleCellChange(rowIndex, column.key, newValue);
                handleCellBlur(); // Close editing after selection
              }}
              placeholder="Select Department"
            />
          </div>
        );
      }

      return (
        <input
          type={
            column.type === "currency" || column.type === "percentage"
              ? "number"
              : "text"
          }
          value={value || ""}
          onChange={(e) =>
            handleCellChange(rowIndex, column.key, e.target.value)
          }
          onBlur={handleCellBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") {
              handleCellBlur();
            }
          }}
          className="w-full px-2 py-1 text-sm border-0 bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded"
          autoFocus
          step={
            column.type === "currency"
              ? "0.01"
              : column.type === "percentage"
                ? "0.1"
                : undefined
          }
        />
      );
    }

    return (
      <div
        className={`px-2 py-1 rounded text-sm ${
          readOnly ? "cursor-default" : "cursor-pointer hover:bg-gray-50"
        } ${
          // Add red styling for negative or zero margins
          column.type === "percentage" && parseFloat(value) <= 0
            ? "text-red-600 font-medium"
            : ""
        }`}
        onClick={() => handleCellClick(rowIndex, column.key)}
      >
        {formatValue(value, column)}
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Items</h3>
          <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 text-xs font-bold text-white bg-orange-500 rounded-full">
            {data.length}
          </span>
          {readOnly && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
              🔒 Read Only
            </span>
          )}
        </div>
        {!readOnly && (
          <div className="flex items-center gap-2">
            {waitingForUser && pendingData && (
              <button onClick={handleContinue}>Continue Import</button>
            )}

            {/* Manual Entry */}
            <div className="relative group">
              <button
                onClick={handleManualEntry}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                title="Manual Entry"
              >
                <svg
                  className="w-5 h-5"
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
              </button>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[999]">
                Manual Entry
              </div>
            </div>

            {/* EDI/File Import */}
            <div className="relative group">
              <button
                onClick={() => setEdiModalOpen(true)}
                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                title="EDI/File Import"
              >
                <svg
                  className="w-5 h-5"
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
              </button>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[999]">
                EDI/File Import
              </div>
            </div>

            {/* Import from Excel */}
            <div className="relative group">
              <button
                onClick={() => {
                  setExcelData(null); // Clear previous excel data
                  setExcelImportModalOpen(true);
                }}
                className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors duration-200"
                title="Import from Excel"
              >
                <svg
                  className="w-5 h-5"
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
              </button>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[999]">
                Import from Excel
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Add Method Interface */}
      {!readOnly && activeAddMethod && (
        <div className="border-b border-gray-200 p-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {activeAddMethod === "file" && (
                  <>
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <UploadIcon />
                    </div>
                    <h3 className="font-medium text-gray-900">File Import</h3>
                  </>
                )}
                {activeAddMethod === "scanner" && (
                  <>
                    <div className="p-1.5 bg-green-100 rounded-lg">
                      <ScannerIcon />
                    </div>
                    <h3 className="font-medium text-gray-900">
                      Barcode Scanner
                    </h3>
                  </>
                )}
                {activeAddMethod === "search" && (
                  <>
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                      <DatabaseIcon />
                    </div>
                    <h3 className="font-medium text-gray-900">
                      Product Lookup
                    </h3>
                  </>
                )}
              </div>
              <button
                onClick={() => {
                  setActiveAddMethod(null);
                  setSearchQuery("");
                  setSearchResults([]);
                  setFileImportProgress(0);
                  setScannerActive(false);
                  setScannedCode("");
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <CloseIcon />
              </button>
            </div>

            {/* File Import Interface */}
            {activeAddMethod === "file" && (
              <div>
                {fileImportProgress === 0 ? (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.xlsx,.xls,.edi,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 cursor-pointer transition-colors"
                    >
                      <UploadIcon />
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-900">
                          Click to upload EDI/CSV file
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Import items from EDI, CSV, Excel, or TXT files
                        </p>
                        <p className="text-xs text-orange-600 mt-1 font-medium">
                          Files will be processed and items added to your order
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Processing file...</span>
                        <span>{fileImportProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor:
                              "rgb(255 153 25 / var(--tw-bg-opacity))",
                            width: `${fileImportProgress}%`,
                          }}
                        />
                      </div>
                    </div>
                    {fileImportProgress === 100 && (
                      <div className="text-green-600 text-sm font-medium">
                        ✓ EDI file imported and items added successfully
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Scanner Interface */}
            {activeAddMethod === "scanner" && (
              <div>
                {!scannerActive ? (
                  <div className="text-center">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <ScannerIcon />
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          Ready to scan
                        </p>
                        <button
                          onClick={startScanner}
                          className="px-3 py-1.5 text-sm font-medium text-white rounded-md"
                          style={{
                            backgroundColor:
                              "rgb(255 153 25 / var(--tw-bg-opacity))",
                          }}
                        >
                          Start Scanner
                        </button>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">
                        Or enter barcode manually:
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter UPC/Barcode"
                          value={scannedCode}
                          onChange={(e) => setScannedCode(e.target.value)}
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                        <button
                          onClick={() => handleScannerInput(scannedCode)}
                          className="px-3 py-1.5 text-sm font-medium text-white rounded-md"
                          style={{
                            backgroundColor:
                              "rgb(255 153 25 / var(--tw-bg-opacity))",
                          }}
                        >
                          Search
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
                      <div className="animate-pulse">
                        <ScannerIcon />
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-900">
                          Scanner Active
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Point camera at barcode
                        </p>
                        <button
                          onClick={stopScanner}
                          className="mt-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Stop Scanner
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Product Lookup Interface */}
            {activeAddMethod === "search" && (
              <div>
                <div className="mb-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products by name, UPC, or SKU..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        searchDatabase(e.target.value);
                      }}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <SearchIcon />
                    </div>
                  </div>
                </div>

                {searchLoading && (
                  <div className="text-center py-3">
                    <div className="text-sm text-gray-500">
                      Searching database...
                    </div>
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {searchResults.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.id} • {item.category} • $
                            {item.price.toFixed(2)}
                          </div>
                          <div className="text-xs mt-1">
                            {item.available ? (
                              <span className="text-green-600">
                                ✓ Available
                              </span>
                            ) : (
                              <span className="text-red-600">Out of Stock</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => addItemFromDatabase(item)}
                          disabled={!item.available}
                          className="px-2 py-1 text-xs font-medium text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            backgroundColor: item.available
                              ? "rgb(255 153 25 / var(--tw-bg-opacity))"
                              : "#9CA3AF",
                          }}
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {searchQuery &&
                  !searchLoading &&
                  searchResults.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <DatabaseIcon />
                      <p className="text-sm mt-2">
                        No items found for "{searchQuery}"
                      </p>
                      <p className="text-xs mt-1">
                        Try a different search term
                      </p>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        {data.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
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
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No items added yet
            </h3>
            <p className="text-gray-500 text-center">
              Click "Add Item" above to get started.
            </p>
          </div>
        ) : (
          <table ref={tableRef} className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="relative px-3 py-3 text-left group"
                    style={{ width: columnWidths[column.key] }}
                  >
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleSort(column.key)}
                        className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-orange-600 transition-colors"
                      >
                        {column.label}
                        {getSortIcon(column.key)}
                      </button>

                      {/* Resize handle */}
                      <div
                        className={`absolute right-0 top-0 bottom-0 w-3 cursor-col-resize transition-all ${
                          resizing === column.key
                            ? "bg-orange-500 opacity-100"
                            : "bg-gray-300 opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-orange-400"
                        }`}
                        onMouseDown={(e) => handleMouseDown(e, column.key)}
                        title="Drag to resize column"
                      />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.map((row, index) => (
                <tr
                  key={`${row.id || "item"}-${index}-${startIndex}`}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-3 py-2 border-r border-gray-100 last:border-r-0"
                      style={{ width: columnWidths[column.key] }}
                    >
                      {renderCell(row, column, index)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          {/* Row count and items per page */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              Showing{" "}
              {isExternalPagination
                ? externalPagination.startIndex ||
                  (currentPageNumber - 1) * currentItemsPerPage + 1
                : startIndex + 1}{" "}
              to{" "}
              {isExternalPagination
                ? externalPagination.endIndex ||
                  Math.min(currentPageNumber * currentItemsPerPage, totalItems)
                : Math.min(startIndex + itemsPerPage, data.length)}{" "}
              of {isExternalPagination ? totalItems : data.length} items
            </span>
            <div className="flex items-center gap-2">
              <span>Show:</span>
              <select
                value={
                  isExternalPagination ? currentItemsPerPage : itemsPerPage
                }
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
                onClick={() => handlePageChange(currentPageNumber - 1)}
                disabled={currentPageNumber === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {/* Page numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPageNumber <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPageNumber >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPageNumber - 2 + i;
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-3 py-1 text-sm border rounded ${
                        currentPageNumber === pageNumber
                          ? "bg-orange-500 text-white border-orange-500"
                          : "border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              {/* Next button */}
              <button
                onClick={() => handlePageChange(currentPageNumber + 1)}
                disabled={currentPageNumber === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Item Modal */}
      <EditItemModal
        isOpen={itemModalOpen}
        onClose={() => {
          setItemModalOpen(false);
          setEditingRow(null);
          setEditFormData({});
        }}
        onSave={handleSaveNewItem}
        editData={editingRow !== null ? editFormData : null}
        preloadedTaxOptions={taxOptions}
        preloadedAgeOptions={ageOptions}
        preloadedDepartmentOptions={departmentOptions}
        vendors={vendors}
        purchaseOrderId={purchaseOrderId}
        onRefreshData={onRefreshData}
      />

      {/* EDI Import Modal */}
      <EdiImportModal
        isOpen={ediModalOpen}
        onClose={() => setEdiModalOpen(false)}
        onImport={handleEdiImport}
      />

      {/* Excel Import Modals */}
      <ExcelImportModal
        isOpen={excelImportModalOpen}
        onClose={() => setExcelImportModalOpen(false)}
        onPreview={handleExcelPreview}
      />

      <ExcelPreviewModal
        isOpen={excelPreviewModalOpen}
        onClose={() => {
          setExcelPreviewModalOpen(false);
          setExcelData(null);
        }}
        excelData={excelData}
        onImportComplete={handleExcelImportComplete}
      />

      <ExcelResultsModal
        isOpen={excelResultsModalOpen}
        onClose={() => {
          setExcelResultsModalOpen(false);
          setImportResults(null);
        }}
        importResults={importResults}
        onAddToPurchaseOrder={handleAddToPurchaseOrder}
        purchaseOrderId={purchaseOrderId}
        onRefreshData={onRefreshData}
        setExcelImporting={setExcelImporting}
      />

      {/* Professional Loading Overlay for EDI Import */}
      <LoadingOverlay
        isVisible={ediImporting}
        message="Processing EDI Import"
        subMessage="Importing items to Purchase Order. This may take a few moments."
      />

      {/* Professional Loading Overlay for Excel Import */}
      <LoadingOverlay
        isVisible={excelImporting}
        message="Processing Excel Import"
        subMessage="Adding items to Purchase Order. This may take a few moments."
      />
    </div>
  );
};

export default DataGrid;
