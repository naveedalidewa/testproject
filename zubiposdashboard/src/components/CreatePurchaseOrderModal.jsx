import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import { addPurchaseEntry } from "../services/purchaseOrderService";
import { getVendors } from "../services/vendorService";
import SearchableDropdown from "./SearchableDropdown";
import AddVendorModal from "./AddVendorModal";

const CreatePurchaseOrderModal = ({ isOpen, onClose, onSuccess }) => {
  const { selectedLocation, token } = useAuth();
  const { showToastSuccess, showToastError } = useNotification();

  const [formData, setFormData] = useState({
    date: "",
    payeeId: "",
    invoiceNo: "",
    paymentType: "",
  });

  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [addVendorModalOpen, setAddVendorModalOpen] = useState(false);

  // Payment type options
  const paymentTypeOptions = [
    { id: "1", name: "Cash", value: "1" },
    { id: "2", name: "Check", value: "2" },
    { id: "3", name: "Credit Card", value: "3" },
    { id: "4", name: "Bank Transfer", value: "4" },
  ];

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      // Set default date to today
      const today = new Date().toISOString().split("T")[0];
      setFormData({
        date: today,
        payeeId: "",
        invoiceNo: "",
        paymentType: "",
      });
      fetchVendors();
    }
  }, [isOpen]);

  // Fetch vendors
  const fetchVendors = async () => {
    if (!selectedLocation?.id) return;

    setIsLoading(true);
    try {
      const response = await getVendors(selectedLocation.id, {}, token);

      if (response.status === "success") {
        setVendors(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle vendor selection
  const handleVendorSelect = (vendor) => {
    setFormData((prev) => ({
      ...prev,
      payeeId: vendor.id,
    }));
  };

  // Handle payment type selection
  const handlePaymentTypeSelect = (paymentType) => {
    setFormData((prev) => ({
      ...prev,
      paymentType: paymentType.value,
    }));
  };

  // Handle new vendor creation success
  const handleVendorCreated = async (newVendor) => {
    console.log("handleVendorCreated received:", newVendor);

    // Check if newVendor has the expected structure
    if (!newVendor || !newVendor.name) {
      console.error("Invalid vendor data received:", newVendor);
      showToastError("Error: Invalid vendor data received");
      return;
    }

    setAddVendorModalOpen(false);

    // Refresh the vendor list to get the real database ID
    try {
      console.log("Refreshing vendor list after creating new vendor...");
      const response = await getVendors(selectedLocation.id, {}, token);

      if (response.status === "success") {
        const updatedVendors = response.data || [];
        setVendors(updatedVendors);

        // Find the newly created vendor by name (since we know the name)
        const createdVendor = updatedVendors.find(
          (vendor) =>
            vendor.name.toLowerCase() === newVendor.name.toLowerCase(),
        );

        if (createdVendor) {
          console.log(
            "Found newly created vendor with real ID:",
            createdVendor,
          );
          // Auto-select the newly created vendor using the real database ID
          setFormData((prev) => ({
            ...prev,
            payeeId: createdVendor.id,
          }));
        } else {
          console.warn("Could not find newly created vendor in refreshed list");
        }
      } else {
        console.error("Failed to refresh vendor list:", response);
      }
    } catch (error) {
      console.error("Error refreshing vendor list:", error);
      showToastError("Error refreshing vendor list");
    }
  };

  // Validate form
  const validateForm = () => {
    if (!formData.date) {
      showToastError("Date is required");
      return false;
    }
    if (!formData.payeeId) {
      showToastError("Vendor is required");
      return false;
    }
    if (!formData.invoiceNo.trim()) {
      showToastError("Invoice Number is required");
      return false;
    }
    if (!formData.paymentType) {
      showToastError("Payment Type is required");
      return false;
    }
    return true;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const apiPayload = {
        date: formData.date,
        payeeId: formData.payeeId,
        invoiceNo: formData.invoiceNo.trim(),
        paymentType: formData.paymentType,
        locationId: selectedLocation.id,
      };

      console.log("Creating purchase entry with:", apiPayload);

      const response = await addPurchaseEntry(token, apiPayload);

      if (response.status === "success") {
        showToastSuccess("Purchase Order created successfully!");
        onSuccess(response.id, formData);
        onClose();
      } else {
        showToastError(response.message || "Failed to create purchase order");
      }
    } catch (error) {
      console.error("Error creating purchase entry:", error);
      showToastError("An error occurred while creating purchase order");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Create Purchase Order
          </h2>
          <button
            onClick={onClose}
            disabled={isSaving}
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
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Basic Information
          </h3>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              disabled={isSaving}
            />
          </div>

          {/* Vendor */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Vendor *
              </label>
              <button
                type="button"
                onClick={() => setAddVendorModalOpen(true)}
                disabled={isSaving}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50"
              >
                + Add New Vendor
              </button>
            </div>
            <SearchableDropdown
              options={vendors}
              onChange={(vendorId) => {
                const selectedVendor = vendors.find((v) => v.id === vendorId);
                if (selectedVendor) {
                  handleVendorSelect(selectedVendor);
                }
              }}
              value={formData.payeeId}
              placeholder="Select Vendor"
              disabled={isSaving || isLoading}
              displayKey="name"
              valueKey="id"
              className="w-full"
            />
          </div>

          {/* Invoice Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Invoice Number *
            </label>
            <input
              type="text"
              value={formData.invoiceNo}
              onChange={(e) => handleInputChange("invoiceNo", e.target.value)}
              placeholder="Enter Invoice Number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              disabled={isSaving}
            />
          </div>

          {/* Payment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Type *
            </label>
            <SearchableDropdown
              options={paymentTypeOptions}
              onChange={(paymentTypeValue) => {
                const selectedPaymentType = paymentTypeOptions.find(
                  (pt) => pt.value === paymentTypeValue,
                );
                if (selectedPaymentType) {
                  handlePaymentTypeSelect(selectedPaymentType);
                }
              }}
              value={formData.paymentType}
              placeholder="Select Payment Type"
              disabled={isSaving}
              displayKey="name"
              valueKey="value"
              className="w-full"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 min-w-[80px]"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Add Vendor Modal */}
      <AddVendorModal
        isOpen={addVendorModalOpen}
        onClose={() => setAddVendorModalOpen(false)}
        onSuccess={handleVendorCreated}
      />
    </div>
  );
};

export default CreatePurchaseOrderModal;
