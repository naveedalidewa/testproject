import { useState, useEffect } from "react";
import { getVendors } from "../services/vendorService";
import {
  updatePurchaseOrderStatus,
  getAllPurchaseOrderProduct,
  updatePurchaseEntry,
  getPurchaseEntryById,
} from "../services/purchaseOrderService";
import { departmentService } from "../services/departmentService";
import { getAllTax } from "../services/taxService";
import { getMinAge } from "../services/ageService";
import {
  calculateMarginPercentage,
  calculateUnitCost,
  calculateTotalCost,
} from "../utils/marginCalculation";
import Dropdown from "./Dropdown";
import SearchableDropdown from "./SearchableDropdown";
import DataGrid from "./DataGrid";
import { useNotification } from "../contexts/NotificationContext";
import { useAuth } from "../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import DepartmentDropdown from "./DepartmentDropdown";

// Map boolean status to string status
const mapStatusToString = (status) => {
  // status: true = Close, false = Open
  if (status === true) return "Close";
  if (status === false) return "Open";
  return "Open"; // default
};

// Payment type mappings
const paymentTypeToNumber = {
  Cash: 1,
  EFT: 2,
  Check: 3,
  "Credit Card": 4,
};

const numberToPaymentType = {
  1: "Cash",
  2: "EFT",
  3: "Check",
  4: "Credit Card",
};

const PurchaseOrderForm = ({ onBack, editData = null, newPOData = null }) => {
  const { showYesNo, showSuccess, showError, showToastSuccess } =
    useNotification();
  const { selectedLocation, token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isEdit = editData !== null;
  const isCreate = newPOData !== null;

  // Redirect to list if trying to access edit/create without proper data
  useEffect(() => {
    if (location?.pathname?.includes("/edit") && !editData) {
      navigate("/dashboard/purchase-order");
    }
    if (location?.pathname?.includes("/create") && !newPOData) {
      navigate("/dashboard/purchase-order");
    }
  }, [location.pathname, editData, newPOData, navigate]);
  const [vendors, setVendors] = useState([]);
  const [vendorLoading, setVendorLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  // New state for API data
  const [purchaseOrderItems, setPurchaseOrderItems] = useState([]);
  const [taxOptions, setTaxOptions] = useState([]);
  const [ageOptions, setAgeOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  // Pagination state for items
  const [itemsPagination, setItemsPagination] = useState({
    currentPage: 1,
    totalPages: null, // Will be set by API response
    totalItems: null, // Will be set by API response
    itemsPerPage: 10,
  });

  // Order summary data from API
  const [orderSummary, setOrderSummary] = useState({
    totalQuantity: 0,
    totalPoCost: "0.00",
    totalRetail: "0.00",
    totalProfitLoss: "0.00",
  });

  // Dummy data for edit mode
  const dummyEditData = {
    vendorId: "8bf2c0d6-8ff1-4590-ab39-c6103cd93138", // ABC Supplies Co. ID
    poNumber: "PO-2024-001",
    date: "2024-01-15",
    paymentType: "Credit Card",
    status: "Open",
    items: [
      {
        id: 1,
        product: "Widget A",
        unit: "EA",
        upc: "123456789012",
        description: "Premium quality widget for retail sale",
        department: "Hardware",
        quantity: 100,
        age: "New",
        tax: "Taxable",
        ebt: false,
        unitCase: 12,
        caseCost: 66.0,
        retail: 8.25,
        margin: 2.75,
        unitCost: 5.5,
        totalCost: 550.0,
      },
      {
        id: 2,
        product: "Gadget B",
        unit: "PCS",
        upc: "234567890123",
        description: "Electronic gadget with warranty",
        department: "Electronics",
        quantity: 50,
        age: "1-2 Years",
        tax: "Taxable",
        ebt: false,
        unitCase: 6,
        caseCost: 72.0,
        retail: 18.0,
        margin: 6.0,
        unitCost: 12.0,
        totalCost: 600.0,
      },
      {
        id: 3,
        product: "Tool C",
        unit: "SET",
        upc: "345678901234",
        description: "Professional grade tool set",
        department: "Tools",
        quantity: 25,
        age: "New",
        tax: "Non-Taxable",
        ebt: false,
        unitCase: 24,
        caseCost: 96.0,
        retail: 6.0,
        margin: 2.0,
        unitCost: 4.0,
        totalCost: 100.0,
      },
      {
        id: 4,
        product: "Office Chair",
        unit: "EA",
        upc: "456789012345",
        description: "Ergonomic office chair with lumbar support",
        department: "Furniture",
        quantity: 15,
        age: "2-5 Years",
        tax: "Exempt",
        ebt: true,
        unitCase: 1,
        caseCost: 120.0,
        retail: 199.99,
        margin: 79.99,
        unitCost: 120.0,
        totalCost: 1800.0,
      },
      {
        id: 5,
        product: "Laptop Stand",
        unit: "PCS",
        upc: "567890123456",
        description: "Adjustable aluminum laptop stand",
        department: "Electronics",
        quantity: 30,
        unitCase: 8,
        caseCost: 160.0,
        retail: 35.99,
        margin: 15.99,
        unitCost: 20.0,
        totalCost: 600.0,
      },
      {
        id: 6,
        product: "Coffee Maker",
        unit: "EA",
        upc: "678901234567",
        description: "12-cup programmable coffee maker",
        department: "Appliances",
        quantity: 20,
        unitCase: 4,
        caseCost: 240.0,
        retail: 89.99,
        margin: 29.99,
        unitCost: 60.0,
        totalCost: 1200.0,
      },
      {
        id: 7,
        product: "Wireless Mouse",
        unit: "PCS",
        upc: "789012345678",
        description: "Bluetooth wireless optical mouse",
        department: "Electronics",
        quantity: 75,
        unitCase: 12,
        caseCost: 180.0,
        retail: 24.99,
        margin: 9.99,
        unitCost: 15.0,
        totalCost: 1125.0,
      },
      {
        id: 8,
        product: "Desk Lamp",
        unit: "EA",
        upc: "890123456789",
        description: "LED desk lamp with USB charging port",
        department: "Furniture",
        quantity: 40,
        unitCase: 6,
        caseCost: 180.0,
        retail: 45.99,
        margin: 15.99,
        unitCost: 30.0,
        totalCost: 1200.0,
      },
      {
        id: 9,
        product: "Phone Case",
        unit: "PCS",
        upc: "901234567890",
        description: "Protective silicone phone case",
        department: "Electronics",
        quantity: 200,
        unitCase: 24,
        caseCost: 120.0,
        retail: 12.99,
        margin: 7.99,
        unitCost: 5.0,
        totalCost: 1000.0,
      },
      {
        id: 10,
        product: "Water Bottle",
        unit: "EA",
        upc: "012345678901",
        description: "Stainless steel insulated water bottle",
        department: "Sports",
        quantity: 60,
        unitCase: 12,
        caseCost: 240.0,
        retail: 29.99,
        margin: 9.99,
        unitCost: 20.0,
        totalCost: 1200.0,
      },
      {
        id: 11,
        product: "Notebook Set",
        unit: "SET",
        upc: "123450987654",
        description: "3-pack lined notebooks with covers",
        department: "Office",
        quantity: 45,
        unitCase: 15,
        caseCost: 90.0,
        retail: 15.99,
        margin: 9.99,
        unitCost: 6.0,
        totalCost: 270.0,
      },
      {
        id: 12,
        product: "Bluetooth Speaker",
        unit: "EA",
        upc: "234561098765",
        description: "Portable waterproof Bluetooth speaker",
        department: "Electronics",
        quantity: 35,
        unitCase: 2,
        caseCost: 140.0,
        retail: 99.99,
        margin: 29.99,
        unitCost: 70.0,
        totalCost: 2450.0,
      },
    ],
  };

  const [formData, setFormData] = useState(() => {
    if (isEdit) {
      return {
        vendorId: editData?.vendorId || dummyEditData.vendorId || "",
        poNumber: editData?.poNumber || dummyEditData.poNumber || "",
        date:
          editData?.date ||
          dummyEditData.date ||
          new Date().toISOString().split("T")[0],
        paymentType:
          editData?.paymentType || dummyEditData.paymentType || "Credit",
        status:
          editData?.status !== undefined
            ? mapStatusToString(editData.status)
            : dummyEditData.status || "Open",
        items: [], // Start with empty items, will be populated by API
      };
    } else if (isCreate && newPOData) {
      return {
        vendorId: newPOData.payeeId || "",
        poNumber: newPOData.invoiceNo || `PO-${Date.now()}`, // Map invoiceNo to PO Number
        date: newPOData.date || new Date().toISOString().split("T")[0],
        paymentType: numberToPaymentType[newPOData.paymentType] || "",
        status: "Open",
        items: [],
        purchaseOrderId: newPOData.id, // Store the created purchase order ID
        invoiceNo: newPOData.invoiceNo || "",
      };
    }
    return {
      vendorId: "",
      poNumber: "",
      date: new Date().toISOString().split("T")[0],
      paymentType: "",
      status: "Open",
      items: [],
    };
  });

  // Fetch vendors when selectedLocation becomes available
  useEffect(() => {
    if (selectedLocation?.id) {
      fetchVendors();
      fetchTaxOptions();
      fetchAgeOptions();
      fetchDepartmentOptions();
    }
  }, [selectedLocation]);

  // Fetch purchase order items when editing and location is available
  useEffect(() => {
    if (isEdit && selectedLocation?.id && editData?.id) {
      fetchPurchaseOrderItems(
        itemsPagination.currentPage,
        itemsPagination.itemsPerPage,
      );
      fetchOrderSummary(); // Fetch order summary data
    }
  }, [isEdit, selectedLocation, editData?.id]);

  // Update form data when vendors are loaded for new PO creation
  useEffect(() => {
    if (isCreate && newPOData && vendors.length > 0) {
      // Find the vendor from the vendors list
      const selectedVendor = vendors.find(
        (vendor) => vendor.id === newPOData.payeeId,
      );

      if (selectedVendor && formData.vendorId === newPOData.payeeId) {
        // Vendor is already set correctly, no need to update
        return;
      }

      // Update form data to ensure vendor is properly selected
      if (selectedVendor) {
        setFormData((prev) => ({
          ...prev,
          vendorId: selectedVendor.id,
        }));
      }
    }
  }, [isCreate, newPOData, vendors]);

  // Fetch purchase order items when creating and we have a purchaseOrderId
  useEffect(() => {
    if (isCreate && formData.purchaseOrderId && selectedLocation?.id) {
      console.log("Fetching items and summary for create mode...");
      fetchPurchaseOrderItems(
        itemsPagination.currentPage,
        itemsPagination.itemsPerPage,
      );
      fetchOrderSummary(); // Fetch order summary data
    }
  }, [
    isCreate,
    formData.purchaseOrderId,
    selectedLocation,
    itemsPagination.currentPage,
    itemsPagination.itemsPerPage,
  ]);

  // Re-map department names, tax, and age when options are loaded
  useEffect(() => {
    if (
      (departmentOptions.length > 0 ||
        taxOptions.length > 0 ||
        ageOptions.length > 0) &&
      purchaseOrderItems.length > 0
    ) {
      console.log("Re-mapping departments, tax, and age...", {
        departmentOptionsCount: departmentOptions.length,
        taxOptionsCount: taxOptions.length,
        ageOptionsCount: ageOptions.length,
        itemsCount: purchaseOrderItems.length,
      });

      const updatedItems = purchaseOrderItems.map((item) => {
        // Store original IDs for lookup
        const departmentId = item.departmentId || item.department;
        const taxId = item.taxId;
        const minAgeId = item.minAgeId;

        // Department mapping
        let departmentName = item.department;
        if (departmentOptions.length > 0) {
          departmentName =
            departmentOptions.find((dept) => dept.id === departmentId)?.name ||
            departmentOptions.find((dept) => dept.value === departmentId)
              ?.label ||
            departmentOptions.find((dept) => dept.name === departmentId)
              ?.name ||
            "";
        }

        // Tax mapping
        let taxValue = item.tax;
        if (taxOptions.length > 0 && taxId) {
          taxValue =
            taxOptions.find((tax) => tax.value === taxId)?.label ||
            taxOptions.find((tax) => tax.id === taxId)?.name ||
            taxOptions.find((tax) => tax.value === taxId)?.value ||
            item.tax ||
            "no tax";
        }

        // Age mapping
        let ageValue = item.age;
        if (ageOptions.length > 0 && minAgeId) {
          ageValue =
            ageOptions.find((age) => age.value === minAgeId)?.label ||
            ageOptions.find((age) => age.id === minAgeId)?.minAge ||
            ageOptions.find((age) => age.value === minAgeId)?.value ||
            item.age ||
            "no restriction";
        }

        return {
          ...item,
          departmentId: departmentId, // Keep original ID
          department: departmentName, // Use mapped name for display
          taxId: taxId, // Keep original tax ID
          tax: taxValue, // Use mapped tax value for display
          minAgeId: minAgeId, // Keep original age ID
          age: ageValue, // Use mapped age value for display
          // Recalculate margin, unitCost, and totalCost using centralized functions
          margin: calculateMarginPercentage(
            item.retail,
            item.caseCost,
            item.unitCase,
          ),
          unitCost: calculateUnitCost(item.caseCost, item.unitCase),
          totalCost: calculateTotalCost(
            item.quantity,
            item.caseCost,
            item.unitCase,
          ),
        };
      });

      setPurchaseOrderItems(updatedItems);
      setFormData((prev) => ({
        ...prev,
        items: updatedItems,
      }));
    }
  }, [
    departmentOptions.length,
    taxOptions.length,
    ageOptions.length,
    purchaseOrderItems.length,
  ]);

  // Handle pagination changes for items
  const handleItemsPageChange = (page) => {
    // Show loader while fetching new page
    setItemsLoading(true);
    fetchPurchaseOrderItems(page, itemsPagination.itemsPerPage);
  };

  const handleItemsPerPageChange = (itemsPerPage) => {
    // Show loader while fetching with new items per page
    setItemsLoading(true);
    fetchPurchaseOrderItems(1, itemsPerPage);
  };

  const fetchVendors = async () => {
    try {
      setVendorLoading(true);
      console.log("Fetching vendors...");
      console.log("selectedLocation:", selectedLocation);

      // Don't fetch if selectedLocation is not available yet
      if (!selectedLocation?.id) {
        console.log(
          "selectedLocation not available yet, skipping vendor fetch",
        );
        setVendorLoading(false);
        return;
      }

      const locationId = selectedLocation.id;
      console.log("Using locationId:", locationId);
      const response = await getVendors(locationId, {}, token);
      console.log("Vendor response:", response);

      if (response.status === "success") {
        console.log("Setting vendors:", response.data);
        setVendors(response.data);
      } else {
        console.error("Failed to load vendors:", response.message);
      }
    } catch (err) {
      console.error("Error fetching vendors:", err);
    } finally {
      setVendorLoading(false);
    }
  };

  // Fetch purchase order items when editing or creating
  const fetchPurchaseOrderItems = async (
    page = 1,
    limit = 10,
    overridePOId = null,
  ) => {
    const currentPOId =
      overridePOId || editData?.id || formData.purchaseOrderId;
    console.log("fetchPurchaseOrderItems called with:", {
      page,
      limit,
      overridePOId,
      editDataId: editData?.id,
      formDataPurchaseOrderId: formData.purchaseOrderId,
      currentPOId,
      selectedLocationId: selectedLocation?.id,
    });
    if (!currentPOId || !selectedLocation?.id) {
      console.log(
        "fetchPurchaseOrderItems: Missing currentPOId or selectedLocation.id, returning early",
      );
      return;
    }

    try {
      setItemsLoading(true);
      const body = {
        locationId: selectedLocation.id,
        page: page,
        limit: limit,
        purchaseOrderId: currentPOId,
      };

      const response = await getAllPurchaseOrderProduct(token, body);

      if (response.status === "success") {
        // Map API response to internal format
        const mappedItems = response.data.map((item, index) => {
          // Find department name from departmentOptions (with safety check)
          const departmentName =
            departmentOptions && departmentOptions.length > 0
              ? departmentOptions.find((dept) => dept.id === item.departmentId)
                  ?.name ||
                departmentOptions.find(
                  (dept) => dept.value === item.departmentId,
                )?.label ||
                ""
              : "";

          // Find tax name from taxOptions using taxId - similar to department mapping
          console.log("=== Tax Mapping Debug ===");
          console.log("Item taxId:", item.taxId);
          console.log("Item taxName:", item.taxName);
          console.log("Available taxOptions:", taxOptions);

          const taxValue =
            taxOptions && taxOptions.length > 0
              ? taxOptions.find((tax) => tax.id === item.taxId)?.name ||
                taxOptions.find((tax) => tax.value === item.taxId)?.label ||
                taxOptions.find((tax) => tax.value === item.taxId)?.value ||
                item.taxName ||
                "no tax"
              : item.taxName || "no tax";

          console.log("Mapped taxValue:", taxValue);

          // Find age value from ageOptions using minAgeId - similar to department mapping
          console.log("=== Age Mapping Debug ===");
          console.log("Item minAgeId:", item.minAgeId);
          console.log("Item minAge:", item.minAge);
          console.log("Available ageOptions:", ageOptions);

          const ageValue =
            ageOptions && ageOptions.length > 0
              ? ageOptions.find((age) => age.id === item.minAgeId)?.minAge ||
                ageOptions.find((age) => age.value === item.minAgeId)?.label ||
                ageOptions.find((age) => age.value === item.minAgeId)?.value ||
                item.minAge ||
                "no restriction"
              : item.minAge || "no restriction";

          console.log("Mapped ageValue:", ageValue);

          return {
            id: item.id, // Keep the original API response ID - this is productId for API
            displayId: (page - 1) * limit + index + 1, // Visual ID for pagination display
            purchaseOrderProductId: item.purchaseOrderProductId, // Store purchaseOrderProductId
            product: item.name,
            unit: item.unitOfMeasure || "EA",
            upc: item.barCode,
            description: item.name,
            departmentId: item.departmentId, // Store original ID for later mapping
            department: departmentName,
            quantity: item.quantity,
            taxId: item.taxId, // Store original tax ID
            tax: taxValue, // Mapped tax name/value for display
            minAgeId: item.minAgeId, // Store original age ID
            age: ageValue, // Mapped age value for display
            ebt: item.allowEbt,
            unitCase: item.unitCase,
            caseCost: parseFloat(item.caseCost),
            retail: parseFloat(item.unitRetail),
            margin: calculateMarginPercentage(
              item.unitRetail,
              item.caseCost,
              item.unitCase,
            ),
            unitCost: calculateUnitCost(item.caseCost, item.unitCase),
            totalCost: calculateTotalCost(
              item.quantity,
              item.caseCost,
              item.unitCase,
            ),
            // Store additional fields from API response for later use
            productPriceId: item.productPriceId,
            priceType: item.priceType,
            vendorItemCode: item.vendorItemCode,
            priceGroupId: item.priceGroupId,
            categoryId: item.categoryId,
            caseDiscount: item.caseDiscount,
            size: item.size,
            departmentLocationId: item.departmentLocationId,
            payeeId: item.payeeId,
            type: item.type,
          };
        });

        setPurchaseOrderItems(mappedItems);

        // Update pagination state
        setItemsPagination({
          currentPage: response.pagination?.currentPage || page,
          totalPages: response.pagination?.totalPages || 1,
          totalItems: response.pagination?.totalItems || mappedItems.length,
          itemsPerPage: limit,
        });

        // Update formData items
        setFormData((prev) => ({
          ...prev,
          items: mappedItems,
        }));
      }
    } catch (err) {
      console.error("Error fetching purchase order items:", err);
    } finally {
      setItemsLoading(false);
    }
  };

  // Fetch tax options
  const fetchTaxOptions = async () => {
    if (!selectedLocation?.id) return;

    try {
      const body = { locationId: selectedLocation.id };
      const response = await getAllTax(token, body);

      if (response.status === "success") {
        const mappedTax = response.data.map((tax) => ({
          id: tax.id,
          name: tax.name,
          value: tax.name,
          label: tax.name,
        }));
        setTaxOptions(mappedTax);
      }
    } catch (err) {
      console.error("Error fetching tax options:", err);
    }
  };

  // Fetch age options
  const fetchAgeOptions = async () => {
    if (!selectedLocation?.id) return;

    try {
      const body = { locationId: selectedLocation.id };
      const response = await getMinAge(token, body);

      if (response.status === "success") {
        const mappedAge = response.data.map((age) => ({
          id: age.id,
          minAge: age.minAge,
          value: age.minAge,
          label: age.minAge,
        }));
        setAgeOptions(mappedAge);
      }
    } catch (err) {
      console.error("Error fetching age options:", err);
    }
  };

  // Fetch department options
  const fetchDepartmentOptions = async () => {
    if (!selectedLocation?.id) return;

    try {
      const response = await departmentService.getDepartments(
        token,
        selectedLocation.id,
      );

      if (response.status === "success") {
        const mappedDepartments = response.data.map((dept) => ({
          id: dept.id,
          value: dept.name,
          label: dept.name,
          name: dept.name,
          // Preserve the full structure for EditItemModal
          departmentLocationId: dept.departmentLocationId,
          tax: dept.tax,
          minAge: dept.minAge,
          ebt: dept.ebt,
        }));
        setDepartmentOptions(mappedDepartments);
      }
    } catch (err) {
      console.error("Error fetching department options:", err);
    }
  };

  // Fetch order summary data
  const fetchOrderSummary = async () => {
    const currentPOId = editData?.id || formData.purchaseOrderId;
    if (!currentPOId || !selectedLocation?.id) return;

    try {
      const body = {
        purchaseOrderId: currentPOId,
        locationId: selectedLocation.id,
      };

      console.log(
        "fetchOrderSummary: calling getPurchaseEntryById with:",
        body,
      );

      const response = await getPurchaseEntryById(token, body);
      console.log("fetchOrderSummary: response received:", response);

      if (response.status === "success") {
        const data = response.data;
        const scannerEntries = data.detailScannerEntries || {};

        console.log("fetchOrderSummary: scannerEntries:", scannerEntries);

        // Calculate Total Profit/Loss: Total Retail - Total PO Cost
        const totalPoCost = parseFloat(scannerEntries.caseCost || "0.00");
        const totalRetail = parseFloat(scannerEntries.unitRetail || "0.00");
        const totalProfitLoss = totalRetail - totalPoCost;

        const summaryData = {
          totalQuantity: scannerEntries.quantity || 0,
          totalPoCost: scannerEntries.caseCost || "0.00",
          totalRetail: scannerEntries.unitRetail || "0.00",
          totalProfitLoss: totalProfitLoss.toFixed(2),
        };

        console.log(
          "fetchOrderSummary: setting order summary to:",
          summaryData,
        );
        setOrderSummary(summaryData);
      } else if (
        response.status === "fail" &&
        response.message === "no data found"
      ) {
        // Handle case when all items are deleted - reset summary to zero
        console.log(
          "fetchOrderSummary: no data found, resetting summary to zero",
        );
        const emptySummaryData = {
          totalQuantity: 0,
          totalPoCost: "0.00",
          totalRetail: "0.00",
          totalProfitLoss: "0.00",
        };
        setOrderSummary(emptySummaryData);
      } else {
        console.error("fetchOrderSummary: API returned error:", response);
      }
    } catch (err) {
      console.error("Error fetching order summary:", err);
    }
  };

  // Build display data with proper priority for status changes
  let displayData = isEdit
    ? { ...dummyEditData, ...editData, ...formData }
    : formData;

  // Handle status field conversion for display
  if (editData?.status !== undefined && !formData.status) {
    displayData = {
      ...displayData,
      status: mapStatusToString(editData.status),
    };
  }

  // Check if PO is closed (read-only mode) - prioritize formData status for real-time updates
  const currentStatus = formData.status || displayData.status || "";
  const statusLower = currentStatus.toLowerCase();
  const isClosedPO = statusLower === "close" || statusLower === "closed";
  const isReadOnly = isClosedPO;

  // Validation function
  const validateForm = () => {
    const errors = {};

    // Required field validation
    if (!displayData.vendorId || displayData.vendorId.trim() === "") {
      errors.vendorId = "Vendor is required";
    }

    if (!displayData.poNumber || displayData.poNumber.trim() === "") {
      errors.poNumber = "PO Number is required";
    }

    if (!displayData.date || displayData.date.trim() === "") {
      errors.date = "Date is required";
    }

    // Payment Type is NOT required

    // Items validation
    if (!displayData.items || displayData.items.length === 0) {
      errors.items = "Purchase Order should contain at least one item";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSave = async () => {
    // Clear previous errors
    setValidationErrors({});

    // Validate form
    if (!validateForm()) {
      showError(
        "Validation Error",
        "Please fix the errors below before saving",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const currentPOId = editData?.id || formData.purchaseOrderId;

      if ((isEdit && editData?.id) || (isCreate && formData.purchaseOrderId)) {
        // Update existing Purchase Order (works for both edit and create modes)
        const apiPayload = {
          date: displayData.date,
          payeeId: displayData.vendorId,
          invoiceNo: displayData.poNumber,
          paymentType: paymentTypeToNumber[displayData.paymentType] || 1,
          purchaseOrderId: currentPOId,
          locationId: selectedLocation.id,
          type: 1,
        };

        console.log("Calling updatePurchaseEntry with:", apiPayload);

        const response = await updatePurchaseEntry(token, apiPayload);

        if (response.status === "success") {
          showSuccess(
            "Success",
            response.message || "Purchase Order updated successfully",
          );

          // Navigate back after successful save
          setTimeout(() => {
            onBack();
          }, 1500);
        } else {
          throw new Error(
            response.message || "Failed to update Purchase Order",
          );
        }
      } else {
        // No purchase order data to update
        showError("Error", "No purchase order data to update");
      }
    } catch (error) {
      showError(
        "Save Error",
        `Failed to ${isEdit ? "update" : "create"} Purchase Order: ${error.message}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear validation errors when fields are updated
  const handleInputChangeWithValidation = (field, value) => {
    handleInputChange(field, value);

    // Clear specific field error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Track status changes and read-only state
  useEffect(() => {
    console.log(
      `🔄 Status changed to: ${currentStatus}, Read-only: ${isReadOnly}`,
    );
    if (isReadOnly) {
      console.log("📝 Form is now READ-ONLY (closed PO)");
    } else {
      console.log("✏️ Form is now EDITABLE (open PO)");
    }
  }, [currentStatus, isReadOnly]);

  // Handle status toggle with confirmation and API call
  const handleStatusToggle = () => {
    const currentStatus = displayData.status;
    const newStatus = currentStatus === "Open" ? "Close" : "Open";
    const newBooleanStatus = newStatus === "Open" ? false : true;

    const actionText = newStatus === "Close" ? "close" : "reopen";
    const warningText =
      newStatus === "Close"
        ? "Closing this purchase order will make it read-only and prevent further edits."
        : "Reopening this purchase order will allow editing again.";

    showYesNo(
      `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Purchase Order`,
      `Are you sure you want to ${actionText} this purchase order?\n\n${warningText}`,
      async () => {
        try {
          setStatusLoading(true);

          // Get the PO ID from editData
          const poId = editData?.id;
          if (!poId) {
            throw new Error("Purchase Order ID not found");
          }

          console.log(
            `Updating PO ${poId} status from ${currentStatus} to ${newStatus}`,
          );

          // Prepare API payload for status update
          const statusPayload = {
            purchaseOrderId: poId,
            locationId: selectedLocation.id,
            status: newStatus === "Close" ? 1 : 0, // 1 for Close, 0 for Open
            type: 1,
          };

          console.log(
            "Calling updatePurchaseEntry with status payload:",
            statusPayload,
          );

          // Call API to update status using updatePurchaseEntry
          const response = await updatePurchaseEntry(token, statusPayload);

          if (response.status === "success") {
            showToastSuccess(
              response.message || `Purchase order ${actionText}d successfully`,
            );

            console.log(
              `Status successfully updated from ${currentStatus} to ${newStatus}`,
            );

            // Navigate back to Purchase Order page after successful status change
            setTimeout(() => {
              onBack();
            }, 1500);
          } else {
            throw new Error(response.message || "Failed to update status");
          }
        } catch (error) {
          console.error("Error updating purchase order status:", error);
          showError(
            "Status Update Failed",
            `Failed to ${actionText} the purchase order: ${error.message}`,
          );
        } finally {
          setStatusLoading(false);
        }
      },
    );
  };

  // Debug logging for real-time status tracking
  console.log("=== Status Calculation ===");
  console.log("- editData.status:", editData?.status);
  console.log("- formData.status:", formData.status);
  console.log("- currentStatus (priority):", currentStatus);
  console.log("- displayData.status:", displayData.status);
  console.log("- isClosedPO:", isClosedPO);
  console.log("- isReadOnly:", isReadOnly);
  console.log("========================");
  // Grid columns configuration (visible in table)
  const gridColumns = [
    { key: "upc", label: "UPC", width: 120, type: "text" },
    { key: "description", label: "Description", width: 200, type: "text" },
    {
      key: "department",
      label: "Department",
      width: 120,
      type: "dropdown",
    },
    { key: "quantity", label: "Qty", width: 70, type: "number" },
    { key: "unitCase", label: "Unit In Case", width: 90, type: "number" },
    { key: "caseCost", label: "Case Cost", width: 100, type: "currency" },
    { key: "unitCost", label: "Unit Cost", width: 100, type: "currency" },
    { key: "retail", label: "Unit Retail", width: 100, type: "currency" },
    { key: "margin", label: "Margin", width: 100, type: "percentage" },
    { key: "action", label: "Action", width: 80, type: "action" },
  ];

  // Additional fields for Edit Modal only (not displayed in grid)
  const editOnlyFields = [
    {
      key: "age",
      label: "Age",
      type: "dropdown",
      options:
        ageOptions.length > 0
          ? ageOptions.map((opt) => opt.value)
          : ["New", "1-2 Years", "2-5 Years", "5+ Years"],
    },
    {
      key: "tax",
      label: "Tax",
      type: "dropdown",
      options:
        taxOptions.length > 0
          ? taxOptions.map((opt) => opt.value)
          : ["Taxable", "Non-Taxable", "Exempt"],
    },
    { key: "ebt", label: "EBT", type: "checkbox" },
  ];

  // Handle grid data changes with calculations
  const handleGridDataChange = (newData) => {
    // Apply calculations to updated data
    const calculatedData = newData.map((item) => {
      const unitCase = parseFloat(item.unitCase) || 1;
      const caseCost = parseFloat(item.caseCost) || 0;
      const retail = parseFloat(item.retail) || 0;
      const quantity = parseFloat(item.quantity) || 1;

      // Use centralized calculation functions
      const unitCost = calculateUnitCost(caseCost, unitCase);
      const margin = calculateMarginPercentage(retail, caseCost, unitCase);
      const totalCost = calculateTotalCost(quantity, caseCost, unitCase);

      return {
        ...item,
        unitCost,
        margin,
        totalCost,
      };
    });

    setFormData((prev) => ({
      ...prev,
      items: calculatedData,
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...displayData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    // Auto-calculate unit cost when case cost or unit/case changes
    if (field === "caseCost" || field === "unitCase") {
      const caseCost =
        field === "caseCost"
          ? parseFloat(value) || 0
          : updatedItems[index].caseCost;
      const unitCase =
        field === "unitCase"
          ? parseFloat(value) || 1
          : updatedItems[index].unitCase;
      updatedItems[index].unitCost = unitCase > 0 ? caseCost / unitCase : 0;
    }

    // Auto-calculate margin when retail or unit cost changes
    if (
      field === "retail" ||
      field === "unitCost" ||
      field === "caseCost" ||
      field === "unitCase"
    ) {
      const retail =
        field === "retail"
          ? parseFloat(value) || 0
          : updatedItems[index].retail;
      const caseCost = updatedItems[index].caseCost || 0;
      const unitCase = updatedItems[index].unitCase || 1;

      // Use centralized margin calculation
      updatedItems[index].margin = calculateMarginPercentage(
        retail,
        caseCost,
        unitCase,
      );
    }

    // Calculate unit cost and total cost when relevant fields change
    if (
      field === "quantity" ||
      field === "unitCost" ||
      field === "caseCost" ||
      field === "unitCase"
    ) {
      const quantity =
        field === "quantity"
          ? parseFloat(value) || 0
          : parseFloat(updatedItems[index].quantity) || 0;

      // Recalculate unit cost from case cost and unit case
      const caseCost =
        field === "caseCost"
          ? parseFloat(value) || 0
          : parseFloat(updatedItems[index].caseCost) || 0;
      const unitCase =
        field === "unitCase"
          ? parseFloat(value) || 0
          : parseFloat(updatedItems[index].unitCase) || 1;

      const unitCost = calculateUnitCost(caseCost, unitCase);
      const totalCost = calculateTotalCost(quantity, caseCost, unitCase);

      updatedItems[index].unitCost = unitCost;
      updatedItems[index].totalCost = totalCost;
    }

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const addItem = (newItemData = null, addToBeginning = false) => {
    const baseItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      product: "",
      unit: "",
      upc: "",
      description: "",
      department: "",
      age: "",
      tax: "",
      ebt: false,
      unitCase: 1,
      caseCost: 0,
      retail: 0,
      margin: 0,
      quantity: 1,
      unitCost: 0,
      totalCost: 0,
    };

    // Merge with provided data and ensure calculations are correct
    const itemToAdd = newItemData ? { ...baseItem, ...newItemData } : baseItem;

    // Ensure calculations are correct for the new item
    const caseCost = parseFloat(itemToAdd.caseCost) || 0;
    const unitCase = parseFloat(itemToAdd.unitCase) || 1;
    const quantity = parseFloat(itemToAdd.quantity) || 1;
    const retail = parseFloat(itemToAdd.retail) || 0;

    const unitCost = calculateUnitCost(caseCost, unitCase);
    const totalCost = calculateTotalCost(quantity, caseCost, unitCase);
    const margin = calculateMarginPercentage(retail, caseCost, unitCase);

    const calculatedItem = {
      ...itemToAdd,
      unitCost,
      totalCost,
      margin,
    };

    setFormData((prev) => ({
      ...prev,
      items: addToBeginning
        ? [calculatedItem, ...prev.items] // Add to beginning
        : [...prev.items, calculatedItem], // Add to end
    }));

    // Clear items validation error when item is added
    if (validationErrors.items) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.items;
        return newErrors;
      });
    }
  };

  const removeItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // Function to recalculate all items
  const recalculateAllItems = () => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        const caseCost = parseFloat(item.caseCost) || 0;
        const unitCase = parseFloat(item.unitCase) || 1;
        const quantity = parseFloat(item.quantity) || 0;
        const retail = parseFloat(item.retail) || 0;

        const unitCost = calculateUnitCost(caseCost, unitCase);
        const totalCost = calculateTotalCost(quantity, caseCost, unitCase);
        const margin = calculateMarginPercentage(retail, caseCost, unitCase);

        console.log(
          `Recalculating item ${item.description}: caseCost=${caseCost}, unitCase=${unitCase}, quantity=${quantity}, unitCost=${unitCost}, totalCost=${totalCost}`,
        );

        return {
          ...item,
          unitCost,
          totalCost,
          margin,
        };
      }),
    }));
  };

  const calculateTotals = () => {
    const items = displayData.items || [];

    const totalOrder = items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const caseCost = parseFloat(item.caseCost) || 0;
      return sum + quantity * caseCost;
    }, 0);

    const totalRetail = items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitCase = parseFloat(item.unitCase) || 1;
      const retail = parseFloat(item.retail) || 0;
      return sum + quantity * unitCase * retail;
    }, 0);

    return { totalOrder, totalRetail };
  };

  const { totalOrder, totalRetail } = calculateTotals();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Calculate order summary from items (client-side fallback)
  const calculateOrderSummaryFromItems = () => {
    const items = displayData?.items || [];

    if (items.length === 0) {
      setOrderSummary({
        totalQuantity: 0,
        totalPoCost: "0.00",
        totalRetail: "0.00",
        totalProfitLoss: "0.00",
      });
      return;
    }

    let totalQuantity = 0;
    let totalPoCost = 0;
    let totalRetail = 0;

    items.forEach((item) => {
      const quantity = parseFloat(item.quantity || 0);
      const caseCost = parseFloat(item.caseCost || 0);
      const retail = parseFloat(item.retail || 0);

      totalQuantity += quantity;
      totalPoCost += caseCost * quantity;
      totalRetail += retail * quantity;
    });

    const totalProfitLoss = totalRetail - totalPoCost;

    const calculatedSummary = {
      totalQuantity: totalQuantity,
      totalPoCost: totalPoCost.toFixed(2),
      totalRetail: totalRetail.toFixed(2),
      totalProfitLoss: totalProfitLoss.toFixed(2),
    };

    console.log("Client-side calculated summary:", calculatedSummary);
    setOrderSummary(calculatedSummary);
  };

  // Refresh order summary when items change (after displayData is initialized)
  useEffect(() => {
    const currentPOId = editData?.id || formData.purchaseOrderId;
    console.log("Order summary useEffect triggered:", {
      currentPOId,
      selectedLocationId: selectedLocation?.id,
      displayDataExists: !!displayData,
      displayDataItemsLength: displayData?.items?.length,
      purchaseOrderItemsLength: purchaseOrderItems.length,
    });

    if (currentPOId && selectedLocation?.id && displayData) {
      if (displayData.items?.length > 0) {
        console.log("Refreshing order summary due to items change...");
        // Try API first, but also calculate client-side as fallback
        fetchOrderSummary();
        // Also calculate client-side to ensure we have data
        setTimeout(() => calculateOrderSummaryFromItems(), 100);
      } else if (purchaseOrderItems.length > 0) {
        console.log("Refreshing order summary from purchaseOrderItems...");
        fetchOrderSummary();
      } else {
        console.log("No items found, setting summary to zero");
        calculateOrderSummaryFromItems(); // This will set everything to zero
      }
    } else {
      console.log("Conditions not met for fetching order summary");
    }
  }, [
    displayData?.items?.length,
    purchaseOrderItems.length,
    editData?.id,
    formData.purchaseOrderId,
    selectedLocation?.id,
  ]);

  return (
    <div className="p-4 bg-gray-50 min-h-full">
      <div className="max-w-full mx-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isEdit ? "Edit Purchase Order" : "Create Purchase Order"}
            </h1>
            <p className="text-gray-600">
              {isEdit
                ? "Update purchase order details"
                : "Create a new purchase order for your inventory"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Status Toggle Button (only show in edit mode) */}
            {isEdit && (
              <button
                onClick={handleStatusToggle}
                disabled={statusLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${
                  statusLoading
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : displayData.status === "Open"
                      ? "bg-green-100 text-green-800 hover:bg-green-200 border border-green-300"
                      : "bg-red-100 text-red-800 hover:bg-red-200 border border-red-300"
                }`}
              >
                {statusLoading ? (
                  <>
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
                    Updating...
                  </>
                ) : displayData.status === "Open" ? (
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Open - Click to Close
                  </>
                ) : (
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
                        d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Closed - Click to Open
                  </>
                )}
              </button>
            )}
            <button
              onClick={onBack}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200"
            >
              ← Back to List
            </button>
          </div>
        </div>

        {/* Read-Only Banner */}
        {isReadOnly && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-yellow-600 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Purchase Order is Closed
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  This purchase order has been closed and cannot be modified.
                  All fields are in view-only mode.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Basic Information
                </h2>
                {isEdit && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        displayData.status === "Open"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {displayData.status}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onBack}
                  className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-md transition-colors duration-200 border border-gray-300"
                >
                  {isReadOnly ? "Back" : "Cancel"}
                </button>
                {!isReadOnly && (
                  <button
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-white text-sm font-semibold rounded-md transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-20"
                    style={{
                      backgroundColor: isSubmitting
                        ? "#ccc"
                        : "rgb(255 153 25 / var(--tw-bg-opacity))",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) {
                        e.target.style.backgroundColor = "rgb(230, 138, 23)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting) {
                        e.target.style.backgroundColor =
                          "rgb(255 153 25 / var(--tw-bg-opacity))";
                      }
                    }}
                  >
                    {isSubmitting && (
                      <svg
                        className="w-3 h-3 animate-spin"
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
                    {isSubmitting
                      ? "Saving..."
                      : isEdit || isCreate
                        ? "Update"
                        : "Save"}
                  </button>
                )}
              </div>
            </div>

            {/* First Row: Vendor, PO Number, Date, Payment Type */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <SearchableDropdown
                  label="Vendor *"
                  value={displayData.vendorId}
                  onChange={
                    isReadOnly
                      ? null
                      : (value) =>
                          handleInputChangeWithValidation("vendorId", value)
                  }
                  options={vendors}
                  placeholder="Select vendor"
                  searchPlaceholder="Search vendors..."
                  loading={vendorLoading}
                  displayKey="name"
                  valueKey="id"
                  disabled={isReadOnly}
                  className={validationErrors.vendorId ? "border-red-300" : ""}
                />
                {validationErrors.vendorId && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.vendorId}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Number *
                </label>
                <input
                  type="text"
                  value={displayData.poNumber}
                  onChange={
                    isReadOnly
                      ? null
                      : (e) =>
                          handleInputChangeWithValidation(
                            "poNumber",
                            e.target.value,
                          )
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none text-sm h-9 ${
                    isReadOnly
                      ? "bg-gray-100 cursor-not-allowed border-gray-300"
                      : validationErrors.poNumber
                        ? "border-red-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        : "border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  }`}
                  placeholder="PO-YYYY-XXX"
                  readOnly={isReadOnly}
                  disabled={isReadOnly}
                />
                {validationErrors.poNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.poNumber}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={displayData.date}
                  onChange={
                    isReadOnly
                      ? null
                      : (e) =>
                          handleInputChangeWithValidation(
                            "date",
                            e.target.value,
                          )
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none text-sm h-9 ${
                    isReadOnly
                      ? "bg-gray-100 cursor-not-allowed border-gray-300"
                      : validationErrors.date
                        ? "border-red-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        : "border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  }`}
                  readOnly={isReadOnly}
                  disabled={isReadOnly}
                />
                {validationErrors.date && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.date}
                  </p>
                )}
              </div>
              <div>
                <Dropdown
                  label="Payment Type"
                  value={displayData.paymentType}
                  onChange={
                    isReadOnly
                      ? null
                      : (value) =>
                          handleInputChangeWithValidation("paymentType", value)
                  }
                  options={[
                    { value: "Cash", label: "Cash" },
                    { value: "EFT", label: "EFT" },
                    { value: "Check", label: "Check" },
                    { value: "Credit Card", label: "Credit Card" },
                  ]}
                  placeholder="Select payment type"
                  disabled={isReadOnly}
                  className={
                    validationErrors.paymentType ? "border-red-300" : ""
                  }
                />
                {validationErrors.paymentType && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.paymentType}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Items DataGrid */}
          {validationErrors.items && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-red-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <p className="text-sm text-red-700 font-medium">
                  {validationErrors.items}
                </p>
              </div>
            </div>
          )}

          {/* Items Table with Loading State */}
          <div className="relative">
            {/* Loading Overlay */}
            {((isEdit && (itemsLoading || departmentOptions.length === 0)) ||
              (isCreate && itemsLoading)) && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-3"></div>
                  <p className="text-gray-600 text-sm">
                    {itemsLoading
                      ? "Loading items..."
                      : "Loading departments..."}
                  </p>
                </div>
              </div>
            )}

            {/* Items Table */}
            {!itemsLoading && (
              <DataGrid
                data={displayData.items}
                columns={gridColumns}
                editOnlyFields={editOnlyFields}
                onDataChange={isReadOnly ? null : handleGridDataChange}
                onAddRow={isReadOnly ? null : addItem}
                onRemoveRow={isReadOnly ? null : removeItem}
                readOnly={isReadOnly}
                onPageChange={
                  // Provide pagination handlers when using external pagination (both create and edit)
                  (isEdit && editData?.id) ||
                  (isCreate && formData.purchaseOrderId)
                    ? handleItemsPageChange
                    : null
                }
                onItemsPerPageChange={
                  // Provide pagination handlers when using external pagination (both create and edit)
                  (isEdit && editData?.id) ||
                  (isCreate && formData.purchaseOrderId)
                    ? handleItemsPerPageChange
                    : null
                }
                externalPagination={
                  // Use external pagination when we have API data (both create and edit modes)
                  (isEdit && editData?.id) ||
                  (isCreate && formData.purchaseOrderId)
                    ? itemsPagination
                    : null
                }
                taxOptions={taxOptions}
                ageOptions={ageOptions}
                departmentOptions={departmentOptions}
                vendors={vendors}
                purchaseOrderId={editData?.id || formData.purchaseOrderId}
                currentVendorId={displayData.vendorId}
                onRefreshData={
                  // Simple condition: provide refresh if we have a Purchase Order to work with
                  editData?.id ||
                  formData.purchaseOrderId ||
                  purchaseOrderItems.length > 0
                    ? async (passedPurchaseOrderId) => {
                        // Simple refresh: just refetch current page with latest data
                        const poId =
                          passedPurchaseOrderId ||
                          editData?.id ||
                          formData.purchaseOrderId;

                        if (poId && !formData.purchaseOrderId) {
                          // Update formData with the Purchase Order ID for future operations
                          setFormData((prev) => ({
                            ...prev,
                            purchaseOrderId: poId,
                          }));
                        }

                        // Always fetch page 1 after imports to get fresh pagination data
                        // Pass the Purchase Order ID directly to ensure it's used
                        await Promise.all([
                          fetchPurchaseOrderItems(
                            1,
                            itemsPagination.itemsPerPage,
                            poId,
                          ),
                          fetchOrderSummary(),
                        ]);
                      }
                    : null
                }
              />
            )}
          </div>

          {/* Order Summary and Actions */}
          <div className="mt-8 flex items-start justify-between gap-6">
            {/* Small Order Summary Box */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 min-w-80">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-md font-semibold text-gray-900">
                  Order Summary
                </h3>
                <button
                  onClick={recalculateAllItems}
                  className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                  title="Recalculate all totals"
                >
                  Recalc
                </button>
              </div>
              <div className="space-y-2">
                {/* Total Quantity */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Quantity:</span>
                  <span className="font-medium text-gray-900">
                    {orderSummary.totalQuantity.toLocaleString()}
                  </span>
                </div>

                {/* Total PO Cost */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total PO Cost:</span>
                  <span className="font-medium text-gray-900">
                    $
                    {parseFloat(orderSummary.totalPoCost).toLocaleString(
                      "en-US",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      },
                    )}
                  </span>
                </div>

                {/* Total Retail */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Retail:</span>
                  <span className="font-medium text-gray-900">
                    $
                    {parseFloat(orderSummary.totalRetail).toLocaleString(
                      "en-US",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      },
                    )}
                  </span>
                </div>

                {/* Total Profit/Loss */}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-gray-700">Total Profit/Loss:</span>
                    <span
                      className={`font-bold ${
                        parseFloat(orderSummary.totalProfitLoss) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {parseFloat(orderSummary.totalProfitLoss) >= 0
                        ? "+"
                        : "-"}
                      $
                      {Math.abs(
                        parseFloat(orderSummary.totalProfitLoss),
                      ).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderForm;
