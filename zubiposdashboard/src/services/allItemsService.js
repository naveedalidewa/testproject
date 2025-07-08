import { BASE_URL, isAPI as useAPI } from "./authService";

// Dummy data matching the API response structure
const dummyApiResponse = {
  status: "success",
  message: "all items found",
  data: [
    {
      productId: "000190f8-a2fe-4c56-9eab-4c1f95e1c82c",
      productPriceId: "af773e3a-e2c4-4e0e-8e5d-5b3a0f7dbd67",
      scanCode: "052427010384",
      description: "GORILLA TAPE BLACK 10yd",
      unitCase: 1,
      caseCost: "5.80",
      caseDiscount: "0.00",
      unitcostAfterDiscount: "5.80",
      unitRetail: "6.80",
      margin: "14.71",
    },
    {
      productId: "00146713-4c19-40f5-87f7-a423eeefb917",
      productPriceId: "279b0f98-4134-417a-a6dc-7b57620b848b",
      scanCode: "070842002067",
      description: "BEER NUTS ORIGINAL PEANUT TUBE 12/1.5OZ",
      unitCase: 12,
      caseCost: "6.17",
      caseDiscount: "0.00",
      unitcostAfterDiscount: "0.51",
      unitRetail: "0.51",
      margin: "-0.82",
    },
    {
      productId: "00273acb-a848-41f6-9bd6-e543ef5a5cf6",
      productPriceId: "39567ad8-abdc-4ace-b049-0ff654fa4e0c",
      scanCode: "071153783805",
      description: "STP DIESEL FUEL TREATMENT & INJECTOR CLEANER 20 OZ",
      unitCase: 1,
      caseCost: "4.16",
      caseDiscount: "0.00",
      unitcostAfterDiscount: "4.16",
      unitRetail: "8.89",
      margin: "53.21",
    },
    {
      productId: "002dcd7b-a78e-4634-9d9a-57d5ca20a893",
      productPriceId: "4819090b-507b-4314-9423-ae7d38f8a69e",
      scanCode: "039401704002",
      description: "ARTISAN KITCHEN EGG BITES THREE CHEESE, 2CT",
      unitCase: 1,
      caseCost: "2.02",
      caseDiscount: "0.00",
      unitcostAfterDiscount: "2.02",
      unitRetail: "7.01",
      margin: "71.18",
    },
    {
      productId: "003a7de8-c7e4-4f83-a14b-e7b0a7dbeb05",
      productPriceId: "4cea1499-a4e8-4efd-aeb1-d35d4cfe6c8a",
      scanCode: "022200940214",
      description: "SPEED STICK DEODORANT ACTIVE FRESH STICK 1.8OZ",
      unitCase: 1,
      caseCost: "1.21",
      caseDiscount: "0.00",
      unitcostAfterDiscount: "1.21",
      unitRetail: "2.89",
      margin: "58.13",
    },
    {
      productId: "003b10cc-3850-48e4-ac65-3babdd44a299",
      productPriceId: "c68b8711-de26-4c3e-b843-2dea42a09feb",
      scanCode: "6001087364621",
      description: "AXE BODY SPRAY APOLLO 150ML",
      unitCase: 1,
      caseCost: "1.67",
      caseDiscount: "0.00",
      unitcostAfterDiscount: "1.67",
      unitRetail: "1.67",
      margin: "0.00",
    },
    {
      productId: "004102e8-ca66-435c-988f-e58bc2b6cf66",
      productPriceId: "5212df92-dc24-46e3-ba5c-18a4e4c3565c",
      scanCode: "366715973214",
      description: "LDSP CLARITIN ALLERGY 6CT",
      unitCase: 6,
      caseCost: "12.58",
      caseDiscount: "5.00",
      unitcostAfterDiscount: "1.26",
      unitRetail: "3.10",
      margin: "59.25",
    },
    {
      productId: "0051e0ea-137b-4e10-a5d7-6142ef740af3",
      productPriceId: "eb0ff412-219b-4c3d-8e16-792112e4f752",
      scanCode: "041420029165",
      description: "NOW AND LATER ORIGINAL MIX 24 - 16PCS",
      unitCase: 24,
      caseCost: "20.13",
      caseDiscount: "0.00",
      unitcostAfterDiscount: "0.84",
      unitRetail: "0.84",
      margin: "0.15",
    },
    {
      productId: "00525098-9136-4c9e-91c4-354e5b873417",
      productPriceId: "2163b850-6894-4951-9877-6b7bc1e4aba2",
      scanCode: "022000017901",
      description: "WRIGLEYS 5 GUM RAIN 6/35 STICKS (SUGARFREE)",
      unitCase: 6,
      caseCost: "20.74",
      caseDiscount: "0.00",
      unitcostAfterDiscount: "3.46",
      unitRetail: "5.99",
      margin: "42.29",
    },
    {
      productId: "0053a613-e542-4903-9849-81d674b1f953",
      productPriceId: "df841c99-f748-467f-9eba-cd990dd5a2ff",
      scanCode: "071924970236",
      description: "MOBIL 5000 SUPER 5W-20 6ct-1qt BOX",
      unitCase: 6,
      caseCost: "14.00",
      caseDiscount: "0.00",
      unitcostAfterDiscount: "2.33",
      unitRetail: "1.60",
      margin: "-45.83",
    },
    // Additional dummy data for better pagination testing
    {
      productId: "test-001",
      productPriceId: "test-price-001",
      scanCode: "123456789001",
      description: "TEST PRODUCT 1 - ELECTRONICS",
      unitCase: 1,
      caseCost: "10.00",
      caseDiscount: "0.00",
      unitcostAfterDiscount: "10.00",
      unitRetail: "15.00",
      margin: "33.33",
    },
    {
      productId: "test-002",
      productPriceId: "test-price-002",
      scanCode: "123456789002",
      description: "TEST PRODUCT 2 - HOUSEHOLD ITEMS",
      unitCase: 2,
      caseCost: "8.00",
      caseDiscount: "1.00",
      unitcostAfterDiscount: "3.50",
      unitRetail: "6.00",
      margin: "41.67",
    },
    {
      productId: "test-003",
      productPriceId: "test-price-003",
      scanCode: "123456789003",
      description: "TEST PRODUCT 3 - BEVERAGES",
      unitCase: 12,
      caseCost: "24.00",
      caseDiscount: "2.00",
      unitcostAfterDiscount: "1.83",
      unitRetail: "2.50",
      margin: "26.80",
    },
    {
      productId: "test-004",
      productPriceId: "test-price-004",
      scanCode: "123456789004",
      description: "TEST PRODUCT 4 - SNACKS AND CONFECTIONERY",
      unitCase: 6,
      caseCost: "12.00",
      caseDiscount: "0.00",
      unitcostAfterDiscount: "2.00",
      unitRetail: "3.50",
      margin: "42.86",
    },
    {
      productId: "test-005",
      productPriceId: "test-price-005",
      scanCode: "123456789005",
      description: "TEST PRODUCT 5 - AUTOMOTIVE SUPPLIES",
      unitCase: 1,
      caseCost: "25.00",
      caseDiscount: "5.00",
      unitcostAfterDiscount: "20.00",
      unitRetail: "35.00",
      margin: "42.86",
    },
  ],
  pagination: {
    totalItems: 15,
    currentPage: 1,
    totalPages: 2,
  },
};

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const allItemsService = {
  async getAllItems(requestData, token) {
    if (useAPI) {
      try {
        const response = await fetch(`${BASE_URL}/allItems`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return {
          success: data.status === "success",
          data: data.data || [],
          pagination: data.pagination || {
            totalItems: data.data?.length || 0,
            currentPage: requestData.page || 1,
            totalPages: Math.ceil(
              (data.data?.length || 0) / (requestData.limit || 10),
            ),
          },
          message: data.message || "Items retrieved successfully",
        };
      } catch (error) {
        console.error("API Error:", error);
        return {
          success: false,
          data: [],
          pagination: {
            totalItems: 0,
            currentPage: 1,
            totalPages: 0,
          },
          message: error.message,
        };
      }
    } else {
      // Simulate API delay
      await delay(800);

      try {
        // Simulate filtering for search
        let filteredData = [...dummyApiResponse.data];

        if (requestData.search && requestData.search.trim()) {
          const searchTerm = requestData.search.toLowerCase();
          filteredData = filteredData.filter(
            (item) =>
              item.scanCode.toLowerCase().includes(searchTerm) ||
              item.description.toLowerCase().includes(searchTerm),
          );
        }

        // Simulate pagination
        const page = requestData.page || 1;
        const limit = requestData.limit || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = filteredData.slice(startIndex, endIndex);

        return {
          success: true,
          data: paginatedData,
          pagination: {
            totalItems: filteredData.length,
            currentPage: page,
            totalPages: Math.ceil(filteredData.length / limit),
          },
          message: "Items retrieved successfully (dummy data)",
        };
      } catch (error) {
        return {
          success: false,
          data: [],
          pagination: {
            totalItems: 0,
            currentPage: 1,
            totalPages: 0,
          },
          message: error.message,
        };
      }
    }
  },

  // Get single item by ID
  async getItemById(productId, token) {
    if (useAPI) {
      try {
        const response = await fetch(`${BASE_URL}/item/${productId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return {
          success: data.status === "success",
          data: data.data || null,
          message: data.message || "Item retrieved successfully",
        };
      } catch (error) {
        console.error("API Error:", error);
        return {
          success: false,
          data: null,
          message: error.message,
        };
      }
    } else {
      await delay(300);

      const item = dummyApiResponse.data.find(
        (item) => item.productId === productId,
      );

      return {
        success: !!item,
        data: item || null,
        message: item ? "Item found" : "Item not found",
      };
    }
  },

  // Update item
  async updateItem(productId, updateData, token) {
    if (useAPI) {
      try {
        const response = await fetch(`${BASE_URL}/item/${productId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return {
          success: data.status === "success",
          data: data.data || null,
          message: data.message || "Item updated successfully",
        };
      } catch (error) {
        console.error("API Error:", error);
        return {
          success: false,
          data: null,
          message: error.message,
        };
      }
    } else {
      await delay(500);

      const itemIndex = dummyApiResponse.data.findIndex(
        (item) => item.productId === productId,
      );

      if (itemIndex !== -1) {
        dummyApiResponse.data[itemIndex] = {
          ...dummyApiResponse.data[itemIndex],
          ...updateData,
        };

        return {
          success: true,
          data: dummyApiResponse.data[itemIndex],
          message: "Item updated successfully (dummy data)",
        };
      }

      return {
        success: false,
        data: null,
        message: "Item not found",
      };
    }
  },

  // Delete item
  async deleteItem(productId, token) {
    if (useAPI) {
      try {
        const response = await fetch(`${BASE_URL}/item/${productId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return {
          success: data.status === "success",
          message: data.message || "Item deleted successfully",
        };
      } catch (error) {
        console.error("API Error:", error);
        return {
          success: false,
          message: error.message,
        };
      }
    } else {
      await delay(400);

      const itemIndex = dummyApiResponse.data.findIndex(
        (item) => item.productId === productId,
      );

      if (itemIndex !== -1) {
        dummyApiResponse.data.splice(itemIndex, 1);
        return {
          success: true,
          message: "Item deleted successfully (dummy data)",
        };
      }

      return {
        success: false,
        message: "Item not found",
      };
    }
  },
};
