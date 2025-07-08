import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import { addPayee } from "../services/vendorService";

const AddVendorModal = ({ isOpen, onClose, onSuccess }) => {
  const { selectedLocation, token } = useAuth();
  const { showToastSuccess, showToastError } = useNotification();

  const [formData, setFormData] = useState({
    name: "",
    contactName: "test",
    phoneNo: "",
    email: "",
    fax: "",
    state: "",
    city: "",
    zipCode: "",
    accountNo: "",
    paymentMethod: "",
    address1: "",
    address2: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  // Payment method options
  const paymentMethodOptions = [
    { id: "1", name: "Cash", value: "1" },
    { id: "2", name: "Check", value: "2" },
    { id: "3", name: "Credit Card", value: "3" },
    { id: "4", name: "Bank Transfer", value: "4" },
  ];

  // US States data
  const usStates = [
    { value: "AL", name: "Alabama" },
    { value: "AK", name: "Alaska" },
    { value: "AZ", name: "Arizona" },
    { value: "AR", name: "Arkansas" },
    { value: "CA", name: "California" },
    { value: "CO", name: "Colorado" },
    { value: "CT", name: "Connecticut" },
    { value: "DE", name: "Delaware" },
    { value: "FL", name: "Florida" },
    { value: "GA", name: "Georgia" },
    { value: "HI", name: "Hawaii" },
    { value: "ID", name: "Idaho" },
    { value: "IL", name: "Illinois" },
    { value: "IN", name: "Indiana" },
    { value: "IA", name: "Iowa" },
    { value: "KS", name: "Kansas" },
    { value: "KY", name: "Kentucky" },
    { value: "LA", name: "Louisiana" },
    { value: "ME", name: "Maine" },
    { value: "MD", name: "Maryland" },
    { value: "MA", name: "Massachusetts" },
    { value: "MI", name: "Michigan" },
    { value: "MN", name: "Minnesota" },
    { value: "MS", name: "Mississippi" },
    { value: "MO", name: "Missouri" },
    { value: "MT", name: "Montana" },
    { value: "NE", name: "Nebraska" },
    { value: "NV", name: "Nevada" },
    { value: "NH", name: "New Hampshire" },
    { value: "NJ", name: "New Jersey" },
    { value: "NM", name: "New Mexico" },
    { value: "NY", name: "New York" },
    { value: "NC", name: "North Carolina" },
    { value: "ND", name: "North Dakota" },
    { value: "OH", name: "Ohio" },
    { value: "OK", name: "Oklahoma" },
    { value: "OR", name: "Oregon" },
    { value: "PA", name: "Pennsylvania" },
    { value: "RI", name: "Rhode Island" },
    { value: "SC", name: "South Carolina" },
    { value: "SD", name: "South Dakota" },
    { value: "TN", name: "Tennessee" },
    { value: "TX", name: "Texas" },
    { value: "UT", name: "Utah" },
    { value: "VT", name: "Vermont" },
    { value: "VA", name: "Virginia" },
    { value: "WA", name: "Washington" },
    { value: "WV", name: "West Virginia" },
    { value: "WI", name: "Wisconsin" },
    { value: "WY", name: "Wyoming" },
  ];

  // Major US Cities data
  const usCities = [
    { value: "New York", name: "New York, NY" },
    { value: "Los Angeles", name: "Los Angeles, CA" },
    { value: "Chicago", name: "Chicago, IL" },
    { value: "Houston", name: "Houston, TX" },
    { value: "Phoenix", name: "Phoenix, AZ" },
    { value: "Philadelphia", name: "Philadelphia, PA" },
    { value: "San Antonio", name: "San Antonio, TX" },
    { value: "San Diego", name: "San Diego, CA" },
    { value: "Dallas", name: "Dallas, TX" },
    { value: "San Jose", name: "San Jose, CA" },
    { value: "Austin", name: "Austin, TX" },
    { value: "Jacksonville", name: "Jacksonville, FL" },
    { value: "Fort Worth", name: "Fort Worth, TX" },
    { value: "Columbus", name: "Columbus, OH" },
    { value: "Charlotte", name: "Charlotte, NC" },
    { value: "San Francisco", name: "San Francisco, CA" },
    { value: "Indianapolis", name: "Indianapolis, IN" },
    { value: "Seattle", name: "Seattle, WA" },
    { value: "Denver", name: "Denver, CO" },
    { value: "Washington", name: "Washington, DC" },
    { value: "Boston", name: "Boston, MA" },
    { value: "El Paso", name: "El Paso, TX" },
    { value: "Nashville", name: "Nashville, TN" },
    { value: "Detroit", name: "Detroit, MI" },
    { value: "Oklahoma City", name: "Oklahoma City, OK" },
    { value: "Portland", name: "Portland, OR" },
    { value: "Las Vegas", name: "Las Vegas, NV" },
    { value: "Memphis", name: "Memphis, TN" },
    { value: "Louisville", name: "Louisville, KY" },
    { value: "Baltimore", name: "Baltimore, MD" },
    { value: "Milwaukee", name: "Milwaukee, WI" },
    { value: "Albuquerque", name: "Albuquerque, NM" },
    { value: "Tucson", name: "Tucson, AZ" },
    { value: "Fresno", name: "Fresno, CA" },
    { value: "Mesa", name: "Mesa, AZ" },
    { value: "Sacramento", name: "Sacramento, CA" },
    { value: "Atlanta", name: "Atlanta, GA" },
    { value: "Kansas City", name: "Kansas City, MO" },
    { value: "Colorado Springs", name: "Colorado Springs, CO" },
    { value: "Miami", name: "Miami, FL" },
    { value: "Raleigh", name: "Raleigh, NC" },
    { value: "Omaha", name: "Omaha, NE" },
    { value: "Long Beach", name: "Long Beach, CA" },
    { value: "Virginia Beach", name: "Virginia Beach, VA" },
    { value: "Oakland", name: "Oakland, CA" },
    { value: "Minneapolis", name: "Minneapolis, MN" },
    { value: "Tulsa", name: "Tulsa, OK" },
    { value: "Tampa", name: "Tampa, FL" },
    { value: "Arlington", name: "Arlington, TX" },
    { value: "New Orleans", name: "New Orleans, LA" },
  ];

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        contactName: "",
        phoneNo: "",
        email: "",
        fax: "",
        state: "",
        city: "",
        zipCode: "",
        accountNo: "",
        paymentMethod: "",
        address1: "",
        address2: "",
      });
    }
  }, [isOpen]);

  // Phone number formatting function
  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    // Limit to 11 digits
    const limitedDigits = digits.slice(0, 11);

    // Format as (XXX) XXX-XXXX or 1 (XXX) XXX-XXXX
    if (limitedDigits.length === 0) return "";
    if (limitedDigits.length <= 3) return limitedDigits;
    if (limitedDigits.length <= 6)
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
    if (limitedDigits.length <= 10)
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(
        3,
        6
      )}-${limitedDigits.slice(6)}`;
    if (limitedDigits.length === 11 && limitedDigits[0] === "1") {
      return `1 (${limitedDigits.slice(1, 4)}) ${limitedDigits.slice(
        4,
        7
      )}-${limitedDigits.slice(7)}`;
    }
    return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(
      3,
      6
    )}-${limitedDigits.slice(6, 10)}`;
  };

  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    // Format phone numbers
    if (field === "phoneNo" || field === "fax") {
      value = formatPhoneNumber(value);
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!formData.name.trim()) {
      showToastError("Vendor Name is required");
      return false;
    }
    if (!formData.phoneNo.trim()) {
      showToastError("Phone Number is required");
      return false;
    }
    // Validate email format if provided
    if (formData.email.trim() && !isValidEmail(formData.email)) {
      showToastError("Please enter a valid email address");
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
        ...formData,
        locationId: selectedLocation.id,
      };

      console.log("Creating vendor with:", apiPayload);

      const response = await addPayee(token, apiPayload);

      if (response.status === "success") {
        console.log("Vendor creation response:", response);

        // Ensure we have valid data to pass
        const vendorData = response.data || {};

        // If no ID is provided, generate one for mock data
        if (!vendorData.id) {
          vendorData.id = `vendor-${Date.now()}`;
        }

        // Ensure the vendor has a name property for dropdown display
        if (!vendorData.name && formData.name) {
          vendorData.name = formData.name;
        }

        showToastSuccess("Vendor created successfully!");
        onSuccess(vendorData);
        onClose();
      } else {
        showToastError(response.message || "Failed to create vendor");
      }
    } catch (error) {
      console.error("Error creating vendor:", error);
      showToastError("An error occurred while creating vendor");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Add New Vendor
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
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vendor Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter vendor name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isSaving}
              />
            </div>

            {/* Contact Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name
              </label>
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) =>
                  handleInputChange("contactName", e.target.value)
                }
                placeholder="Enter contact name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isSaving}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phoneNo}
                onChange={(e) => handleInputChange("phoneNo", e.target.value)}
                placeholder="Enter phone number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isSaving}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isSaving}
              />
            </div>

            {/* Fax */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fax
              </label>
              <input
                type="text"
                value={formData.fax}
                onChange={(e) => handleInputChange("fax", e.target.value)}
                placeholder="Enter fax number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isSaving}
              />
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={formData.accountNo}
                onChange={(e) => handleInputChange("accountNo", e.target.value)}
                placeholder="Enter account number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isSaving}
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <select
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isSaving}
              >
                <option value="">Select State</option>
                {usStates.map((state) => (
                  <option key={state.value} value={state.name}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <select
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isSaving}
              >
                <option value="">Select City</option>
                {usCities.map((city) => (
                  <option key={city.value} value={city.value}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Zip Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zip Code
              </label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => handleInputChange("zipCode", e.target.value)}
                placeholder="Enter zip code"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isSaving}
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) =>
                  handleInputChange("paymentMethod", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isSaving}
              >
                <option value="">Select Payment Method</option>
                {paymentMethodOptions.map((option) => (
                  <option key={option.id} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700 border-t pt-4">
              Address Information
            </h3>

            {/* Address 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 1
              </label>
              <input
                type="text"
                value={formData.address1}
                onChange={(e) => handleInputChange("address1", e.target.value)}
                placeholder="Enter address line 1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isSaving}
              />
            </div>

            {/* Address 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 2
              </label>
              <input
                type="text"
                value={formData.address2}
                onChange={(e) => handleInputChange("address2", e.target.value)}
                placeholder="Enter address line 2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isSaving}
              />
            </div>
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
    </div>
  );
};

export default AddVendorModal;
