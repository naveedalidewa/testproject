import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import { inventoryService } from "../services/inventoryService";
import { departmentService } from "../services/departmentService";
import { updatePurchaseOrderProduct } from "../services/purchaseOrderService";
import { getTaxOptions } from "../services/taxService";
import { getAgeOptions } from "../services/ageService";
import { addProduct } from "../services/productService";
import {
  calculateMarginPercentage,
  calculateUnitCost,
  formatMarginDisplay,
} from "../utils/marginCalculation";
import DepartmentDropdown from "./DepartmentDropdown";
import TaxDropdown from "./TaxDropdown";
import AgeDropdown from "./AgeDropdown";

const EditItemModal = ({
  isOpen,
  onClose,
  onSave,
  editData = null,
  preloadedTaxOptions = null,
  preloadedAgeOptions = null,
  preloadedDepartmentOptions = null,
  vendors = [],
  purchaseOrderId = null,
  onRefreshData = null,
}) => {
  const { token, selectedLocation } = useAuth();
  const { showToastSuccess, showToastError } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [taxOptions, setTaxOptions] = useState([]);
  const [ageOptions, setAgeOptions] = useState([]);
  const [upcNotFound, setUpcNotFound] = useState(false);
  const [formData, setFormData] = useState({
    upc: "",
    description: "",
    department: "",
    quantity: 1,
    unitCase: 1,
    caseCost: "",
    retail: "",
    margin: "",
    age: "",
    tax: "",
    ebt: false,
    // Additional fields for API payload
    productId: "",
    productPriceId: "",
    departmentId: "",
    taxId: "",
    minAgeId: "",
    vendorItemCode: "",
    categoryId: "",
    caseDiscount: "0.00",
    size: "0",
    priceType: 0,
    scaleType: "",
    maxInv: "",
    minInv: "",
    priceGroupId: null,
  });

  const upcInputRef = useRef(null);

  // Load departments, tax options, and age options
  useEffect(() => {
    const loadDropdownData = async () => {
      if (selectedLocation?.id && token) {
        try {
          // Use preloaded departments if available, otherwise fetch
          if (
            preloadedDepartmentOptions &&
            preloadedDepartmentOptions.length > 0
          ) {
            console.log(
              "EditItemModal using preloaded departmentOptions:",
              preloadedDepartmentOptions,
            );
            setDepartments(preloadedDepartmentOptions);
          } else {
            const deptResponse = await departmentService.getDepartments(
              token,
              selectedLocation.id,
            );
            if (deptResponse.status === "success") {
              setDepartments(deptResponse.data);
            }
          }

          // Use preloaded options if available, otherwise fetch
          if (preloadedTaxOptions && preloadedTaxOptions.length > 0) {
            console.log(
              "EditItemModal using preloaded taxOptions:",
              preloadedTaxOptions,
            );
            setTaxOptions(preloadedTaxOptions);
          } else {
            const taxOptionsData = await getTaxOptions(selectedLocation.id);
            console.log(
              "EditItemModal fetched taxOptionsData:",
              taxOptionsData,
            );
            setTaxOptions(taxOptionsData);
          }

          if (preloadedAgeOptions && preloadedAgeOptions.length > 0) {
            console.log(
              "EditItemModal using preloaded ageOptions:",
              preloadedAgeOptions,
            );
            setAgeOptions(preloadedAgeOptions);
          } else {
            const ageOptionsData = await getAgeOptions(selectedLocation.id);
            console.log(
              "EditItemModal fetched ageOptionsData:",
              ageOptionsData,
            );
            setAgeOptions(ageOptionsData);
          }
        } catch (error) {
          console.error("Failed to load dropdown data:", error);
        }
      }
    };

    if (isOpen) {
      loadDropdownData();
    }
  }, [
    isOpen,
    token,
    selectedLocation?.id,
    preloadedTaxOptions,
    preloadedAgeOptions,
    preloadedDepartmentOptions,
  ]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setUpcNotFound(false); // Reset UPC not found state
      if (editData) {
        // Calculate margin if not present or if showing "auto"
        let calculatedMargin = editData.margin;
        if (
          !calculatedMargin ||
          calculatedMargin === "auto" ||
          calculatedMargin === ""
        ) {
          const marginValue = calculateMarginPercentage(
            editData.retail,
            editData.caseCost,
            editData.unitCase,
          );
          calculatedMargin = marginValue.toFixed(2);
        }

        setFormData({
          ...editData,
          margin: calculatedMargin,
        });
      } else {
        setFormData({
          upc: "",
          description: "",
          department: "",
          quantity: 1,
          unitCase: 1,
          caseCost: "",
          retail: "",
          margin: "",
          age: "",
          tax: "",
          ebt: false,
          // Reset additional fields
          productId: "",
          productPriceId: "",
          departmentId: "",
          taxId: "",
          minAgeId: "",
          vendorItemCode: "",
          categoryId: "",
          caseDiscount: "0.00",
          size: "0",
          priceType: 0,
          scaleType: "",
          maxInv: "",
          minInv: "",
          priceGroupId: null,
        });
      }
      // Focus UPC input after modal opens (only for new items)
      if (!editData) {
        setTimeout(() => {
          if (upcInputRef.current) {
            upcInputRef.current.focus();
            upcInputRef.current.select();
          }
        }, 100);
      }
    }
  }, [isOpen, editData]);

  // Calculate margin when costs change
  useEffect(() => {
    // Only calculate if we have valid cost and retail values
    if (formData.caseCost && formData.retail && formData.unitCase) {
      const margin = calculateMarginPercentage(
        formData.retail,
        formData.caseCost,
        formData.unitCase,
      );

      setFormData((prev) => ({
        ...prev,
        margin: margin.toFixed(2), // Always show calculated margin, even if negative or zero
      }));
    }
  }, [formData.caseCost, formData.retail, formData.unitCase]);

  // UPC lookup function
  const lookupUPC = async (upc) => {
    if (!upc.trim()) {
      console.log("UPC is empty, skipping lookup");
      return;
    }

    if (!selectedLocation?.id) {
      console.log("No location selected, skipping lookup");
      return;
    }

    if (!token) {
      console.log("No auth token, skipping lookup");
      return;
    }

    console.log("Looking up UPC:", upc);
    setIsLoading(true);

    try {
      const [response, taxOptions, ageOptions] = await Promise.all([
        inventoryService.getInventoryByScanCode(
          token,
          upc,
          selectedLocation.id,
        ),
        getTaxOptions(selectedLocation.id),
        getAgeOptions(selectedLocation.id),
      ]);

      console.log("UPC lookup response:", response);
      console.log("Tax options received:", taxOptions);
      console.log("Age options received:", ageOptions);

      if (response.status === "success") {
        const data = response.data;

        // Find department name by matching departmentId
        const department = departments.find(
          (dept) => dept.id === data.departmentId,
        );
        const departmentName = department
          ? department.name
          : data.departmentName || "";

        // Find tax name by matching taxId
        console.log(
          "Looking for taxId:",
          data.taxId,
          "in tax options:",
          taxOptions,
        );
        const tax = taxOptions.find((taxOption) => taxOption.id === data.taxId);
        const taxName = tax ? tax.name : "no tax";
        console.log("Found tax:", tax, "taxName:", taxName);

        // Find age by matching minAgeId
        console.log(
          "Looking for minAgeId:",
          data.minAgeId,
          "in age options:",
          ageOptions,
        );
        const age = ageOptions.find(
          (ageOption) => ageOption.id === data.minAgeId,
        );
        const ageName = age ? age.minAge : "no restriction";
        console.log("Found age:", age, "ageName:", ageName);

        console.log("Mapping fields:", {
          name: data.name,
          departmentId: data.departmentId,
          departmentName: departmentName,
          unitCase: data.unitCase,
          caseCost: data.caseCost,
          unitRetail: data.unitRetail,
          allowEbt: data.allowEbt,
          taxId: data.taxId,
          taxName: taxName,
          minAgeId: data.minAgeId,
          ageName: ageName,
        });

        // Calculate margin from lookup data
        const marginCalculated = calculateMarginPercentage(
          data.unitRetail || 0,
          data.caseCost || 0,
          data.unitCase || 1,
        );

        // Map API response to form data with correct field mapping
        setFormData((prev) => ({
          ...prev,
          description: data.name || "",
          department: departmentName,
          unitCase: data.unitCase || 1,
          caseCost: data.caseCost || "",
          retail: data.unitRetail || "",
          margin: marginCalculated.toFixed(2), // Calculate and set margin immediately
          ebt: data.allowEbt || false,
          tax: taxName,
          age: ageName,
          // Store additional fields for API detection and payload
          productId: data.id || "",
          productPriceId: data.productPriceId || "",
          departmentId: data.departmentId || "",
          taxId: data.taxId || "",
          minAgeId: data.minAgeId || "",
          vendorItemCode: data.vendorItemCode || "",
          categoryId: data.categoryId || "",
          caseDiscount: data.caseDiscount || "0.00",
          size: data.size || "0",
          priceType: data.priceType || 0,
          scaleType: data.scaleType || "",
          maxInv: data.maxInv || "",
          minInv: data.minInv || "",
          priceGroupId: data.priceGroupId || null,
        }));
        setUpcNotFound(false); // Clear not found state on successful lookup
      } else {
        console.log("Item not found for UPC:", upc, "Response:", response);
        setUpcNotFound(true); // Show not found message
      }
    } catch (error) {
      console.error("UPC lookup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle UPC input changes
  const handleUPCChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, upc: value }));
    setUpcNotFound(false); // Clear not found message when typing
  };

  // Handle UPC blur or Enter key
  const handleUPCBlur = () => {
    // Only lookup UPC when adding new items, not when editing existing ones
    if (formData.upc && !editData) {
      lookupUPC(formData.upc);
    }
  };

  const handleUPCKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleUPCBlur();
    }
  };

  // Handle department change and auto-set tax and EBT
  const handleDepartmentChange = (departmentName) => {
    console.log("handleDepartmentChange called with:", departmentName);
    console.log("Available departments:", departments);

    const selectedDepartment = departments.find(
      (dept) => dept.name === departmentName,
    );

    console.log("Selected department:", selectedDepartment);

    if (selectedDepartment) {
      const newTax = selectedDepartment.tax
        ? selectedDepartment.tax.name
        : "no tax";
      const newAge = selectedDepartment.minAge
        ? selectedDepartment.minAge.minAge
        : "no restriction";
      const newEbt = selectedDepartment.ebt || false;

      console.log("Setting new values:", { newTax, newAge, newEbt });

      setFormData((prev) => {
        console.log("Previous formData:", prev);
        const newFormData = {
          ...prev,
          department: departmentName,
          tax: newTax,
          ebt: newEbt,
          age: newAge,
        };
        console.log("New formData:", newFormData);
        return newFormData;
      });
    } else {
      console.log("Department not found, only updating department name");
      setFormData((prev) => ({ ...prev, department: departmentName }));
    }
  };

  // Handle age change and auto-set tax and EBT based on department
  const handleAgeChange = (ageValue) => {
    const selectedDepartment = departments.find(
      (dept) => dept.name === formData.department,
    );

    if (selectedDepartment) {
      setFormData((prev) => ({
        ...prev,
        age: ageValue,
        tax: selectedDepartment.tax ? selectedDepartment.tax.name : "no tax",
        ebt: selectedDepartment.ebt || false,
      }));
    } else {
      setFormData((prev) => ({ ...prev, age: ageValue }));
    }
  };

  // Handle other input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle save
  const handleSave = async () => {
    if (editData) {
      // This is an edit operation - call API
      setIsSaving(true);
      try {
        // Find the department ID from the selected department name
        const selectedDepartment = departments.find(
          (dept) => dept.name === formData.department,
        );
        const departmentId = selectedDepartment?.id;
        const departmentLocationId = selectedDepartment?.departmentLocationId;

        // Find the tax ID from the selected tax value
        const selectedTax = taxOptions.find(
          (tax) =>
            tax.name === formData.tax ||
            tax.value === formData.tax ||
            tax.label === formData.tax,
        );
        const taxId = selectedTax?.id;

        // Find the age ID from the selected age value
        const selectedAge = ageOptions.find(
          (age) =>
            age.minAge === formData.age ||
            age.value === formData.age ||
            age.label === formData.age,
        );
        const minAgeId = selectedAge?.id;

        // Find payeeId from vendors (use the vendor from the current PO)
        const payeeId = vendors.length > 0 ? vendors[0].id : editData.payeeId;

        // Calculate margin
        const margin = calculateMarginPercentage(
          formData.retail,
          formData.caseCost,
          formData.unitCase,
        );

        // Prepare API payload according to the mapping
        const apiPayload = {
          locationId: selectedLocation.id,
          Data: [
            {
              unitRetail: parseFloat(formData.retail) || 0,
              unitCase: parseInt(formData.unitCase) || 1,
              departmentId: departmentId,
              quantity: parseInt(formData.quantity) || 1,
              vendorItemCode: editData.vendorItemCode || "",
              barCode: formData.upc,
              name: formData.description,
              priceGroupId: editData.priceGroupId || "",
              categoryId: editData.categoryId || null,
              caseCost: formData.caseCost.toString(),
              caseDiscount: editData.caseDiscount || "0.00",
              size: editData.size || "0",
              marginAfterRebate: margin.toString(),
              purchaseOrderProductId: editData.purchaseOrderProductId,
              productId: editData.id,
              productPriceId: editData.productPriceId || "",
              priceType: editData.priceType || 0,
              minAgeId: minAgeId,
              allowEbt: formData.ebt,
              taxId: taxId,
              unitAfterDiscount: formData.retail.toString(),
              margin: margin.toString(),
              departmentLocationId: departmentLocationId, // From getDepartments API
              locationId: selectedLocation.id,
              payeeId: payeeId, // From getVendors API
              type: 0,
            },
          ],
        };

        console.log("Calling updatePurchaseOrderProduct with:", apiPayload);

        // Call the API
        const response = await updatePurchaseOrderProduct(token, apiPayload);

        if (response.status === "success") {
          showToastSuccess(response.message || "Product updated successfully");
          // Refresh the data from API instead of local state update
          if (onRefreshData) {
            onRefreshData();
          }
          onClose();
        } else {
          showToastError(response.message || "Failed to update product");
        }
      } catch (error) {
        console.error("Error updating product:", error);
        showToastError("An error occurred while updating the product");
      } finally {
        setIsSaving(false);
      }
    } else {
      // This is an add operation - check if we need to call API for found items
      // If the item was found via UPC lookup (has productPriceId or other indicators), call API
      if (formData.productPriceId || formData.productId || !upcNotFound) {
        // Item found in system - call updatePurchaseOrderProduct API
        setIsSaving(true);
        try {
          // Find the department ID and departmentLocationId from the selected department name
          const selectedDepartment = departments.find(
            (dept) => dept.name === formData.department,
          );
          const departmentId = selectedDepartment?.id;
          const departmentLocationId = selectedDepartment?.departmentLocationId;
          const departmentTaxId = selectedDepartment?.taxId;

          // Find the tax ID from the selected tax value
          const selectedTax = taxOptions.find(
            (tax) =>
              tax.name === formData.tax ||
              tax.value === formData.tax ||
              tax.label === formData.tax,
          );
          const taxId = selectedTax?.id;

          // Find the age ID from the selected age value
          const selectedAge = ageOptions.find(
            (age) =>
              age.minAge === formData.age ||
              age.value === formData.age ||
              age.label === formData.age,
          );
          const minAgeId = selectedAge?.id;

          // Find payeeId from vendors
          const payeeId = vendors.length > 0 ? vendors[0].id : null;

          // Calculate margin
          const margin = calculateMarginPercentage(
            formData.retail,
            formData.caseCost,
            formData.unitCase,
          );

          // Calculate extended case cost (quantity * caseCost)
          const extdCase =
            parseFloat(formData.quantity || 1) *
            parseFloat(formData.caseCost || 0);

          // Prepare API payload for adding new found item
          const apiPayload = {
            locationId: selectedLocation.id,
            Data: [
              {
                taxId: taxId,
                name: formData.description,
                unitRetail: parseFloat(formData.retail) || 0,
                departmentId: departmentId,
                unitCase: formData.unitCase.toString(),
                vendorItemCode: formData.vendorItemCode || "",
                barCode: formData.upc,
                caseCost: formData.caseCost.toString(),
                caseDiscount: formData.caseDiscount || "0.00",
                categoryId: formData.categoryId || "",
                allowEbt: formData.ebt,
                priceType: formData.priceType || 0,
                productPriceId: formData.productPriceId || "",
                unitAfterDiscount: (
                  parseFloat(formData.caseCost || 0) /
                  parseInt(formData.unitCase || 1)
                ).toString(),
                scaleType: formData.scaleType || "",
                margin: margin.toString(),
                extdCase: extdCase,
                minAgeId: minAgeId,
                maxInv: formData.maxInv || "",
                minInv: formData.minInv || "",
                priceGroupId: formData.priceGroupId || null,
                size: formData.size || "0",
                departmentLocationId: departmentLocationId,
                departmentTaxId: departmentTaxId || taxId,
                purchaseOrderId: purchaseOrderId,
                locationId: selectedLocation.id,
                payeeId: payeeId,
                quantity: parseInt(formData.quantity) || 1,
                productId: formData.productId || "",
                type: 1, // Type 1 for new items
              },
            ],
          };

          console.log(
            "Adding new found item with updatePurchaseOrderProduct:",
            apiPayload,
          );

          // Call the API
          const response = await updatePurchaseOrderProduct(token, apiPayload);

          if (response.status === "success") {
            showToastSuccess(response.message || "Product added successfully");
            // Refresh the data from API instead of local state update for API-based adds
            if (onRefreshData) {
              onRefreshData();
            }
            onClose();
          } else {
            showToastError(response.message || "Failed to add product");
          }
        } catch (error) {
          console.error("Error adding new product:", error);
          showToastError("An error occurred while adding the product");
        } finally {
          setIsSaving(false);
        }
      } else {
        // Item not found in system - call addProduct API to create new item
        setIsSaving(true);
        try {
          // Find the department ID and departmentLocationId from the selected department name
          const selectedDepartment = departments.find(
            (dept) => dept.name === formData.department,
          );
          const departmentId = selectedDepartment?.id;
          const departmentLocationId = selectedDepartment?.departmentLocationId;
          const departmentTaxId = selectedDepartment?.taxId;

          // Find the tax ID from the selected tax value
          const selectedTax = taxOptions.find(
            (tax) =>
              tax.name === formData.tax ||
              tax.value === formData.tax ||
              tax.label === formData.tax,
          );
          const taxId = selectedTax?.id;

          // Find the age ID from the selected age value
          const selectedAge = ageOptions.find(
            (age) =>
              age.minAge === formData.age ||
              age.value === formData.age ||
              age.label === formData.age,
          );
          const minAgeId = selectedAge?.id;

          // Find payeeId from vendors
          const payeeId = vendors.length > 0 ? vendors[0].id : null;

          // Calculate margin
          const margin = calculateMarginPercentage(
            formData.retail,
            formData.caseCost,
            formData.unitCase,
          );

          // Calculate extended case cost (quantity * caseCost)
          const extdCase =
            parseFloat(formData.quantity || 0) *
            parseFloat(formData.caseCost || 0);

          // Calculate unit after discount
          const unitAfterDiscount = parseFloat(formData.caseCost || 0);

          // Prepare API payload for addProduct
          const apiPayload = {
            taxId: taxId,
            name: formData.name || formData.description,
            unitRetail: parseFloat(formData.retail || 0),
            departmentId: departmentId,
            unitCase: formData.unitCase || "1",
            vendorItemCode: formData.vendorItemCode || "",
            barCode: formData.upc,
            caseCost: formData.caseCost,
            caseDiscount: 0,
            categoryId: "",
            allowEbt: formData.allowEbt || false,
            priceType: 0,
            productPriceId: "",
            unitAfterDiscount: unitAfterDiscount.toFixed(2),
            scaleType: "",
            margin: margin.toString(),
            extdCase: extdCase,
            minAgeId: minAgeId,
            maxInv: "",
            minInv: "",
            priceGroupId: null,
            size: formData.size || "",
            locationId: selectedLocation.id,
            quantity: formData.quantity || "1",
            caseRebate: 0,
            loyaltyPoints: 0,
            unitOfMeasure: "",
            description: formData.description || formData.name,
            productType: 0,
            newScanCode: formData.upc,
            itemEntry: true,
            payeeId: payeeId,
            purchaseOrderId: purchaseOrderId,
            priceGroup: [
              {
                priceGroupId: null,
                locationId: selectedLocation.id,
                productPriceId: "",
                productId: "",
                price: parseFloat(formData.retail || 0),
                priceType: null,
                cashPrice: null,
                minAgeId: minAgeId,
                taxId: taxId,
                departmentLocationId: departmentLocationId,
                departmentTaxId: departmentTaxId,
                departmentEbt: formData.allowEbt || false,
                name: formData.name || formData.description,
                taxName: formData.tax,
                minAge: formData.age,
                tax: formData.tax,
                allowEbt: formData.allowEbt || false,
              },
            ],
            image: "",
          };

          console.log("Calling addProduct with:", apiPayload);

          // Call the addProduct API
          const response = await addProduct(token, apiPayload);

          if (response.status === "success") {
            showToastSuccess("Product added successfully!");

            // After successful product creation, add to purchase order using existing logic
            const newFormData = {
              ...formData,
              productId: response.data?.productId,
              productPriceId: response.data?.productPriceId,
            };
            onSave(newFormData);

            // Refresh the purchase order items and summary totals
            if (onRefreshData) {
              await onRefreshData();
            }

            onClose();
          } else {
            showToastError(response.message || "Failed to add product");
          }
        } catch (error) {
          console.error("Error adding new product:", error);
          showToastError("An error occurred while adding the product");
        } finally {
          setIsSaving(false);
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editData ? "Edit Item (UPC Read-only)" : "Add New Item"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {/* UPC */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              UPC *
            </label>
            <div className="relative">
              <input
                ref={upcInputRef}
                type="text"
                value={formData.upc}
                onChange={editData ? null : handleUPCChange}
                onBlur={editData ? null : handleUPCBlur}
                onKeyDown={editData ? null : handleUPCKeyDown}
                placeholder={
                  editData ? "UPC (Read-only)" : "Enter UPC and press Enter"
                }
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none ${
                  editData
                    ? "bg-gray-100 cursor-not-allowed text-gray-600"
                    : "focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                }`}
                readOnly={!!editData}
                disabled={!!editData}
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                </div>
              )}
            </div>
            {upcNotFound && !editData && (
              <div className="mt-1 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                ⚠️ Item not found - You are adding a new item
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Item description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department *
            </label>
            <DepartmentDropdown
              value={formData.department}
              onChange={handleDepartmentChange}
              placeholder="Select Department"
            />
          </div>

          {/* Quantity and Unit/Case */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit in Case*
              </label>
              <input
                type="number"
                value={formData.unitCase}
                onChange={(e) => handleInputChange("unitCase", e.target.value)}
                min="1"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  !formData.unitCase || parseFloat(formData.unitCase) <= 0
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
              />
            </div>
          </div>

          {/* Case Cost, Unit Cost, Retail, and Margin */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Case Cost *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.caseCost}
                onChange={(e) => handleInputChange("caseCost", e.target.value)}
                placeholder="0.00"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  !formData.caseCost || parseFloat(formData.caseCost) <= 0
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Cost
              </label>
              <input
                type="text"
                value={
                  formData.caseCost && formData.unitCase
                    ? `$${calculateUnitCost(formData.caseCost, formData.unitCase).toFixed(2)}`
                    : ""
                }
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                placeholder="Auto"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Retail *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.retail}
                onChange={(e) => handleInputChange("retail", e.target.value)}
                placeholder="0.00"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  !formData.retail || parseFloat(formData.retail) <= 0
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Margin (%)
              </label>
              <input
                type="text"
                value={
                  formData.margin
                    ? formatMarginDisplay(parseFloat(formData.margin))
                    : ""
                }
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                placeholder="Auto"
              />
            </div>
          </div>

          {/* Age, Tax, and EBT */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <AgeDropdown
                value={formData.age}
                onChange={handleAgeChange}
                preloadedOptions={ageOptions}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax
              </label>
              <TaxDropdown
                value={formData.tax}
                onChange={(value) => handleInputChange("tax", value)}
                preloadedOptions={taxOptions}
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.ebt}
                  onChange={(e) => handleInputChange("ebt", e.target.checked)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-700">EBT Eligible</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={
              isSaving ||
              !formData.upc ||
              !formData.description ||
              !formData.department ||
              !formData.unitCase ||
              parseFloat(formData.unitCase) <= 0 ||
              !formData.caseCost ||
              parseFloat(formData.caseCost) <= 0 ||
              !formData.retail ||
              parseFloat(formData.retail) <= 0
            }
            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSaving && (
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {isSaving ? "Saving..." : "Save Item"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditItemModal;
