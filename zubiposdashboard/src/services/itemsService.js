const isApi = false;

const dummyItems = [
  {
    id: "ITM003",
    name: "Smart Home Security Camera",
    price: 299.99,
    cost: 180.0,
    category: "Electronics",
    description: "High-definition wireless security camera with night vision",
    upc: "123456789003",
    inStock: 15,
    minStock: 5,
    lastUpdated: "2024-01-15",
  },
  {
    id: "ITM004",
    name: "Garden Tool Set",
    price: 89.99,
    cost: 45.0,
    category: "Home & Garden",
    description: "Complete 5-piece garden tool set with carrying case",
    upc: "123456789004",
    inStock: 8,
    minStock: 3,
    lastUpdated: "2024-01-14",
  },
  {
    id: "ITM005",
    name: "Running Shoes - Black",
    price: 129.99,
    cost: 75.0,
    category: "Sports",
    description: "Professional running shoes with advanced cushioning",
    upc: "123456789005",
    inStock: 22,
    minStock: 10,
    lastUpdated: "2024-01-13",
  },
  {
    id: "ITM006",
    name: "Wireless Charging Pad",
    price: 49.99,
    cost: 25.0,
    category: "Electronics",
    description: "Fast wireless charging pad compatible with all devices",
    upc: "123456789006",
    inStock: 30,
    minStock: 8,
    lastUpdated: "2024-01-12",
  },
  {
    id: "ITM007",
    name: "Yoga Mat Premium",
    price: 79.99,
    cost: 35.0,
    category: "Sports",
    description: "Non-slip premium yoga mat with carrying strap",
    upc: "123456789007",
    inStock: 12,
    minStock: 5,
    lastUpdated: "2024-01-11",
  },
  {
    id: "ITM008",
    name: "Bluetooth Speaker",
    price: 159.99,
    cost: 95.0,
    category: "Electronics",
    description: "Portable waterproof Bluetooth speaker with bass boost",
    upc: "123456789008",
    inStock: 18,
    minStock: 6,
    lastUpdated: "2024-01-10",
  },
  {
    id: "ITM009",
    name: "Kitchen Knife Set",
    price: 199.99,
    cost: 120.0,
    category: "Home & Garden",
    description: "Professional 8-piece kitchen knife set with wooden block",
    upc: "123456789009",
    inStock: 6,
    minStock: 2,
    lastUpdated: "2024-01-09",
  },
  {
    id: "ITM010",
    name: "Fitness Tracker",
    price: 249.99,
    cost: 150.0,
    category: "Electronics",
    description: "Advanced fitness tracker with heart rate monitoring",
    upc: "123456789010",
    inStock: 25,
    minStock: 8,
    lastUpdated: "2024-01-08",
  },
];

export const itemsService = {
  // Get all items with optional filtering
  getItems: async (filters = {}) => {
    if (isApi) {
      // TODO: Replace with actual API call
      try {
        const response = await fetch("/api/items", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        return await response.json();
      } catch (error) {
        console.error("Error fetching items:", error);
        throw error;
      }
    } else {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      let filteredItems = [...dummyItems];

      // Apply filters
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredItems = filteredItems.filter(
          (item) =>
            item.name.toLowerCase().includes(searchLower) ||
            item.id.toLowerCase().includes(searchLower) ||
            item.category.toLowerCase().includes(searchLower),
        );
      }

      if (filters.category) {
        filteredItems = filteredItems.filter(
          (item) => item.category === filters.category,
        );
      }

      if (filters.priceMin !== undefined) {
        filteredItems = filteredItems.filter(
          (item) => item.price >= filters.priceMin,
        );
      }

      if (filters.priceMax !== undefined) {
        filteredItems = filteredItems.filter(
          (item) => item.price <= filters.priceMax,
        );
      }

      // Apply sorting
      if (filters.sortBy) {
        filteredItems.sort((a, b) => {
          const aValue = a[filters.sortBy];
          const bValue = b[filters.sortBy];

          if (filters.sortDirection === "desc") {
            return bValue > aValue ? 1 : -1;
          }
          return aValue > bValue ? 1 : -1;
        });
      }

      return {
        success: true,
        data: filteredItems,
        total: filteredItems.length,
      };
    }
  },

  // Get single item by ID
  getItem: async (itemId) => {
    if (isApi) {
      try {
        const response = await fetch(`/api/items/${itemId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        return await response.json();
      } catch (error) {
        console.error("Error fetching item:", error);
        throw error;
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const item = dummyItems.find((item) => item.id === itemId);
      return item
        ? { success: true, data: item }
        : { success: false, error: "Item not found" };
    }
  },

  // Create new item
  createItem: async (itemData) => {
    if (isApi) {
      try {
        const response = await fetch("/api/items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(itemData),
        });
        return await response.json();
      } catch (error) {
        console.error("Error creating item:", error);
        throw error;
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const newItem = {
        id: `ITM${String(dummyItems.length + 1).padStart(3, "0")}`,
        ...itemData,
        lastUpdated: new Date().toISOString().split("T")[0],
      };
      dummyItems.push(newItem);
      return { success: true, data: newItem };
    }
  },

  // Update existing item
  updateItem: async (itemId, itemData) => {
    if (isApi) {
      try {
        const response = await fetch(`/api/items/${itemId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(itemData),
        });
        return await response.json();
      } catch (error) {
        console.error("Error updating item:", error);
        throw error;
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const itemIndex = dummyItems.findIndex((item) => item.id === itemId);
      if (itemIndex !== -1) {
        dummyItems[itemIndex] = {
          ...dummyItems[itemIndex],
          ...itemData,
          lastUpdated: new Date().toISOString().split("T")[0],
        };
        return { success: true, data: dummyItems[itemIndex] };
      }
      return { success: false, error: "Item not found" };
    }
  },

  // Delete item
  deleteItem: async (itemId) => {
    if (isApi) {
      try {
        const response = await fetch(`/api/items/${itemId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
        return await response.json();
      } catch (error) {
        console.error("Error deleting item:", error);
        throw error;
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const itemIndex = dummyItems.findIndex((item) => item.id === itemId);
      if (itemIndex !== -1) {
        const deletedItem = dummyItems.splice(itemIndex, 1)[0];
        return { success: true, data: deletedItem };
      }
      return { success: false, error: "Item not found" };
    }
  },

  // Get available categories
  getCategories: async () => {
    if (isApi) {
      try {
        const response = await fetch("/api/items/categories", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        return await response.json();
      } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const categories = [...new Set(dummyItems.map((item) => item.category))];
      return { success: true, data: categories };
    }
  },
};
