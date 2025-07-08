// Age Service
// This file contains functions to manage Age/MinAge data

import { BASE_URL, isAPI as useAPI } from "./authService";

// API Configuration Flag
const isApi = useAPI; // Use the same config as other services

// Dummy age data for testing
const DUMMY_AGE_RESPONSE = {
  status: "success",
  message: "minAge get successfully",
  data: [
    {
      id: "34e73e7c-11a9-453c-9661-a9b5cbd9c94b",
      locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
      franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
      minAge: "no restriction",
      isActive: true,
      isDeleted: false,
      createdAt: "2025-05-30T16:29:16.000Z",
      updatedAt: "2025-05-30T16:29:16.000Z",
    },
    {
      id: "0f378f1f-fc53-4e86-b580-41a486809619",
      locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
      franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
      minAge: "18",
      isActive: true,
      isDeleted: false,
      createdAt: "2025-06-05T22:36:55.000Z",
      updatedAt: "2025-06-05T22:36:55.000Z",
    },
    {
      id: "7d398d2c-4abd-4a15-9c3f-64226c150909",
      locationId: "e4184523-4f25-47cc-a40a-16fe9a472792",
      franchiseId: "172e0c67-38c8-4095-aaf0-4ee18807aaf8",
      minAge: "21",
      isActive: true,
      isDeleted: false,
      createdAt: "2025-06-05T22:37:15.000Z",
      updatedAt: "2025-06-05T22:37:15.000Z",
    },
  ],
};

/**
 * Get all minimum age options for a location
 * @param {string} token - Authentication token
 * @param {Object} body - Request body containing locationId
 * @returns {Promise<Object>} Promise that resolves to minimum age options
 */
export const getMinAge = async (token, body) => {
  try {
    if (!isApi) {
      // Return dummy data for development
      return DUMMY_AGE_RESPONSE;
    }

    const response = await fetch(`${BASE_URL}/getMinAge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch minimum age options from API");
    }

    const res = await response.json();
    return res;
  } catch (error) {
    console.error("Error fetching minimum age options:", error);
    return {
      status: "error",
      message: "Failed to fetch minimum age options",
      error: error.message,
    };
  }
};

/**
 * Get age options formatted for dropdowns
 * @param {string} locationId - Location ID (note: token handled internally or uses dummy data)
 * @returns {Promise<Array>} Promise that resolves to simplified age options array
 */
export const getAgeOptions = async (locationId) => {
  try {
    console.log("getAgeOptions called with:", { locationId, isApi });

    if (!isApi) {
      // Return simplified dummy data for development
      const result = ["no restriction", "18", "21"];
      console.log("getAgeOptions returning dummy data:", result);
      return result;
    }

    // For API calls, we need a token but components don't pass it
    // This would need to be updated when implementing real API calls
    const fallback = ["No Restriction", "18+", "21+"];
    console.log(
      "getAgeOptions returning fallback data for API mode:",
      fallback,
    );
    return fallback;
  } catch (error) {
    console.error("Error fetching age options:", error);
    return [];
  }
};

// Age service object for alternative import style
export const ageService = {
  getMinAge,
  getAgeOptions,
};

// Export dummy data for development/testing purposes
export { DUMMY_AGE_RESPONSE };
