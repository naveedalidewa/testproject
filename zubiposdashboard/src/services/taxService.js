// Tax Service
// This file contains functions to manage Tax data

import { BASE_URL, isAPI as useAPI } from "./authService";

// API Configuration Flag
const isApi = useAPI; // Use the same config as other services

// Dummy tax data for testing
const DUMMY_TAX_RESPONSE = {
  status: "success",
  message: "get tax successfully",
  data: [
    {
      id: "87db238d-9080-4770-ac1d-a3cc226d2235",
      franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
      locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
      name: "no tax",
      tax: "0.00",
      isActive: true,
      isDeleted: false,
      createdAt: "2025-05-30T16:29:16.000Z",
      updatedAt: "2025-05-30T16:29:16.000Z",
    },
    {
      id: "a45f08ad-90b8-49d9-93df-2bfbd061a3d7",
      franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
      locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
      name: "8.25",
      tax: "8.25",
      isActive: true,
      isDeleted: false,
      createdAt: "2025-05-30T17:35:13.000Z",
      updatedAt: "2025-05-30T17:35:13.000Z",
    },
    {
      id: "b2bc9adf-f473-4773-b346-e88831188262",
      franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
      locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
      name: "",
      tax: "0.00",
      isActive: true,
      isDeleted: false,
      createdAt: "2025-06-10T21:42:13.000Z",
      updatedAt: "2025-06-10T21:42:13.000Z",
    },
  ],
};

/**
 * Get all tax options for a location
 * @param {string} token - Authentication token
 * @param {Object} body - Request body containing locationId
 * @returns {Promise<Object>} Promise that resolves to tax options
 */
export const getAllTax = async (token, body) => {
  try {
    if (!isApi) {
      // Return dummy data for development
      return DUMMY_TAX_RESPONSE;
    }

    const response = await fetch(`${BASE_URL}/getAllTax`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch tax options from API");
    }

    const res = await response.json();
    return res;
  } catch (error) {
    console.error("Error fetching tax options:", error);
    return {
      status: "error",
      message: "Failed to fetch tax options",
      error: error.message,
    };
  }
};

/**
 * Get tax options formatted for dropdowns
 * @param {string} locationId - Location ID (note: token handled internally or uses dummy data)
 * @returns {Promise<Array>} Promise that resolves to simplified tax options array
 */
export const getTaxOptions = async (locationId) => {
  try {
    console.log("getTaxOptions called with:", { locationId, isApi });

    if (!isApi) {
      // Return simplified dummy data for development
      const result = ["no tax", "8.25"];
      console.log("getTaxOptions returning dummy data:", result);
      return result;
    }

    // For API calls, we need a token but components don't pass it
    // This is a limitation - components should be updated to pass token
    // For now, return fallback data
    console.warn(
      "getTaxOptions called without token - returning fallback data",
    );
    const fallback = ["Taxable", "Non-Taxable", "Exempt"];
    console.log("getTaxOptions returning fallback data:", fallback);
    return fallback;
  } catch (error) {
    console.error("Error fetching tax options:", error);
    return [];
  }
};

// Tax service object for alternative import style
export const taxService = {
  getAllTax,
  getTaxOptions,
};

// Export dummy data for development/testing purposes
export { DUMMY_TAX_RESPONSE };
