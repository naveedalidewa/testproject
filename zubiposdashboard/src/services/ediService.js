import { BASE_URL, isAPI as useAPI } from "./authService";
import { calculateMarginPercentage } from "../utils/marginCalculation";

const isAPI = useAPI;

// Dummy data for testing (using the provided response structure)
const dummyEdiResponse = {
  message: "Data processed successfully",
  Status: "Success",
  count: 2,
  NewProduct: [
    {
      detailCode: "B",
      barCode: "842426165327",
      name: "7 4K GREEN SWEET 15-4/1.1",
      priceGroupId: "",
      priceGroupName: "",
      department: "",
      departmentId: null,
      departmentLocationId: null,
      departmentTaxId: null,
      departmentminAgeId: null,
      category: "",
      ebt: false,
      quantity: 15000,
      unitCase: 1,
      existingCaseCost: "0.05",
      caseCost: "0.05",
      unitCost: 0.05,
      caseDiscount: 0,
      unitRetail: "10.01",
      suggestedRetail: "10.01",
      margin: "99.50",
      tax: "",
      minAge: "",
      size: "",
      vendorItemCode: "9 303",
      productType: 0,
    },
    {
      detailCode: "B",
      barCode: "090446010206",
      name: "6 SPORT MENTHOL 100 BX 10",
      priceGroupId: "",
      priceGroupName: "",
      department: "",
      departmentId: null,
      departmentLocationId: null,
      departmentTaxId: null,
      departmentminAgeId: null,
      category: "",
      ebt: false,
      quantity: 10000,
      unitCase: 1,
      existingCaseCost: "0.03",
      caseCost: "0.03",
      unitCost: 0.03,
      caseDiscount: 0,
      unitRetail: "10.06",
      suggestedRetail: "10.06",
      margin: "99.70",
      tax: "",
      minAge: "",
      size: "",
      vendorItemCode: "-2111",
      productType: 0,
    },
  ],
  OldProduct: [
    {
      id: "71c57276-46f1-47a0-a822-f4d40c0600cf",
      barCode: "099900722785",
      name: "100 GRAND CHOCO S S 24/2.",
      priceGroupId: "",
      priceGroupName: "",
      departmentId: "be76a370-81d0-4c53-a55a-0595a72cf053",
      departmentLocationId: "12854eb6-40d0-475d-b263-73a760a81d0e",
      departmentTaxId: "efdc8657-1392-4f83-aeb9-6cadc8689c83",
      departmentminAgeId: "53d19275-9c47-40b0-a03d-26551aa73b33",
      departmentName: "EBT",
      categoryId: "",
      categoryName: "",
      ebt: true,
      quantity: 1,
      unitCase: 24,
      existingCaseCost: "39.89",
      caseCost: "39.89",
      unitCost: "-1.66",
      caseDiscount: "0.00",
      unitRetail: "2.99",
      suggestedRetail: "2.99",
      margin: "155.59",
      marginAfterRebate: "0.00",
      taxRate: "8.25",
      minAge: "53d19275-9c47-40b0-a03d-26551aa73b33",
      size: null,
      vendorItemCode: "28071",
      productType: 0,
      changePrice: {
        caseCost: 0,
        unitRetail: 0,
        newcaseCost: 0,
        newunitRetail: 0,
      },
    },
    {
      id: "aa8eaf84-3927-4e4e-9d12-b37c3b17f3d4",
      barCode: "01200577",
      name: "123 VEG COOK OIL 33.8OZ",
      priceGroupId: "",
      priceGroupName: "",
      departmentId: "ddd35b5c-6525-4a23-b47a-005e621ea3bd",
      departmentLocationId: "4d3b68e5-1361-4011-9391-827593133d51",
      departmentTaxId: "efdc8657-1392-4f83-aeb9-6cadc8689c83",
      departmentminAgeId: "53d19275-9c47-40b0-a03d-26551aa73b33",
      departmentName: "Grocery",
      categoryId: "",
      categoryName: "",
      ebt: true,
      quantity: 2,
      unitCase: 1,
      existingCaseCost: "3.49",
      caseCost: "3.49",
      unitCost: "-3.49",
      caseDiscount: "0.00",
      unitRetail: "5.79",
      suggestedRetail: "5.79",
      margin: "160.28",
      marginAfterRebate: "0.00",
      taxRate: "8.25",
      minAge: "53d19275-9c47-40b0-a03d-26551aa73b33",
      size: null,
      vendorItemCode: "11684",
      productType: 0,
      changePrice: {
        caseCost: 0,
        unitRetail: 0,
        newcaseCost: 0,
        newunitRetail: 0,
      },
    },
    {
      id: "4d0fea54-2cd7-4993-9acf-564fadbcc3b8",
      barCode: "01200591",
      name: "123 VEGETABLE OIL 500ML (",
      priceGroupId: "",
      priceGroupName: "",
      departmentId: "09b063bd-faeb-4a26-822f-c59fd006d8ee",
      departmentLocationId: "329bc581-53d1-47e2-b8e7-9ab776d4f1af",
      departmentTaxId: "efdc8657-1392-4f83-aeb9-6cadc8689c83",
      departmentminAgeId: "7d398d2c-4abd-4a15-9c3f-64226c150909",
      departmentName: "Tobacco",
      categoryId: "",
      categoryName: "",
      ebt: false,
      quantity: 2,
      unitCase: 1,
      existingCaseCost: "1.89",
      caseCost: "1.89",
      unitCost: "-1.89",
      caseDiscount: "0.00",
      unitRetail: "3.29",
      suggestedRetail: "3.29",
      margin: "157.45",
      marginAfterRebate: "0.00",
      taxRate: "8.25",
      minAge: "7d398d2c-4abd-4a15-9c3f-64226c150909",
      size: null,
      vendorItemCode: "11682",
      productType: 0,
      changePrice: {
        caseCost: 0,
        unitRetail: 0,
        newcaseCost: 0,
        newunitRetail: 0,
      },
    },
  ],
};

/**
 * Import EDI file and process items
 * @param {File} file - The file to upload
 * @param {string} locationId - Location ID
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Promise that resolves to processed items
 */
export const importEdiFile = async (file, locationId, token) => {
  if (!isAPI) {
    // Simulate API delay for dummy data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(dummyEdiResponse);
      }, 2000);
    });
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("locationId", locationId);

    const response = await fetch(`${BASE_URL}/importEdiFile`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to import EDI file");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error importing EDI file:", error);
    throw error;
  }
};

/**
 * Convert EDI response items to Purchase Order item format
 * @param {Object} ediResponse - Response from EDI import API
 * @param {Array} departments - Available departments for name mapping
 * @param {Array} taxOptions - Available tax options for name mapping
 * @param {Array} ageOptions - Available age options for name mapping
 * @returns {Array} Array of formatted items for Purchase Order
 */
export const convertEdiItemsToPOFormat = (
  ediResponse,
  departments = [],
  taxOptions = [],
  ageOptions = [],
) => {
  const items = [];

  // Process NewProduct items
  if (ediResponse.NewProduct) {
    ediResponse.NewProduct.forEach((item) => {
      const formattedItem = formatEdiItem(
        item,
        departments,
        taxOptions,
        ageOptions,
        "new",
      );
      formattedItem.isNewProduct = true;
      formattedItem.status = "New Product";
      items.push(formattedItem);
    });
  }

  // Process OldProduct items
  if (ediResponse.OldProduct) {
    ediResponse.OldProduct.forEach((item) => {
      const formattedItem = formatEdiItem(
        item,
        departments,
        taxOptions,
        ageOptions,
        "existing",
      );
      formattedItem.isNewProduct = false;
      formattedItem.status = "Existing";
      items.push(formattedItem);
    });
  }

  return items;
};

/**
 * Format individual EDI item to Purchase Order format
 * @param {Object} item - EDI item
 * @param {Array} departments - Available departments
 * @param {Array} taxOptions - Available tax options
 * @param {Array} ageOptions - Available age options
 * @param {string} type - 'new' or 'existing'
 * @returns {Object} Formatted item for Purchase Order
 */
const formatEdiItem = (item, departments, taxOptions, ageOptions, type) => {
  // Find department name
  let departmentName = item.departmentName || item.department || "";
  if (!departmentName && item.departmentId) {
    const dept = departments.find((d) => d.id === item.departmentId);
    departmentName = dept ? dept.name : "";
  }

  // Find tax name - check multiple possible ID fields
  let taxName = item.tax || "";
  if (!taxName) {
    // Try different tax ID fields
    const taxId = item.taxId || item.departmentTaxId;
    if (taxId && taxOptions.length > 0) {
      const tax = taxOptions.find((t) => t.id === taxId);
      taxName = tax ? tax.name || tax.tax : "";
    }
  }

  // Find age name - check multiple possible ID fields
  let ageName = item.minAge || "";
  if (!ageName) {
    // Try different age ID fields
    const ageId = item.minAgeId || item.departmentminAgeId;
    if (ageId && ageOptions.length > 0) {
      const age = ageOptions.find((a) => a.id === ageId);
      ageName = age ? age.minAge : "";
    }
  }

  // Calculate unit cost and margin
  const caseCost = parseFloat(item.caseCost) || 0;
  const unitCase = parseFloat(item.unitCase) || 1;
  const unitCost = caseCost / unitCase;
  const retail =
    parseFloat(item.suggestedRetail) || parseFloat(item.unitRetail) || 0;
  const calculatedMargin = calculateMarginPercentage(
    retail,
    caseCost,
    unitCase,
  );

  return {
    id: item.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    productId: item.id || "",
    upc: item.barCode || "",
    description: item.name || "",
    department: departmentName,
    quantity: parseFloat(item.quantity) || 1,
    unit: "EA",
    age: ageName,
    tax: taxName,
    ebt: Boolean(item.ebt),
    unitCase: unitCase,
    caseCost: caseCost,
    unitCost: unitCost,
    retail: retail,
    margin: calculatedMargin,
    totalCost:
      (parseFloat(item.quantity) || 1) *
      (parseFloat(item.unitCost) ||
        parseFloat(item.caseCost) / parseFloat(item.unitCase)),
    vendorItemCode: item.vendorItemCode || "",
    size: item.size || "",
    isNewProduct: type === "new",

    // Preserve important ID fields for API calls
    productId: item.id || "",
    productPriceId: item.productPriceId || "",
    departmentId: item.departmentId || "",
    departmentLocationId: item.departmentLocationId || "",
    departmentTaxId: item.departmentTaxId || "",
    departmentminAgeId: item.departmentminAgeId || "",
    departmentName: departmentName,
    minAgeId: item.departmentminAgeId || "",
    taxId: item.departmentTaxId || "",
    payeeId: item.payeeId || "",
    priceGroupId: item.priceGroupId || "",
    priceGroupName: item.priceGroupName || "",
    categoryId: item.categoryId || "",
    categoryName: item.categoryName || "",
    existingCaseCost: item.existingCaseCost || "",
    caseDiscount: item.caseDiscount || "0.00",
    marginAfterRebate: item.marginAfterRebate || "0.00",
    suggestedRetail: parseFloat(item.suggestedRetail) || retail,
  };
};
