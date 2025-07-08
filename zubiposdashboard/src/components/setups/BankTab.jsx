import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { BASE_URL, isAPI } from "../../services/authService";

const BankTab = () => {
  const { selectedLocation, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [banks, setBanks] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [formData, setFormData] = useState({
    name: "",
    accountNumber: "",
    routingNumber: "",
    address: "",
  });

  // Dummy data for development
  const dummyBanks = [
    {
      id: "1",
      name: "Wells Fargo",
      accountNumber: "12345689",
      routingNumber: "99882282",
      address: "123 Main St, City, State",
      isActive: true,
    },
    {
      id: "2",
      name: "Chase Bank",
      accountNumber: "87654321",
      routingNumber: "11223344",
      address: "456 Oak Ave, City, State",
      isActive: true,
    },
  ];

  useEffect(() => {
    fetchBanks();
  }, [selectedLocation]);

  const fetchBanks = async () => {
    if (!selectedLocation?.id) return;

    try {
      setLoading(true);
      setError(null);

      if (!isAPI) {
        // Use dummy data
        setBanks(dummyBanks);
        setLoading(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/getAllBank`, {
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
      console.log("getAllBank", data);

      if (data.status === "success") {
        setBanks(data.data || []);
      } else {
        setError(data.message || "Failed to fetch banks");
      }
    } catch (err) {
      setError("Failed to fetch banks");
      console.error("Error fetching banks:", err);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);

      if (editingBank) {
        // Update existing bank
        if (isAPI) {
          const updatePayload = {
            name: formData.name,
            address: formData.address,
            accountNumber: formData.accountNumber,
            routingNumber: formData.routingNumber,
            bankId: editingBank.id,
            locationId: selectedLocation.id,
          };

          const response = await fetch(`${BASE_URL}/updateBank`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatePayload),
          });

          const data = await response.json();
          console.log("updateBank response:", data);

          if (data.status === "success") {
            // Update local state
            setBanks((prev) =>
              prev.map((bank) =>
                bank.id === editingBank.id ? { ...bank, ...formData } : bank,
              ),
            );
          } else {
            setError(data.message || "Failed to update bank");
            return;
          }
        } else {
          // Use dummy update for development
          setBanks((prev) =>
            prev.map((bank) =>
              bank.id === editingBank.id ? { ...bank, ...formData } : bank,
            ),
          );
        }
      } else {
        // Add new bank
        if (isAPI) {
          const addPayload = {
            name: formData.name,
            address: formData.address,
            accountNumber: formData.accountNumber,
            routingNumber: formData.routingNumber,
            locationId: selectedLocation.id,
          };

          const response = await fetch(`${BASE_URL}/addBank`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(addPayload),
          });

          const data = await response.json();
          console.log("addBank response:", data);

          if (data.status === "success") {
            // Refresh the banks list to get the new bank with proper ID
            await fetchBanks();
          } else {
            setError(data.message || "Failed to add bank");
            return;
          }
        } else {
          // Use dummy add for development
          const newBank = {
            id: Date.now().toString(),
            ...formData,
            isActive: true,
          };
          setBanks((prev) => [...prev, newBank]);
        }
      }

      setShowModal(false);
      setEditingBank(null);
      setFormData({
        name: "",
        accountNumber: "",
        routingNumber: "",
        address: "",
      });
    } catch (err) {
      setError("Failed to save bank");
      console.error("Error saving bank:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bank) => {
    setEditingBank(bank);
    setFormData({
      name: bank.name,
      accountNumber: bank.accountNumber,
      routingNumber: bank.routingNumber,
      address: bank.address || "",
    });
    setShowModal(true);
  };

  const handleDelete = (bankId) => {
    setBanks((prev) => prev.filter((bank) => bank.id !== bankId));
  };

  const openAddModal = () => {
    setEditingBank(null);
    setFormData({
      name: "",
      accountNumber: "",
      routingNumber: "",
      address: "",
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

  const getSortedBanks = () => {
    let sortedBanks = [...banks];
    if (sortConfig.key) {
      sortedBanks.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (typeof aValue === "string") {
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
    return sortedBanks;
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
            Bank Management
          </h2>
          <p className="text-gray-600 text-sm">
            Create and manage bank accounts
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
          Add New Bank
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
                    <span>Bank Name</span>
                    <SortIcon column="name" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("accountNumber")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Account Number</span>
                    <SortIcon column="accountNumber" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("routingNumber")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Routing Number</span>
                    <SortIcon column="routingNumber" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("address")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Address</span>
                    <SortIcon column="address" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getSortedBanks().map((bank) => (
                <tr key={bank.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {bank.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {bank.accountNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {bank.routingNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {bank.address || "Not specified"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(bank)}
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
                        onClick={() => handleDelete(bank.id)}
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

          {banks.length === 0 && !loading && (
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
                  d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M10.5 4L12 2l1.5 2M21 10a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1h16a1 1 0 011 1v1z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No banks
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new bank account.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Bank Modal */}
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
                  {editingBank ? "Edit Bank" : "Add New Bank"}
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
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter bank name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) =>
                      handleInputChange("accountNumber", e.target.value)
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter account number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Routing Number *
                  </label>
                  <input
                    type="text"
                    value={formData.routingNumber}
                    onChange={(e) =>
                      handleInputChange("routingNumber", e.target.value)
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter routing number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter bank address"
                  />
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
                    {editingBank ? "Update Bank" : "Add Bank"}
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

export default BankTab;
