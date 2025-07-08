import { BASE_URL, isAPI as useAPI } from "./authService";

const isAPI = useAPI;

// EDI vendors data with specified vendors
const dummyEdiVendors = {
  status: "success",
  message: "edi vendors successfully",
  data: [
    {
      id: "73aeaec6-ce89-4b29-91c3-ed93be584cf6",
      franchiseId: "c30299b0-724d-41ef-85e4-69ca6adebb38",
      locationId: null,
      barcode: "",
      name: "GHRA",
      contactName: "",
      phoneNo: "1231231231231",
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
      createdAt: "2025-06-30T04:14:30.000Z",
      updatedAt: "2025-06-30T04:14:30.000Z",
    },
    {
      id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      franchiseId: "c30299b0-724d-41ef-85e4-69ca6adebb38",
      locationId: null,
      barcode: "",
      name: "TEXAS JASMIN",
      contactName: "",
      phoneNo: "1231231231231",
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
      createdAt: "2025-06-30T04:14:30.000Z",
      updatedAt: "2025-06-30T04:14:30.000Z",
    },
    {
      id: "b2c3d4e5-f6g7-8901-bcde-f23456789012",
      franchiseId: "c30299b0-724d-41ef-85e4-69ca6adebb38",
      locationId: null,
      barcode: "",
      name: "PEPSI",
      contactName: "",
      phoneNo: "1231231231231",
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
      createdAt: "2025-06-30T04:14:30.000Z",
      updatedAt: "2025-06-30T04:14:30.000Z",
    },
    {
      id: "c3d4e5f6-g7h8-9012-cdef-345678901234",
      franchiseId: "c30299b0-724d-41ef-85e4-69ca6adebb38",
      locationId: null,
      barcode: "",
      name: "COKE",
      contactName: "",
      phoneNo: "1231231231231",
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
      createdAt: "2025-06-30T04:14:30.000Z",
      updatedAt: "2025-06-30T04:14:30.000Z",
    },
    {
      id: "d4e5f6g7-h8i9-0123-defg-456789012345",
      franchiseId: "c30299b0-724d-41ef-85e4-69ca6adebb38",
      locationId: null,
      barcode: "",
      name: "FRITOLAY",
      contactName: "",
      phoneNo: "1231231231231",
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
      createdAt: "2025-06-30T04:14:30.000Z",
      updatedAt: "2025-06-30T04:14:30.000Z",
    },
  ],
};

/**
 * Get EDI vendors for a specific location
 * @param {string} locationId - Location ID
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Promise that resolves to EDI vendors data
 */
export const getEdiVendors = async (locationId, token) => {
 // if (!isAPI) {
    // Return dummy data with simulated delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(dummyEdiVendors);
      }, 500);
    });
  //}

  try {
    const response = await fetch(`${BASE_URL}/getEditVendors`, {
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
      throw new Error("Failed to fetch EDI vendors");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching EDI vendors:", error);
    throw error;
  }
};
