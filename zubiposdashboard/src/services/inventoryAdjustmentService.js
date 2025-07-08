// Mock data for development - replace with actual API calls
const mockAdjustments = [
  {
    id: "ADJ001",
    date: "2024-01-15T10:30:00Z",
    itemId: "ITM001",
    itemName: "Samsung Galaxy S24",
    currentQuantity: 10,
    adjustedQuantity: 8,
    reason: "damaged",
    notes: "Water damage from store leak",
    user: "John Doe",
  },
  {
    id: "ADJ002",
    date: "2024-01-14T14:20:00Z",
    itemId: "ITM002",
    itemName: "Apple iPhone 15",
    currentQuantity: 5,
    adjustedQuantity: 7,
    reason: "received",
    notes: "Additional units received from vendor",
    user: "Jane Smith",
  },
  {
    id: "ADJ003",
    date: "2024-01-13T09:15:00Z",
    itemId: "ITM003",
    itemName: "Sony Headphones",
    currentQuantity: 15,
    adjustedQuantity: 13,
    reason: "theft",
    notes: "Security incident reported",
    user: "Mike Johnson",
  },
  {
    id: "ADJ004",
    date: "2024-01-12T16:45:00Z",
    itemId: "ITM004",
    itemName: "Nintendo Switch",
    currentQuantity: 8,
    adjustedQuantity: 9,
    reason: "count-error",
    notes: "Miscount during inventory check",
    user: "Sarah Wilson",
  },
  {
    id: "ADJ005",
    date: "2024-01-11T11:30:00Z",
    itemId: "ITM005",
    itemName: "Dell Laptop",
    currentQuantity: 3,
    adjustedQuantity: 2,
    reason: "expired",
    notes: "Battery warranty expired, returned to vendor",
    user: "Tom Brown",
  },
];

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const inventoryAdjustmentService = {
  // Get all adjustments with filtering
  async getAdjustments(filters = {}) {
    await delay(500); // Simulate API call

    try {
      let filteredAdjustments = [...mockAdjustments];

      // Apply search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredAdjustments = filteredAdjustments.filter(
          (adj) =>
            adj.itemId.toLowerCase().includes(searchTerm) ||
            adj.itemName.toLowerCase().includes(searchTerm) ||
            adj.notes.toLowerCase().includes(searchTerm),
        );
      }

      // Apply reason filter
      if (filters.reason) {
        filteredAdjustments = filteredAdjustments.filter(
          (adj) => adj.reason === filters.reason,
        );
      }

      // Apply date range filter
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        filteredAdjustments = filteredAdjustments.filter(
          (adj) => new Date(adj.date) >= startDate,
        );
      }

      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999); // End of day
        filteredAdjustments = filteredAdjustments.filter(
          (adj) => new Date(adj.date) <= endDate,
        );
      }

      // Apply sorting
      if (filters.sortBy) {
        filteredAdjustments.sort((a, b) => {
          let aValue = a[filters.sortBy];
          let bValue = b[filters.sortBy];

          // Handle date sorting
          if (filters.sortBy === "date") {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
          }

          // Handle numeric sorting
          if (
            filters.sortBy === "currentQuantity" ||
            filters.sortBy === "adjustedQuantity"
          ) {
            aValue = Number(aValue);
            bValue = Number(bValue);
          }

          // Handle string sorting
          if (typeof aValue === "string") {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }

          if (filters.sortDirection === "desc") {
            return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
          } else {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
          }
        });
      }

      return {
        success: true,
        data: filteredAdjustments,
        total: filteredAdjustments.length,
        message: "Adjustments loaded successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        total: 0,
        message: error.message,
      };
    }
  },

  // Get a single adjustment by ID
  async getAdjustment(id) {
    await delay(300);

    try {
      const adjustment = mockAdjustments.find((adj) => adj.id === id);

      if (!adjustment) {
        return {
          success: false,
          data: null,
          message: "Adjustment not found",
        };
      }

      return {
        success: true,
        data: adjustment,
        message: "Adjustment found",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
      };
    }
  },

  // Create a new adjustment
  async createAdjustment(adjustmentData) {
    await delay(800);

    try {
      // Validate required fields
      if (
        !adjustmentData.itemId ||
        !adjustmentData.itemName ||
        !adjustmentData.reason
      ) {
        return {
          success: false,
          data: null,
          message: "Missing required fields",
        };
      }

      // Generate new ID
      const newId = `ADJ${String(mockAdjustments.length + 1).padStart(3, "0")}`;

      const newAdjustment = {
        id: newId,
        date: new Date().toISOString(),
        itemId: adjustmentData.itemId,
        itemName: adjustmentData.itemName,
        currentQuantity: adjustmentData.currentQuantity || 0,
        adjustedQuantity: adjustmentData.adjustedQuantity || 0,
        reason: adjustmentData.reason,
        notes: adjustmentData.notes || "",
        user: "Current User", // In real app, get from auth context
      };

      // Add to mock data (in real app, this would be an API call)
      mockAdjustments.unshift(newAdjustment);

      return {
        success: true,
        data: newAdjustment,
        message: "Adjustment created successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
      };
    }
  },

  // Update an existing adjustment
  async updateAdjustment(id, adjustmentData) {
    await delay(600);

    try {
      const index = mockAdjustments.findIndex((adj) => adj.id === id);

      if (index === -1) {
        return {
          success: false,
          data: null,
          message: "Adjustment not found",
        };
      }

      // Update the adjustment
      mockAdjustments[index] = {
        ...mockAdjustments[index],
        ...adjustmentData,
        id, // Ensure ID doesn't change
      };

      return {
        success: true,
        data: mockAdjustments[index],
        message: "Adjustment updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
      };
    }
  },

  // Delete an adjustment
  async deleteAdjustment(id) {
    await delay(400);

    try {
      const index = mockAdjustments.findIndex((adj) => adj.id === id);

      if (index === -1) {
        return {
          success: false,
          data: null,
          message: "Adjustment not found",
        };
      }

      // Remove the adjustment
      const deletedAdjustment = mockAdjustments.splice(index, 1)[0];

      return {
        success: true,
        data: deletedAdjustment,
        message: "Adjustment deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
      };
    }
  },

  // Get adjustment statistics
  async getAdjustmentStats(filters = {}) {
    await delay(400);

    try {
      const adjustments = await this.getAdjustments(filters);

      if (!adjustments.success) {
        return adjustments;
      }

      const stats = {
        totalAdjustments: adjustments.data.length,
        totalPositiveAdjustments: adjustments.data.filter(
          (adj) => adj.adjustedQuantity > adj.currentQuantity,
        ).length,
        totalNegativeAdjustments: adjustments.data.filter(
          (adj) => adj.adjustedQuantity < adj.currentQuantity,
        ).length,
        reasonBreakdown: {},
      };

      // Calculate reason breakdown
      adjustments.data.forEach((adj) => {
        stats.reasonBreakdown[adj.reason] =
          (stats.reasonBreakdown[adj.reason] || 0) + 1;
      });

      return {
        success: true,
        data: stats,
        message: "Statistics calculated successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
      };
    }
  },
};
