const isApi = false;

// Centralized dropdown service for all dropdown options
export const dropdownService = {
  // Get vendors - Note: This is deprecated, use vendorService.getVendors instead
  getVendors: async (locationId = null) => {
    console.warn(
      "dropdownService.getVendors is deprecated. Use vendorService.getVendors instead.",
    );

    if (isApi) {
      try {
        const response = await fetch("/api/vendors", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        return data.success
          ? { status: "success", data: data.data }
          : { status: "error", message: data.message };
      } catch (error) {
        console.error("Error fetching vendors:", error);
        return { status: "error", message: error.message };
      }
    } else {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Dummy vendor data
      const dummyVendors = [
        {
          id: "8bf2c0d6-8ff1-4590-ab39-c6103cd93138",
          name: "ABC Supplies Co.",
          email: "contact@abcsupplies.com",
          phoneNo: "(555) 123-4567",
          address: "123 Business Ave, City, State 12345",
          isActive: true,
        },
        {
          id: "9cf3d1e7-9gg2-5691-bc40-d7204de94249",
          name: "XYZ Electronics",
          email: "sales@xyzelec.com",
          phoneNo: "(555) 234-5678",
          address: "456 Tech Street, City, State 67890",
          isActive: true,
        },
        {
          id: "acf4e2f8-a003-6792-cd51-e8315ef95360",
          name: "Global Distributors",
          email: "info@globaldist.com",
          phoneNo: "(555) 345-6789",
          address: "789 Commerce Blvd, City, State 13579",
          isActive: true,
        },
        {
          id: "bdf5f3g9-b114-7803-de62-f9426fg06471",
          name: "Premium Goods Inc",
          email: "orders@premiumgoods.com",
          phoneNo: "(555) 456-7890",
          address: "321 Quality Lane, City, State 24680",
          isActive: true,
        },
        {
          id: "ceg6g4ha-c225-8914-ef73-ga537gh17582",
          name: "Wholesale Partners",
          email: "support@wholesale.com",
          phoneNo: "(555) 567-8901",
          address: "654 Trade Center, City, State 97531",
          isActive: true,
        },
      ];

      return { status: "success", data: dummyVendors };
    }
  },

  // Get departments
  getDepartments: async () => {
    if (isApi) {
      try {
        const response = await fetch("/api/dropdown/departments", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        return data.success ? data.data : [];
      } catch (error) {
        console.error("Error fetching departments:", error);
        return [];
      }
    } else {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 200));

      return [
        "Hardware",
        "Electronics",
        "Tools",
        "Furniture",
        "Appliances",
        "Sports",
        "Office",
        "Health & Beauty",
        "Automotive",
        "Clothing",
      ];
    }
  },

  // Get tax options
  getTaxOptions: async () => {
    if (isApi) {
      try {
        const response = await fetch("/api/dropdown/tax-options", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        return data.success ? data.data : [];
      } catch (error) {
        console.error("Error fetching tax options:", error);
        return [];
      }
    } else {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 200));

      return ["Taxable", "Non-Taxable", "Exempt", "Zero-Rate", "Reduced Rate"];
    }
  },

  // Get age options
  getAgeOptions: async () => {
    if (isApi) {
      try {
        const response = await fetch("/api/dropdown/age-options", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        return data.success ? data.data : [];
      } catch (error) {
        console.error("Error fetching age options:", error);
        return [];
      }
    } else {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 200));

      return [
        "New",
        "1-2 Years",
        "2-5 Years",
        "5+ Years",
        "Vintage",
        "Refurbished",
      ];
    }
  },

  // Get all dropdown options at once
  getAllDropdownOptions: async () => {
    try {
      const [vendors, departments, taxOptions, ageOptions] = await Promise.all([
        dropdownService.getVendors(),
        dropdownService.getDepartments(),
        dropdownService.getTaxOptions(),
        dropdownService.getAgeOptions(),
      ]);

      return {
        vendors: vendors.status === "success" ? vendors.data : [],
        departments,
        taxOptions,
        ageOptions,
      };
    } catch (error) {
      console.error("Error fetching all dropdown options:", error);
      return {
        vendors: [],
        departments: [],
        taxOptions: [],
        ageOptions: [],
      };
    }
  },

  // Configuration
  setApiMode: (useApi) => {
    // This would be used to toggle between API and dummy data
    // In a real implementation, this might be stored in a config file
    console.log(`API mode ${useApi ? "enabled" : "disabled"}`);
  },
};

// Legacy support - individual export functions for backward compatibility
export const getVendors = dropdownService.getVendors;
export const getDepartments = dropdownService.getDepartments;
export const getTaxOptions = dropdownService.getTaxOptions;
export const getAgeOptions = dropdownService.getAgeOptions;

export default dropdownService;
