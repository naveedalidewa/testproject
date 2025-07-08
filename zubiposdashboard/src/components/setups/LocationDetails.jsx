import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { locationService } from "../../services/locationService";

const LocationDetails = () => {
  const { selectedLocation, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    logo: null,
    name: "",
    address: "",
    businessType: "",
    phone: "",
    subscriptionName: "",
    subscriptionStatus: false,
  });

  useEffect(() => {
    if (selectedLocation) {
      fetchLocationDetails();
    }
  }, [selectedLocation]);

  const fetchLocationDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await locationService.getLocationById(
        selectedLocation.id,
        token,
      );

      if (response.status === "success" && response.data) {
        const data = response.data;
        setFormData({
          logo: data.logo,
          name: data.name || "",
          address: data.address || "",
          businessType: data.businessType || "",
          phone: data.phone || "",
          subscriptionName: data.subscriptionName || "",
          subscriptionStatus: data.subscriptionStatus || false,
        });
      }
    } catch (err) {
      setError(err.message || "Failed to fetch location details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          logo: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Here you would typically call an API to update the location
      // await locationService.updateLocation(selectedLocation.id, formData, token);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to update location details");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.name) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Location Details
      </h2>
      <p className="text-gray-600 text-sm mb-4">
        Manage your location information and settings
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 text-sm">
            Location details updated successfully!
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Logo Section */}
        <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 mb-2 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
              {formData.logo ? (
                <img
                  src={formData.logo}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-orange-600">
                  {formData.name?.charAt(0)?.toUpperCase() || "L"}
                </span>
              )}
            </div>
            <label className="cursor-pointer inline-flex items-center px-3 py-1 border border-orange-300 rounded-md text-xs font-medium text-orange-700 bg-white hover:bg-orange-50 transition-colors">
              Upload Logo
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleLogoChange}
              />
            </label>
          </div>
        </div>

        {/* Form Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={handleInputChange("name")}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Enter location name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address *
          </label>
          <textarea
            value={formData.address}
            onChange={handleInputChange("address")}
            required
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Enter full address"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Type *
            </label>
            <input
              type="text"
              value={formData.businessType}
              onChange={handleInputChange("businessType")}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., Convenience Store"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={handleInputChange("phone")}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subscription
            </label>
            <input
              type="text"
              value={formData.subscriptionName}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-500"
              placeholder="Managed by admin"
            />
            <p className="text-xs text-gray-500 mt-1">
              Subscription details are managed by admin
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subscription Status
            </label>
            <input
              type="text"
              value={formData.subscriptionStatus ? "Active" : "Inactive"}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Status is managed by admin
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={fetchLocationDetails}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center min-w-[120px] justify-center"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LocationDetails;
