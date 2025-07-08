import { BASE_URL, isAPI as useAPI } from "./authService";


// API Configuration Flag
const isApi = useAPI; // Use the same config as other services

// Dummy department data for testing
const DUMMY_DEPARTMENTS_RESPONSE = {
  status: "success",
  message: "department get successfully",
  data: [
    {
      id: "708c400e-88db-4a92-b07f-06ad67fdd67d",
      departmentLocationId: "7c644406-c54c-4ee7-8956-ccd452410e2f",
      franchiseId: "c30299b0-724d-41ef-85e4-69ca6adebb38",
      name: "HEALTH & BEAUTY AIDS",
      image: null,
      ebt: false,
      isActive: true,
      isDeleted: false,
      createdAt: "2025-06-30T15:50:48.000Z",
      updatedAt: "2025-06-30T15:50:48.000Z",
      tax: null,
      minAge: null,
    },
    {
      id: "ddd35b5c-6525-4a23-b47a-005e621ea3bd",
      departmentLocationId: "4d3b68e5-1361-4011-9391-827593133d51",
      franchiseId: "c30299b0-724d-41ef-85e4-69ca6adebb38",
      name: "Grocery",
      image: "",
      ebt: true,
      isActive: true,
      isDeleted: false,
      createdAt: "2025-06-30T14:58:46.000Z",
      updatedAt: "2025-06-30T14:58:46.000Z",
      tax: {
        id: "efdc8657-1392-4f83-aeb9-6cadc8689c83",
        franchiseId: "c30299b0-724d-41ef-85e4-69ca6adebb38",
        locationId: "142b5b91-3ff7-4777-ac88-3d28a0960783",
        name: "8.25",
        tax: "8.25",
      },
      minAge: {
        id: "53d19275-9c47-40b0-a03d-26551aa73b33",
        franchiseId: "c30299b0-724d-41ef-85e4-69ca6adebb38",
        locationId: "142b5b91-3ff7-4777-ac88-3d28a0960783",
        minAge: "no restriction",
      },
    },
    {
      id: "57d5894b-3f80-4862-874a-9319db6a9d2b",
      departmentLocationId: "12854eb6-40d0-475d-b263-73a760a81d0e",
      franchiseId: "c30299b0-724d-41ef-85e4-69ca6adebb38",
      name: "EBT",
      image: "",
      ebt: true,
      isActive: true,
      isDeleted: false,
      createdAt: "2025-06-30T14:55:08.000Z",
      updatedAt: "2025-06-30T14:59:03.000Z",
      tax: {
        id: "efdc8657-1392-4f83-aeb9-6cadc8689c83",
        franchiseId: "c30299b0-724d-41ef-85e4-69ca6adebb38",
        locationId: "142b5b91-3ff7-4777-ac88-3d28a0960783",
        name: "no tax",
        tax: "0.00",
      },
      minAge: {
        id: "53d19275-9c47-40b0-a03d-26551aa73b33",
        franchiseId: "c30299b0-724d-41ef-85e4-69ca6adebb38",
        locationId: "142b5b91-3ff7-4777-ac88-3d28a0960783",
        minAge: "no restriction",
      },
    },
    {
      id: "09b063bd-faeb-4a26-822f-c59fd006d8ee",
      departmentLocationId: "329bc581-53d1-47e2-b8e7-9ab776d4f1af",
      franchiseId: "c30299b0-724d-41ef-85e4-69ca6adebb38",
      name: "Tobacco",
      image: "",
      ebt: false,
      isActive: true,
      isDeleted: false,
      createdAt: "2025-06-30T14:54:59.000Z",
      updatedAt: "2025-06-30T14:58:55.000Z",
      tax: {
        id: "efdc8657-1392-4f83-aeb9-6cadc8689c83",
        franchiseId: "c30299b0-724d-41ef-85e4-69ca6adebb38",
        locationId: "142b5b91-3ff7-4777-ac88-3d28a0960783",
        name: "8.25",
        tax: "8.25",
      },
      minAge: {
        id: "7d398d2c-4abd-4a15-9c3f-64226c150909",
        franchiseId: "c30299b0-724d-41ef-85e4-69ca6adebb38",
        locationId: "142b5b91-3ff7-4777-ac88-3d28a0960783",
        minAge: "21",
      },
    },
    {
      id: "73b2f998-1a70-420f-846d-87412152e719",
      departmentLocationId: "f9d404dc-19ec-4c96-867c-c0be363c5288",
      franchiseId: "c30299b0-724d-41ef-85e4-69ca6adebb38",
      name: "test",
      image: "",
      ebt: true,
      isActive: true,
      isDeleted: false,
      createdAt: "2025-06-28T05:56:57.000Z",
      updatedAt: "2025-06-28T05:56:57.000Z",
      tax: {
        id: "c00d2399-90dc-469b-9738-b61d7fc8fdb0",
        franchiseId: "c30299b0-724d-41ef-85e4-69ca6adebb38",
        locationId: "142b5b91-3ff7-4777-ac88-3d28a0960783",
        name: "no tax",
        tax: "0.00",
      },
      minAge: {
        id: "53d19275-9c47-40b0-a03d-26551aa73b33",
        franchiseId: "c30299b0-724d-41ef-85e4-69ca6adebb38",
        locationId: "142b5b91-3ff7-4777-ac88-3d28a0960783",
        minAge: "no restriction",
      },
    },
  ],
};

export const departmentService = {
  async getDepartments(token, locationId) {
    if (!isApi) {
      // Return dummy data
      return DUMMY_DEPARTMENTS_RESPONSE;
    }

    // Real API call
    try {
      const response = await fetch(`${BASE_URL}/getDepartment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          locationId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch departments");
      }

      return data;
    } catch (error) {
      throw error;
    }
  },
};
