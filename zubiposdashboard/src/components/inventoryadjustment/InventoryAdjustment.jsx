import { useState, useEffect } from "react";
import { useNotification } from "../../contexts/NotificationContext";
import DataGrid from "../DataGrid";
import PaginationControls from "../PaginationControls";
import { inventoryAdjustmentService } from "../../services/inventoryAdjustmentService";

const InventoryAdjustment = () => {
  const { showError, showSuccess, showDeleteConfirm } = useNotification();
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    reason: "",
    startDate: "",
    endDate: "",
    sortBy: "date",
    sortDirection: "desc",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // New adjustment state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAdjustment, setNewAdjustment] = useState({
    itemId: "",
    itemName: "",
    currentQuantity: 0,
    adjustedQuantity: 0,
    reason: "",
    notes: "",
  });

  // Load adjustments
  const loadAdjustments = async () => {
    try {
      setLoading(true);
      const response = await inventoryAdjustmentService.getAdjustments(filters);
      if (response.success) {
        setAdjustments(response.data);
        setTotalItems(response.total || response.data.length);
      } else {
        setError("Failed to load inventory adjustments");
      }
    } catch (err) {
      setError("Error loading adjustments: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdjustments();
    setCurrentPage(1);
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  // Handle adding new adjustment
  const handleAddAdjustment = async () => {
    try {
      const response =
        await inventoryAdjustmentService.createAdjustment(newAdjustment);
      if (response.success) {
        showSuccess("Success", "Inventory adjustment created successfully");
        setShowAddForm(false);
        setNewAdjustment({
          itemId: "",
          itemName: "",
          currentQuantity: 0,
          adjustedQuantity: 0,
          reason: "",
          notes: "",
        });
        loadAdjustments();
      } else {
        showError("Error", "Failed to create adjustment");
      }
    } catch (err) {
      showError("Error", `Error creating adjustment: ${err.message}`);
    }
  };

  // Handle delete adjustment
  const handleDeleteAdjustment = async (adjustmentId) => {
    showDeleteConfirm(
      "Delete Adjustment",
      "Are you sure you want to delete this adjustment? This action cannot be undone.",
      async () => {
        try {
          const response =
            await inventoryAdjustmentService.deleteAdjustment(adjustmentId);
          if (response.success) {
            showSuccess("Success", "Adjustment deleted successfully");
            loadAdjustments();
          } else {
            showError("Error", "Failed to delete adjustment");
          }
        } catch (err) {
          showError("Error", `Error deleting adjustment: ${err.message}`);
        }
      },
    );
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      search: "",
      reason: "",
      startDate: "",
      endDate: "",
      sortBy: "date",
      sortDirection: "desc",
    });
    setCurrentPage(1);
  };

  // Calculate adjusted quantity change
  const getAdjustmentDifference = (current, adjusted) => {
    const diff = adjusted - current;
    return diff > 0 ? `+${diff}` : diff.toString();
  };

  // Pagination
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAdjustments = adjustments.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Icons
  const PlusIcon = () => (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 4v16m8-8H4"
      />
    </svg>
  );

  const SearchIcon = () => (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );

  const CloseIcon = () => (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading inventory adjustments...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Inventory Adjustment
          </h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <PlusIcon />
            <span className="ml-2">New Adjustment</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search items..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={filters.reason}
              onChange={(e) => handleFilterChange("reason", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All Reasons</option>
              <option value="damaged">Damaged</option>
              <option value="expired">Expired</option>
              <option value="theft">Theft</option>
              <option value="count-error">Count Error</option>
              <option value="received">Received</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Start Date"
            />
          </div>
          <div>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="End Date"
            />
          </div>
          <div>
            <button
              onClick={clearFilters}
              className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Add Adjustment Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                New Inventory Adjustment
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item ID/UPC
                </label>
                <input
                  type="text"
                  value={newAdjustment.itemId}
                  onChange={(e) =>
                    setNewAdjustment((prev) => ({
                      ...prev,
                      itemId: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter item ID or UPC"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  value={newAdjustment.itemName}
                  onChange={(e) =>
                    setNewAdjustment((prev) => ({
                      ...prev,
                      itemName: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Item name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Quantity
                  </label>
                  <input
                    type="number"
                    value={newAdjustment.currentQuantity}
                    onChange={(e) =>
                      setNewAdjustment((prev) => ({
                        ...prev,
                        currentQuantity: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Quantity
                  </label>
                  <input
                    type="number"
                    value={newAdjustment.adjustedQuantity}
                    onChange={(e) =>
                      setNewAdjustment((prev) => ({
                        ...prev,
                        adjustedQuantity: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <select
                  value={newAdjustment.reason}
                  onChange={(e) =>
                    setNewAdjustment((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select reason</option>
                  <option value="damaged">Damaged</option>
                  <option value="expired">Expired</option>
                  <option value="theft">Theft</option>
                  <option value="count-error">Count Error</option>
                  <option value="received">Received</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newAdjustment.notes}
                  onChange={(e) =>
                    setNewAdjustment((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Optional notes..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAdjustment}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Save Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content with DataGrid */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <DataGrid
            data={paginatedAdjustments.map((adjustment) => ({
              id: adjustment.id,
              date: new Date(adjustment.date).toLocaleDateString(),
              itemId: adjustment.itemId,
              itemName: adjustment.itemName,
              currentQty: adjustment.currentQuantity,
              adjustedQty: adjustment.adjustedQuantity,
              difference: getAdjustmentDifference(
                adjustment.currentQuantity,
                adjustment.adjustedQuantity,
              ),
              reason: adjustment.reason,
              notes: adjustment.notes || "",
              user: adjustment.user || "System",
            }))}
            columns={[
              { key: "date", label: "Date", width: 120, type: "text" },
              { key: "itemId", label: "Item ID", width: 120, type: "text" },
              {
                key: "itemName",
                label: "Item Name",
                width: 200,
                type: "text",
              },
              {
                key: "currentQty",
                label: "Current Qty",
                width: 100,
                type: "number",
              },
              {
                key: "adjustedQty",
                label: "New Qty",
                width: 100,
                type: "number",
              },
              {
                key: "difference",
                label: "Difference",
                width: 100,
                type: "text",
              },
              { key: "reason", label: "Reason", width: 120, type: "text" },
              { key: "notes", label: "Notes", width: 150, type: "text" },
              { key: "user", label: "User", width: 100, type: "text" },
            ]}
            onDataChange={(updatedData) => {
              console.log("Adjustments data updated:", updatedData);
            }}
            onAddRow={() => setShowAddForm(true)}
            onRemoveRow={(index) => {
              const adjustment = paginatedAdjustments[index];
              if (adjustment) {
                handleDeleteAdjustment(adjustment.id);
              }
            }}
            onPageChange={(page) => setCurrentPage(page)}
            onItemsPerPageChange={(itemsPerPage) =>
              setItemsPerPage(itemsPerPage)
            }
            externalPagination={{
              currentPage,
              totalPages,
              totalItems,
              itemsPerPage,
              hasNextPage: currentPage < totalPages,
              hasPreviousPage: currentPage > 1,
              startIndex: Math.min(startIndex + 1, totalItems),
              endIndex: Math.min(
                startIndex + paginatedAdjustments.length,
                totalItems,
              ),
            }}
            readOnly={false}
          />
        </div>
      </div>
    </div>
  );
};

export default InventoryAdjustment;
