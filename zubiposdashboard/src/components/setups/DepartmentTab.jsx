import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import TaxDropdown from "../TaxDropdown";
import AgeDropdown from "../AgeDropdown";
import { BASE_URL, isAPI } from "../../services/authService";
import { getMinAge } from "../../services/ageService";
import { uploadMedia } from "../../services/mediaService";

const DepartmentTab = () => {
  const { selectedLocation, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [ageOptions, setAgeOptions] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [formData, setFormData] = useState({
    name: "",
    taxId: "",
    minAgeId: "",
    ebt: false,
    image: null,
  });

  // Dummy data for development
  const dummyDepartments = [
    {
      departmentId: "1",
      name: "Tobacco",
      taxRate: "8.25",
      minAge: true,
      minAgeValue: "21",
      ebt: false,
      image: null,
      isActive: true,
    },
    {
      departmentId: "2",
      name: "BEVERAGES",
      taxRate: null,
      minAge: false,
      minAgeValue: null,
      ebt: false,
      image:
        "https://pos-empire-bucket.s3.eu-north-1.amazonaws.com/5/30/2025127868/BEVERAGES.jpg",
      isActive: true,
    },
    {
      departmentId: "3",
      name: "GROCERY",
      taxRate: "5.50",
      minAge: false,
      minAgeValue: null,
      ebt: true,
      image: null,
      isActive: true,
    },
  ];

  useEffect(() => {
    fetchDepartments();
    fetchAgeOptions();
  }, [selectedLocation]);

  const fetchAgeOptions = async () => {
    if (!selectedLocation?.id) return;

    try {
      const response = await getMinAge(token, {
        locationId: selectedLocation.id,
      });

      if (response.status === "success") {
        setAgeOptions(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching age options:", error);
    }
  };

  const getAgeValueFromId = (minAgeId) => {
    if (!minAgeId) return "No Restriction";

    const ageOption = ageOptions.find((option) => option.id === minAgeId);
    if (ageOption) {
      return ageOption.minAge === "no restriction"
        ? "No Restriction"
        : `${ageOption.minAge}+ years`;
    }

    return "No Restriction";
  };

  const fetchDepartments = async () => {
    if (!selectedLocation?.id) return;

    try {
      setLoading(true);
      setError(null);

      if (!isAPI) {
        // Use dummy data
        setDepartments(dummyDepartments);
        setLoading(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/getAllDepartment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          locationId: selectedLocation.id,
        }),
      });

      const data = await response.json();
      console.log("getAllDepartment", data);

      if (data.status === "success") {
        // Process the data to extract taxId, minAgeId and other values from departmentLocation
        const processedData = (data.data || []).map((dept) => {
          // Extract taxId and minAgeId from departmentLocation array if it exists
          const locationData = dept.departmentLocation?.[0] || {};

          return {
            ...dept,
            taxId: locationData.taxId || dept.taxId,
            minAgeId: locationData.minAgeId || dept.minAgeId,
            ebt: locationData.ebt !== undefined ? locationData.ebt : dept.ebt,
            departmentLocationId: locationData.departmentLocationId,
            minAgeValue: dept.minAge
              ? dept.getMinAge?.minAge || dept.minAgeValue
              : null,
          };
        });
        setDepartments(processedData);
      } else {
        setError(data.message || "Failed to fetch departments");
      }
    } catch (err) {
      setError("Failed to fetch departments");
      console.error("Error fetching departments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        setUploading(true);
        const uploadResponse = await uploadMedia(file, token);

        if (
          uploadResponse.status === "successs" &&
          uploadResponse.data?.[0]?.uploadedLink
        ) {
          setFormData((prev) => ({
            ...prev,
            image: uploadResponse.data[0].uploadedLink,
          }));
        } else {
          setError("Failed to upload image");
        }
      } catch (err) {
        console.error("Error uploading image:", err);
        setError("Failed to upload image");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);

      if (editingDepartment) {
        // Update existing department
        if (isAPI) {
          const updatePayload = {
            date: new Date().toISOString(),
            departmentId: editingDepartment.departmentId,
            name: formData.name,
            image: formData.image || "",
            departmentLocation: [
              {
                locationId: selectedLocation.id,
                taxId: formData.taxId || null,
                minAgeId: formData.minAgeId || null,
                ebt: formData.ebt,
                departmentLocationId:
                  editingDepartment.departmentLocationId ||
                  editingDepartment.departmentId,
              },
            ],
          };

          const response = await fetch(`${BASE_URL}/updateDepartment`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatePayload),
          });

          const data = await response.json();
          console.log("updateDepartment response:", data);

          if (data.status === "success") {
            // Update local state
            setDepartments((prev) =>
              prev.map((dept) =>
                dept.departmentId === editingDepartment.departmentId
                  ? { ...dept, ...formData }
                  : dept,
              ),
            );
          } else {
            setError(data.message || "Failed to update department");
            return;
          }
        } else {
          // Use dummy update for development
          setDepartments((prev) =>
            prev.map((dept) =>
              dept.departmentId === editingDepartment.departmentId
                ? { ...dept, ...formData }
                : dept,
            ),
          );
        }
      } else {
        // Add new department
        if (isAPI) {
          const addPayload = {
            name: formData.name,
            image: formData.image || "",
            departmentLocation: [
              {
                locationId: selectedLocation.id,
                taxId: formData.taxId || null,
                minAgeId: formData.minAgeId || null,
                ebt: formData.ebt,
              },
            ],
          };

          const response = await fetch(`${BASE_URL}/addDepartment`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(addPayload),
          });

          const data = await response.json();
          console.log("addDepartment response:", data);

          if (data.status === "success") {
            // Refresh the departments list to get the new department with proper ID
            await fetchDepartments();
          } else {
            setError(data.message || "Failed to add department");
            return;
          }
        } else {
          // Use dummy add for development
          const newDepartment = {
            departmentId: Date.now().toString(),
            ...formData,
            isActive: true,
          };
          setDepartments((prev) => [...prev, newDepartment]);
        }
      }

      setShowModal(false);
      setEditingDepartment(null);
      setFormData({
        name: "",
        taxId: "",
        minAgeId: "",
        ebt: false,
        image: null,
      });
    } catch (err) {
      setError("Failed to save department");
      console.error("Error saving department:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      taxId: department.taxId || "",
      minAgeId: department.minAgeId || "",
      ebt: department.ebt || false,
      image: department.image,
    });
    setShowModal(true);
  };

  const handleDelete = (departmentId) => {
    setDepartments((prev) =>
      prev.filter((dept) => dept.departmentId !== departmentId),
    );
  };

  const openAddModal = () => {
    setEditingDepartment(null);
    setFormData({
      name: "",
      taxId: "",
      minAgeId: "",
      ebt: false,
      image: null,
    });
    setShowModal(true);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortedDepartments = () => {
    let sortedDepartments = [...departments];
    if (sortConfig.key) {
      sortedDepartments.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle special cases for different columns
        if (sortConfig.key === "taxRate") {
          aValue = aValue ? parseFloat(aValue) : 0;
          bValue = bValue ? parseFloat(bValue) : 0;
        } else if (sortConfig.key === "minAgeValue") {
          aValue = aValue ? parseInt(aValue) : 0;
          bValue = bValue ? parseInt(bValue) : 0;
        } else if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortedDepartments;
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) {
      return (
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }
    return sortConfig.direction === "asc" ? (
      <svg
        className="w-4 h-4 text-orange-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        className="w-4 h-4 text-orange-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Department Management
          </h2>
          <p className="text-gray-600 text-sm">
            Create and manage product departments
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add New Department
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Name</span>
                    <SortIcon column="name" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("taxRate")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Tax Rate</span>
                    <SortIcon column="taxRate" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("minAgeValue")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Age Restriction</span>
                    <SortIcon column="minAgeValue" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("ebt")}
                >
                  <div className="flex items-center space-x-1">
                    <span>EBT Eligible</span>
                    <SortIcon column="ebt" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image Preview
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getSortedDepartments().map((department) => (
                <tr key={department.departmentId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {department.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {department.taxRate ? `${department.taxRate}%` : "No Tax"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getAgeValueFromId(department.minAgeId)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        department.ebt
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {department.ebt ? "EBT Eligible" : "Not Eligible"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {department.image ? (
                      <img
                        src={department.image}
                        alt={department.name}
                        className="w-10 h-10 rounded-md object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(department)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded"
                        title="Edit"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(department.departmentId)}
                        className="text-red-600 hover:text-red-800 p-1 rounded"
                        title="Delete"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {departments.length === 0 && !loading && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No departments
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new department.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Department Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowModal(false)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingDepartment ? "Edit Department" : "Add New Department"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
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

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter department name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax
                  </label>
                  <TaxDropdown
                    value={formData.taxId}
                    onChange={(value) => handleInputChange("taxId", value)}
                    placeholder="Select tax rate"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age Restriction
                  </label>
                  <AgeDropdown
                    value={formData.minAgeId}
                    onChange={(value) => handleInputChange("minAgeId", value)}
                    placeholder="Select age restriction"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.ebt}
                      onChange={(e) =>
                        handleInputChange("ebt", e.target.checked)
                      }
                      className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      EBT Eligible
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Image
                  </label>
                  <div className="flex items-center space-x-4">
                    {formData.image && (
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-16 h-16 rounded-md object-cover"
                      />
                    )}
                    <label
                      className={`cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 ${uploading ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      {uploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        "Upload Image"
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 disabled:opacity-50 flex items-center"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : null}
                    {editingDepartment ? "Update Department" : "Add Department"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentTab;
