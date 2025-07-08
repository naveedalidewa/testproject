// Import Service
// This file contains functions to manage Excel file import functionality

import { BASE_URL, isAPI as useAPI } from "./authService";

// API Configuration Flag
const isApi = useAPI; // Use the same config as other services

/**
 * Import Excel file with column mappings
 * @param {string} token - Authentication token
 * @param {string} locationId - Location ID
 * @param {File} file - Excel file to import
 * @param {number} skipRows - Number of rows to skip from the beginning
 * @param {Object} columnMappings - Column mapping object
 * @returns {Promise<Object>} Promise that resolves to API response
 */
export const importExcelFile = async (
  token,
  locationId,
  file,
  skipRows = 0,
  columnMappings = {},
) => {
  try {
    console.log("importExcelFile called with:", {
      locationId,
      skipRows,
      columnMappings,
    });

    if (isApi) {
      // Transform column mappings to expected format
      const transformedColumnMappings = {};
      Object.entries(columnMappings).forEach(([key, value]) => {
        if (value && value.trim() !== "") {
          transformedColumnMappings[key] =
            value === "UPC" ? "Scan Code" : value;
        }
      });

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("locationId", locationId);
      formData.append("line", skipRows);
      formData.append("columnObj", JSON.stringify(transformedColumnMappings));

      const response = await fetch(`${BASE_URL}/importExcelFile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("importExcelFile API response:", result);
      return result;
    } else {
      // Return mock response for development
      console.log("importExcelFile returning mock data for development");

      const dummyResponse = {
        message: "Data processed successfully",
        status: "success",
        count: 2,
        NewProduct: [
          {
            id: `new-product-${Date.now()}-1`,
            barCode: "655708121999",
            name: "New Product Sample",
            priceGroupId: "",
            productPriceId: null,
            priceGroupName: "",
            department: null,
            departmentLocationId: null,
            departmentTaxId: null,
            departmentminAgeId: null,
            departmentName: "GENERAL MERCHANDISE",
            category: "",
            ebt: false,
            quantity: 5,
            unitCase: 1,
            existingCaseCost: "0.00",
            caseCost: "0.00",
            unitCost: "0.00",
            caseDiscount: 0,
            unitRetail: "2.99",
            suggestedRetail: "0.00",
            margin: "0.00",
            tax: "Tax 1",
            minAge: "18+",
            age: "18+",
            size: "",
            vendorItemCode: null,
            productType: 0,
            minAgeId: "34e73e7c-11a9-453c-9661-a9b5cbd9c94b",
            taxId: "87db238d-9080-4770-ac1d-a3cc226d2235",
          },
        ],
        OldProduct: [
          {
            id: "39a2245b-c5b2-45f7-93c9-3612b8644c08",
            barCode: "655708120897",
            name: "COLGATE TOOTH BRUSH & PASTE.85OZ - TRAVEL KIT",
            productPriceId: "cc3f53d7-bce0-404c-839f-a5db8f44fefa",
            priceGroupId: "",
            priceGroupName: "",
            departmentId: "3163e243-0fbc-4fed-a381-e6b05e0d209e",
            departmentLocationId: "740c7e37-a352-4640-9e7a-ba190730ac7c",
            departmentTaxId: "a45f08ad-90b8-49d9-93df-2bfbd061a3d7",
            departmentminAgeId: "0f378f1f-fc53-4e86-b580-41a486809619",
            departmentName: "HEALTH & BEAUTY AIDS",
            categoryId: "",
            categoryName: "",
            ebt: false,
            quantity: 12,
            unitCase: 6,
            existingCaseCost: "7.59",
            caseCost: "0.00",
            unitCost: "NaN",
            caseDiscount: "0.00",
            unitRetail: "2.19",
            suggestedRetail: "0.00",
            margin: "157.76",
            marginAfterRebate: "0.00",
            taxRate: "8.25",
            tax: "Tax Rate 8.25%",
            minAgeId: "0f378f1f-fc53-4e86-b580-41a486809619",
            taxId: "a45f08ad-90b8-49d9-93df-2bfbd061a3d7",
            age: "21+",
            size: "",
            vendorItemCode: null,
            productType: 0,
            changePrice: {
              caseCost: 1,
              unitRetail: 1,
              newcaseCost: "0.00",
              newunitRetail: "0.00",
            },
          },
        ],
      };

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return dummyResponse;
    }
  } catch (error) {
    console.error("Error importing Excel file:", error);
    return {
      status: "error",
      message: "Failed to import Excel file",
      error: error.message,
    };
  }
};

export const importService = {
  importExcelFile,
};
