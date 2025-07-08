import { BASE_URL, isAPI as useAPI } from "./authService";

// Dummy inventory data for testing - exact API format
const DUMMY_INVENTORY_RESPONSE = {
  status: "success",
  message: "inventory get successully",
  data: {
    id: "a9b35c93-663a-4b51-9e76-30db521f9587",
    franchiseId: "c30299b0-724d-41ef-85e4-69ca6adebb38",
    categoryId: "b9e46995-b136-4dcc-8c25-ab391c10eec7",
    ExtdCaseCost: "10.00",
    taxId: "efdc8657-1392-4f83-aeb9-6cadc8689c83",
    departmentId: "be76a370-81d0-4c53-a55a-0595a72cf053",
    payeeId: "73aeaec6-ce89-4b29-91c3-ed93be584cf6",
    productType: 0,
    barCode: "12345678",
    vendorItemCode: null,
    caseDiscount: "0.00",
    caseRebate: "0.00",
    marginAfterRebate: "33.33",
    loyaltyPoints: 0,
    unitOfMeasure: "Booklet",
    size: ".11 Oz",
    minInv: 0,
    maxInv: 0,
    unitAfterDiscount: "10.00",
    image: "",
    allowEbt: true,
    minAgeId: "53d19275-9c47-40b0-a03d-26551aa73b33",
    minAge: "no restriction",
    isActive: true,
    isDeleted: false,
    createdAt: "2025-06-30T15:02:28.000Z",
    updatedAt: "2025-06-30T15:40:25.000Z",
    productChildren: [],
    departmentName: "EBT",
    type: 1,
    productPriceId: "0c3dd097-85e7-4415-b8dc-d3cb6d873a89",
    priceGroupId: "29a35aba-e5e2-4416-81c8-66f0eed35030",
    locationId: "142b5b91-3ff7-4777-ac88-3d28a0960783",
    quantity: 4,
    name: "CHAPSTICK ORIGINAL LIP PROTECTANT 0.15OZ",
    caseCost: "10.00",
    margin: "33.33",
    unitCase: 1,
    unitRetail: "15.00",
    cashPrice: null,
    priceType: 0,
    scaleType: "1",
  },
};

export const inventoryService = {
  async getInventoryByScanCode(token, barCode, locationId) {
    if (!useAPI) {
      // Return dummy data if UPC matches
      if (barCode === "12345678") {
        return DUMMY_INVENTORY_RESPONSE;
      } else {
        return {
          status: "error",
          message: "Item not found",
        };
      }
    }

    // Real API call
    try {
      const response = await fetch(`${BASE_URL}/getInventoryByScanCode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          barCode,
          itemCode: "",
          locationId,
          type: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch inventory");
      }

      return data;
    } catch (error) {
      throw error;
    }
  },
};
