// Product Service
// This file contains functions to manage Product creation and management

import { BASE_URL, isAPI as useAPI } from "./authService";

// API Configuration Flag
const isApi = useAPI; // Use the same config as other services

/**
 * Add a new product to the system
 * @param {string} token - Authentication token
 * @param {Object} productData - Product data to be added
 * @returns {Promise<Object>} Promise that resolves to API response
 */
export const addProduct = async (token, productData) => {
  try {
    console.log("addProduct called with:", productData);

    if (isApi) {
      const response = await fetch(`${BASE_URL}/addProduct`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      const result = await response.json();
      console.log("addProduct API response:", result);
      return result;
    } else {
      // Return mock success response for development
      console.log("addProduct returning mock success for development");
      return {
        status: "success",
        message: "product added successfully",
        data: {
          productId: `mock-product-${Date.now()}`,
          productPriceId: `mock-price-${Date.now()}`,
          ...productData,
        },
      };
    }
  } catch (error) {
    console.error("Error adding product:", error);
    return {
      status: "error",
      message: "Failed to add product",
      error: error.message,
    };
  }
};

/**
 * Add product modifiers to a product
 * @param {string} token - Authentication token
 * @param {Object} modifierData - Modifier data to be added
 * @returns {Promise<Object>} Promise that resolves to API response
 */
export const addProductmodifier = async (token, modifierData) => {
  try {
    console.log("addProductmodifier called with:", modifierData);

    if (isApi) {
      const response = await fetch(`${BASE_URL}/addProductmodifier`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(modifierData),
      });

      const result = await response.json();
      console.log("addProductmodifier API response:", result);
      return result;
    } else {
      // Return mock success response for development
      console.log("addProductmodifier returning mock success for development");
      return {
        status: "success",
        message: "product modifiers added successfully",
        data: {
          modifiersAdded: modifierData.productChild.length,
          ...modifierData,
        },
      };
    }
  } catch (error) {
    console.error("Error adding product modifiers:", error);
    return {
      status: "error",
      message: "Failed to add product modifiers",
      error: error.message,
    };
  }
};

/**
 * Add multi pack (volume pack) to a product
 * @param {string} token - Authentication token
 * @param {Object} multiPackData - Multi pack data to be added
 * @returns {Promise<Object>} Promise that resolves to API response
 */
export const addMultiPack = async (token, multiPackData) => {
  try {
    console.log("addMultiPack called with:", multiPackData);

    if (isApi) {
      const response = await fetch(`${BASE_URL}/addMultiPack`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(multiPackData),
      });

      const result = await response.json();
      console.log("addMultiPack API response:", result);
      return result;
    } else {
      // Return mock success response for development
      console.log("addMultiPack returning mock success for development");
      return {
        status: "success",
        message: "multi pack added successfully",
        data: {
          multiPackId: `mock-multipack-${Date.now()}`,
          ...multiPackData,
        },
      };
    }
  } catch (error) {
    console.error("Error adding multi pack:", error);
    return {
      status: "error",
      message: "Failed to add multi pack",
      error: error.message,
    };
  }
};

/**
 * Get item functions (volume packs) for a product
 * @param {string} token - Authentication token
 * @param {Object} requestData - Request data containing productPriceId, type, and locationId
 * @returns {Promise<Object>} Promise that resolves to API response
 */
export const getItemFunctions = async (token, requestData) => {
  try {
    console.log("getItemFunctions called with:", requestData);

    if (isApi) {
      const response = await fetch(`${BASE_URL}/ItemFunctions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      console.log("getItemFunctions API response:", result);
      return result;
    } else {
      // Return mock success response for development
      console.log("getItemFunctions returning mock success for development");

      // Return different mock data based on type
      if (requestData.type === 3) {
        // Sales history mock data
        return {
          status: "success",
          message: "sales history get successfully",
          data: [
            {
              locationName: "7-Eleven NY 10018",
              cost: "6.34",
              productPriceId: "f821435b-347e-410e-97a6-91d1779666c0",
              date: "2025-07-02T21:40:57.000Z",
              quantity: 2,
              retail: "6.34",
              discount: "0.00",
            },
            {
              locationName: "7-Eleven NY 10018",
              cost: "6.34",
              productPriceId: "f821435b-347e-410e-97a6-91d1779666c0",
              date: "2025-07-02T20:58:57.000Z",
              quantity: 3,
              retail: "6.34",
              discount: "0.00",
            },
            {
              locationName: "7-Eleven NY 10018",
              cost: "6.34",
              productPriceId: "f821435b-347e-410e-97a6-91d1779666c0",
              date: "2025-07-01T18:30:00.000Z",
              quantity: 1,
              retail: "6.34",
              discount: "0.00",
            },
          ],
        };
      } else if (requestData.type === 4) {
        // Purchase history mock data
        return {
          status: "success",
          message: "purchase history get successfully",
          data: [
            {
              locationName: "7-Eleven NY 10018",
              date: "2025-07-03",
              payeeName: "ALPHA",
              quantity: 1,
              cost: "7.59",
              retail: "13.39",
            },
            {
              locationName: "7-Eleven NY 10018",
              date: "2025-07-03",
              payeeName: "EDI",
              quantity: 1,
              cost: "7.59",
              retail: "13.39",
            },
            {
              locationName: "7-Eleven NY 10018",
              date: "2025-07-02",
              payeeName: "BETA WHOLESALE",
              quantity: 5,
              cost: "7.25",
              retail: "13.39",
            },
          ],
        };
      } else {
        // Volume packs mock data
        return {
          status: "success",
          message: "multi pack get successfully",
          data: [
            {
              id: "1318bc73-bd77-450b-97c6-a20b2d5d59b9",
              productPriceId: requestData.productPriceId,
              franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
              locationId: requestData.locationId,
              locationName: "7-Eleven NY 10018",
              quantity: 20,
              cost: "0.42",
              retail: "10.99",
              margin: "23.57",
              isActive: true,
              isDeleted: false,
              createdAt: "2025-07-04T17:26:19.000Z",
              updatedAt: "2025-07-04T17:26:19.000Z",
            },
            {
              id: "3b4e427a-188f-4120-b2ed-f1483a8c5f9d",
              productPriceId: requestData.productPriceId,
              franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
              locationId: requestData.locationId,
              locationName: "7-Eleven NY 10018",
              quantity: 1,
              cost: "0.42",
              retail: "1.50",
              margin: "72.00",
              isActive: true,
              isDeleted: false,
              createdAt: "2025-07-04T16:59:20.000Z",
              updatedAt: "2025-07-04T16:59:20.000Z",
            },
            {
              id: "67384237-7e3a-41dd-85f0-1f761aeaa101",
              productPriceId: requestData.productPriceId,
              franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
              locationId: requestData.locationId,
              locationName: "7-Eleven NY 10018",
              quantity: 10,
              cost: "0.42",
              retail: "6.99",
              margin: "39.91",
              isActive: true,
              isDeleted: false,
              createdAt: "2025-07-04T17:26:19.000Z",
              updatedAt: "2025-07-04T17:26:19.000Z",
            },
          ],
        };
      }
    }
  } catch (error) {
    console.error("Error getting item functions:", error);
    return {
      status: "error",
      message: "Failed to get item functions",
      error: error.message,
    };
  }
};

/**
 * Update existing multi pack (volume pack)
 * @param {string} token - Authentication token
 * @param {Object} updateData - Update data for the multi pack
 * @returns {Promise<Object>} Promise that resolves to API response
 */
export const updateMultiPack = async (token, updateData) => {
  try {
    console.log("updateMultiPack called with:", updateData);

    if (isApi) {
      const response = await fetch(`${BASE_URL}/updateMultiPack`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      console.log("updateMultiPack API response:", result);
      return result;
    } else {
      // Return mock success response for development
      console.log("updateMultiPack returning mock success for development");
      return {
        status: "success",
        message: "multi pack updated successfully",
        data: {
          multiPackId: updateData.multipackId,
          ...updateData,
        },
      };
    }
  } catch (error) {
    console.error("Error updating multi pack:", error);
    return {
      status: "error",
      message: "Failed to update multi pack",
      error: error.message,
    };
  }
};

/**
 * Update multiple items values
 * @param {string} token - Authentication token
 * @param {Object} updateData - Update data for multiple items
 * @returns {Promise<Object>} Promise that resolves to API response
 */
export const updatedItemsValues = async (token, updateData) => {
  try {
    console.log("updatedItemsValues called with:", updateData);

    if (isApi) {
      const response = await fetch(`${BASE_URL}/updatedItemsValues`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      console.log("updatedItemsValues API response:", result);
      return result;
    } else {
      // Return mock success response for development
      console.log("updatedItemsValues returning mock success for development");
      return {
        status: "success",
        message: "items updated successfully",
        data: {
          itemsUpdated: updateData.updateItems.length,
          ...updateData,
        },
      };
    }
  } catch (error) {
    console.error("Error updating items values:", error);
    return {
      status: "error",
      message: "Failed to update items values",
      error: error.message,
    };
  }
};
