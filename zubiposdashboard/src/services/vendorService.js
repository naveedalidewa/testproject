// Vendor Service
// This file contains functions to manage Vendor data

import { BASE_URL, isAPI as useAPI } from "./authService";

// API Configuration Flag
const isApi = useAPI; // Use the same config as other services

// Dummy vendor data based on the new API response structure
const DUMMY_VENDORS = [
  {
    id: "8bf2c0d6-8ff1-4590-ab39-c6103cd93138",
    franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
    locationId: null,
    barcode: "",
    name: "GHRA",
    contactName: "",
    phoneNo: "9999999999",
    email: "",
    fax: "",
    state: "",
    city: "",
    zipCode: "",
    accountNo: "",
    paymentMethod: "",
    address1: "",
    address2: "",
    isActive: true,
    isDeleted: false,
    createdAt: "2025-06-03T22:27:10.000Z",
    updatedAt: "2025-06-03T22:27:10.000Z",
  },
  {
    id: "aad259a8-0acc-4303-afb1-a8e25049eec0",
    franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
    locationId: null,
    barcode: "",
    name: "TEXAS JESMIN",
    contactName: "",
    phoneNo: "1234567891",
    email: "",
    fax: "",
    state: "",
    city: "",
    zipCode: "",
    accountNo: "",
    paymentMethod: "",
    address1: "",
    address2: "",
    isActive: true,
    isDeleted: false,
    createdAt: "2025-07-01T20:11:14.000Z",
    updatedAt: "2025-07-01T20:11:14.000Z",
  },
  {
    id: "c877d737-773c-4aad-8039-df52408482ae",
    franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
    locationId: null,
    barcode: "",
    name: "General Goods",
    contactName: "",
    phoneNo: "9999999991",
    email: "",
    fax: "",
    state: "",
    city: "",
    zipCode: "",
    accountNo: "",
    paymentMethod: "",
    address1: "",
    address2: "",
    isActive: true,
    isDeleted: false,
    createdAt: "2025-07-01T20:11:37.000Z",
    updatedAt: "2025-07-01T20:11:37.000Z",
  },
];

/**
 * Fetches all vendors using the payee API
 * @param {string} locationId - Location ID for the API call
 * @param {Object} filters - Optional filters
 * @param {string} filters.search - Search term for vendor name
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Promise that resolves to vendors array
 */
export const getVendors = async (locationId, filters = {}, token = null) => {
  try {
    console.log("vendorService.getVendors called with locationId:", locationId);
    console.log("vendorService.getVendors called with token:", token);
    let allVendors;

    if (isApi) {
      // Use real API
      const response = await fetch(`${BASE_URL}/getPayee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          locationId: locationId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch vendors from API");
      }

      const result = await response.json();

      if (result.status === "success") {
        allVendors = result.data;
      } else {
        throw new Error(result.message || "Failed to fetch vendors");
      }
    } else {
      // Use dummy data
      await new Promise((resolve) => setTimeout(resolve, 300));
      allVendors = DUMMY_VENDORS;
    }

    // Apply search filter if provided
    let filteredVendors = [...allVendors];

    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      filteredVendors = filteredVendors.filter(
        (vendor) =>
          vendor.name.toLowerCase().includes(searchTerm) ||
          (vendor.email && vendor.email.toLowerCase().includes(searchTerm)) ||
          vendor.phoneNo.includes(searchTerm),
      );
    }

    // Filter only active vendors
    filteredVendors = filteredVendors.filter(
      (vendor) => vendor.isActive && !vendor.isDeleted,
    );

    // Sort by name
    filteredVendors.sort((a, b) => a.name.localeCompare(b.name));

    return {
      status: "success",
      message: isApi
        ? "Vendors fetched from API successfully"
        : "Vendors retrieved successfully",
      data: filteredVendors,
      total: filteredVendors.length,
    };
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return {
      status: "error",
      message: "Failed to retrieve vendors",
      data: [],
      total: 0,
      error: error.message,
    };
  }
};

/**
 * Gets a single vendor by ID
 * @param {string} id - Vendor ID
 * @param {string} locationId - Location ID for the API call
 * @returns {Promise<Object>} Promise that resolves to vendor object
 */
export const getVendorById = async (id, locationId) => {
  try {
    if (isApi) {
      // For API mode, we'd need to fetch all vendors and find the one we want
      // since the API doesn't seem to have a single vendor endpoint
      const vendorsResponse = await getVendors(locationId);

      if (vendorsResponse.status === "success") {
        const vendor = vendorsResponse.data.find((v) => v.id === id);

        if (!vendor) {
          return {
            status: "error",
            data: null,
            message: "Vendor not found",
          };
        }

        return {
          status: "success",
          data: vendor,
          message: "Vendor retrieved successfully",
        };
      } else {
        throw new Error(vendorsResponse.message || "Failed to fetch vendors");
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const vendor = DUMMY_VENDORS.find((v) => v.id === id);

      if (!vendor) {
        return {
          status: "error",
          data: null,
          message: "Vendor not found",
        };
      }

      return {
        status: "success",
        data: vendor,
        message: "Vendor retrieved successfully",
      };
    }
  } catch (error) {
    console.error("Error fetching vendor:", error);
    return {
      status: "error",
      data: null,
      message: "Failed to retrieve vendor",
      error: error.message,
    };
  }
};

/**
 * Add a new vendor/payee
 * @param {string} token - Authentication token
 * @param {Object} vendorData - Vendor data to be added
 * @returns {Promise<Object>} Promise that resolves to API response
 */
export const addPayee = async (token, vendorData) => {
  try {
    console.log("addPayee called with:", vendorData);

    if (isApi) {
      const response = await fetch(`${BASE_URL}/addPayee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(vendorData),
      });

      const result = await response.json();
      console.log("addPayee API response:", result);
      return result;
    } else {
      // Return mock success response for development
      console.log("addPayee returning mock success for development");
      return {
        status: "success",
        message: "payee added successfully",
        data: {
          id: `mock-vendor-${Date.now()}`,
          ...vendorData,
        },
      };
    }
  } catch (error) {
    console.error("Error adding payee:", error);
    return {
      status: "error",
      message: "Failed to add payee",
      error: error.message,
    };
  }
};

// Export dummy data for development/testing purposes
export { DUMMY_VENDORS };
