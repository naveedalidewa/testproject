import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getPurchaseOrders,
  deletePurchaseOrder,
} from "../services/purchaseOrderService";
import { getVendors } from "../services/vendorService";
import PaginationControls from "./PaginationControls";
import Dropdown from "./Dropdown";
import DateRangePicker from "./DateRangePicker";
import SearchableDropdown from "./SearchableDropdown";
import CreatePurchaseOrderModal from "./CreatePurchaseOrderModal";
import { useNotification } from "../contexts/NotificationContext";
import { useAuth } from "../contexts/AuthContext";

const PurchaseOrder = ({ onCreateNew, onEditPO }) => {
  const { showError, showSuccess, showDeleteConfirm } = useNotification();
  const { selectedLocation, token } = useAuth();

  // Set default date range to current month (July 2025)
  const getCurrentMonthRange = () => {
    // Force July 2025 dates to avoid timezone issues
    const year = 2025;
    const month = 6; // July (0-indexed, so 6 = July)

    // Use explicit date strings to avoid timezone conversion issues
    const firstDay = `${year}-${String(month + 1).padStart(2, "0")}-01`; // 2025-07-01
    const lastDay = `${year}-${String(month + 1).padStart(2, "0")}-31`; // 2025-07-31

    const range = {
      from: firstDay,
      to: lastDay,
    };

    console.log("Date range being set:", range);
    return range;
  };

  const [dateRange, setDateRange] = useState(getCurrentMonthRange());

  // Debug log to check the initial date range
  console.log("Initial dateRange:", dateRange);

  const [status, setStatus] = useState("All");
  const [selectedVendor, setSelectedVendor] = useState("");
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [vendorLoading, setVendorLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totals, setTotals] = useState({ cost: "0.00", retail: "0.00" });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [deletingItems, setDeletingItems] = useState(new Set());

  // Memoize pagination values to prevent unnecessary re-renders
  const currentPage = useMemo(
    () => pagination.currentPage || 1,
    [pagination.currentPage],
  );
  const itemsPerPage = useMemo(
    () => pagination.itemsPerPage || 10,
    [pagination.itemsPerPage],
  );

  // Define memoized functions first
  const fetchVendors = useCallback(async () => {
    try {
      setVendorLoading(true);

      // Don't fetch if selectedLocation is not available yet
      if (!selectedLocation?.id) {
        console.log(
          "selectedLocation not available yet, skipping vendor fetch in PurchaseOrder",
        );
        setVendorLoading(false);
        return;
      }

      const locationId = selectedLocation.id;
      const response = await getVendors(locationId, {}, token);

      if (response.status === "success") {
        setVendors(response.data);
      } else {
        console.error("Failed to load vendors:", response.message);
      }
    } catch (err) {
      console.error("Error fetching vendors:", err);
    } finally {
      setVendorLoading(false);
    }
  }, [selectedLocation, token]);

  // Fetch vendors when selectedLocation becomes available
  useEffect(() => {
    if (selectedLocation?.id) {
      fetchVendors();
    }
  }, [selectedLocation, fetchVendors]);

  // Fetch purchase orders when filters change
  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        // Don't fetch if selectedLocation is not available yet
        if (!selectedLocation?.id) {
          console.log(
            "selectedLocation not available yet, skipping purchase orders fetch",
          );
          setLoading(false);
          return;
        }

        // Helper function to convert dates to API format (avoiding timezone issues)
        const formatDateForAPI = (dateString, isStartDate) => {
          if (!dateString) return new Date().toISOString();

          // Parse the date string manually to avoid timezone conversion
          const [year, month, day] = dateString.split("-").map(Number);

          if (isStartDate) {
            // Start date: July 1st, 2025 at 5:00 AM UTC
            return new Date(
              Date.UTC(year, month - 1, day, 5, 0, 0, 0),
            ).toISOString();
          } else {
            // End date: July 31st, 2025 at 4:59:59.999 AM UTC next day
            return new Date(
              Date.UTC(year, month - 1, day, 4, 59, 59, 999),
            ).toISOString();
          }
        };

        // Build API request body with all filters
        // Ensure we have valid pagination values
        const validCurrentPage = currentPage || 1;
        const validItemsPerPage = itemsPerPage || 10;

        console.log("Building request with pagination:", {
          currentPage: validCurrentPage,
          itemsPerPage: validItemsPerPage,
          originalCurrentPage: currentPage,
          originalItemsPerPage: itemsPerPage,
        });

        const body = {
          paymentType: 0,
          startDate: formatDateForAPI(dateRange.from, true),
          endDate: formatDateForAPI(dateRange.to, false),
          locationId: selectedLocation.id,
          page: validCurrentPage,
          limit: validItemsPerPage,
        };

        console.log(
          "Final request body for getAllPurchaseEntry:",
          JSON.stringify(body, null, 2),
        );
        const response = await getPurchaseOrders(token, body);

        if (response.status === "success") {
          setPurchaseOrders(response.data);

          // Calculate startIndex and endIndex for pagination display
          const currentPage = response.pagination.currentPage;
          const itemsPerPage = validItemsPerPage;
          const totalItems = response.pagination.totalItems;
          const startIndex = (currentPage - 1) * itemsPerPage + 1;
          const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

          setPagination((prev) => ({
            ...response.pagination,
            itemsPerPage: prev.itemsPerPage, // Preserve local itemsPerPage
            startIndex,
            endIndex,
            hasNextPage: currentPage < response.pagination.totalPages,
            hasPreviousPage: currentPage > 1,
          }));

          if (response.Total) {
            setTotals(response.Total);
          }
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError("Failed to load purchase orders");
        console.error("Error fetching purchase orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseOrders();
  }, [selectedLocation, dateRange, currentPage, itemsPerPage, token]);

  // Function to manually refresh purchase orders (for delete handler)
  const refreshPurchaseOrders = useCallback(async () => {
    if (!selectedLocation?.id) return;

    try {
      setLoading(true);
      setError(null);

      const formatDateForAPI = (dateString, isStartDate) => {
        if (!dateString) return new Date().toISOString();
        const [year, month, day] = dateString.split("-").map(Number);
        if (isStartDate) {
          return new Date(
            Date.UTC(year, month - 1, day, 5, 0, 0, 0),
          ).toISOString();
        } else {
          return new Date(
            Date.UTC(year, month - 1, day, 4, 59, 59, 999),
          ).toISOString();
        }
      };

      const validCurrentPage = currentPage || 1;
      const validItemsPerPage = itemsPerPage || 10;

      const body = {
        paymentType: 0,
        startDate: formatDateForAPI(dateRange.from, true),
        endDate: formatDateForAPI(dateRange.to, false),
        locationId: selectedLocation.id,
        page: validCurrentPage,
        limit: validItemsPerPage,
      };

      const response = await getPurchaseOrders(token, body);

      if (response.status === "success") {
        setPurchaseOrders(response.data);

        const currentPage = response.pagination.currentPage;
        const itemsPerPage = validItemsPerPage;
        const totalItems = response.pagination.totalItems;
        const startIndex = (currentPage - 1) * itemsPerPage + 1;
        const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

        setPagination((prev) => ({
          ...response.pagination,
          itemsPerPage: prev.itemsPerPage,
          startIndex,
          endIndex,
          hasNextPage: currentPage < response.pagination.totalPages,
          hasPreviousPage: currentPage > 1,
        }));

        if (response.Total) {
          setTotals(response.Total);
        }
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to load purchase orders");
      console.error("Error fetching purchase orders:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedLocation, dateRange, currentPage, itemsPerPage, token]);

  const handleDeletePO = async (purchaseOrder) => {
    showDeleteConfirm(
      "Delete Purchase Order",
      "Are you sure you want to delete this purchase order? This action cannot be undone.",
      async () => {
        try {
          // Add visual feedback - mark item as deleting
          setDeletingItems((prev) => new Set([...prev, purchaseOrder.id]));

          const response = await deletePurchaseOrder(token, purchaseOrder);
          if (response.success || response.status === "success") {
            // Keep the visual feedback for a moment, then refresh
            setTimeout(() => {
              refreshPurchaseOrders();
              setDeletingItems((prev) => {
                const newSet = new Set(prev);
                newSet.delete(purchaseOrder.id);
                return newSet;
              });
            }, 1000); // Show success state for 1 second
          } else {
            showError(
              "Delete Failed",
              response.message || "Failed to delete purchase order",
            );
          }
        } catch (err) {
          showError("Delete Error", "Failed to delete purchase order");
          console.error("Error deleting purchase order:", err);
        }
      },
    );
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: newPage,
    }));
  };

  const handleItemsPerPageChange = (newLimit) => {
    setPagination((prev) => ({
      ...prev,
      itemsPerPage: newLimit,
      currentPage: 1, // Reset to first page when changing page size
    }));
  };

  const clearFilters = () => {
    setDateRange(getCurrentMonthRange());
    setStatus("All");
    setSelectedVendor("");
    setTotals({ cost: "0.00", retail: "0.00" });
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }));
  };

  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getPaymentTypeLabel = (paymentTypeId) => {
    const paymentTypeMap = {
      1: "Cash",
      2: "EFT",
      3: "Check",
      4: "Credit Card",
    };
    return paymentTypeMap[paymentTypeId] || "Unknown";
  };

  const getStatusLabel = (status) => {
    // status is boolean: true = Close, false = Open
    if (status === true) return "Close";
    if (status === false) return "Open";
    return "Unknown";
  };

  // Client-side filtering for vendor and status
  const filteredOrders = useMemo(() => {
    let filtered = [...purchaseOrders];

    // Filter by status
    if (status !== "All") {
      filtered = filtered.filter((order) => {
        const orderStatus = getStatusLabel(order.status);
        return orderStatus === status;
      });
    }

    // Filter by vendor
    if (selectedVendor) {
      filtered = filtered.filter((order) => {
        return order.payee?.id === selectedVendor;
      });
    }

    return filtered;
  }, [purchaseOrders, status, selectedVendor]);

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold";
    if (status === true) {
      // Close
      return `${baseClasses} bg-gray-100 text-gray-800`;
    } else if (status === false) {
      // Open
      return `${baseClasses} bg-green-100 text-green-800`;
    } else {
      return `${baseClasses} bg-red-100 text-red-800`;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto">
        {/* Header with Create Button */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Purchase Orders
            </h1>
            <p className="text-gray-600">
              Manage and track all purchase orders
            </p>
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="text-black px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 flex items-center gap-2"
            style={{
              backgroundColor: "rgb(255 153 25 / var(--tw-bg-opacity))",
              "&:hover": { backgroundColor: "rgb(230, 138, 23)" },
            }}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = "rgb(230, 138, 23)")
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor =
                "rgb(255 153 25 / var(--tw-bg-opacity))")
            }
          >
            <span className="text-lg">+</span>
            Create Purchase Order
          </button>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap items-end gap-4">
            {/* Date Range */}
            <div className="w-64">
              <DateRangePicker
                label="Date Range"
                value={dateRange}
                onChange={setDateRange}
                placeholder="Select date range"
              />
            </div>

            {/* Vendor Filter */}
            <div className="w-64">
              <SearchableDropdown
                label="Vendor"
                value={selectedVendor}
                onChange={setSelectedVendor}
                options={vendors}
                placeholder="Select vendor"
                searchPlaceholder="Search vendors..."
                loading={vendorLoading}
                displayKey="name"
                valueKey="id"
              />
            </div>

            {/* Status Filter */}
            <div className="w-48">
              <Dropdown
                label="Status"
                value={status}
                onChange={setStatus}
                options={[
                  { value: "All", label: "All" },
                  { value: "Open", label: "Open" },
                  { value: "Close", label: "Close" },
                ]}
                placeholder="Select status"
              />
            </div>

            {/* Clear Filter Button */}
            <div className="pb-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200 h-9"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-center">
              <div
                className="animate-spin rounded-full h-8 w-8 border-b-2"
                style={{
                  borderColor: "rgb(255 153 25 / var(--tw-bg-opacity))",
                }}
              ></div>
              <span className="ml-3 text-gray-600">
                Loading purchase orders...
              </span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="text-red-500 text-lg mb-2">⚠️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Error</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={refreshPurchaseOrders}
                className="text-white px-4 py-2 rounded-md text-sm font-semibold"
                style={{
                  backgroundColor: "rgb(255 153 25 / var(--tw-bg-opacity))",
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Purchase Orders Grid */}
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      PO Number
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Payment Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total Order
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total Retail
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => {
                    const isDeleting = deletingItems.has(order.id);
                    return (
                      <tr
                        key={order.id}
                        className={`transition-all duration-500 ${
                          isDeleting
                            ? "bg-green-50 border-l-4 border-green-500 opacity-75"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(() => {
                            const [year, month, day] = order.date.split("-");
                            return `${month}-${day}-${year}`;
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.payee.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() =>
                              onEditPO({
                                ...order,
                                vendorId: order.payee?.id,
                                poNumber: order.invoiceNo,
                                date: order.date,
                                paymentType: getPaymentTypeLabel(
                                  order.paymentType,
                                ),
                              })
                            }
                            className="text-sm font-medium hover:underline"
                            style={{
                              color: "rgb(255 153 25 / var(--tw-bg-opacity))",
                            }}
                            onMouseEnter={(e) =>
                              (e.target.style.color = "rgb(230, 138, 23)")
                            }
                            onMouseLeave={(e) =>
                              (e.target.style.color =
                                "rgb(255 153 25 / var(--tw-bg-opacity))")
                            }
                          >
                            {order.invoiceNo || "N/A"}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getPaymentTypeLabel(order.paymentType)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(parseFloat(order.total))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(parseFloat(order.retail))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadge(order.status)}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            {isDeleting ? (
                              // Show success indicator when deleting
                              <div className="flex items-center gap-2 text-green-600">
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span className="text-sm font-medium">
                                  Deleted Successfully
                                </span>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() =>
                                    onEditPO({
                                      ...order,
                                      vendorId: order.payee?.id,
                                      poNumber: order.invoiceNo,
                                      date: order.date,
                                      paymentType: getPaymentTypeLabel(
                                        order.paymentType,
                                      ),
                                    })
                                  }
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
                                  onClick={() => handleDeletePO(order)}
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
                                <button
                                  className="text-gray-600 hover:text-gray-800 p-1 rounded"
                                  title="Attachment"
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
                                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                    />
                                  </svg>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-2">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No purchase orders found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your filters or create a new purchase order.
                </p>
              </div>
            )}

            {/* Totals Summary */}
            {filteredOrders.length > 0 && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex justify-end space-x-8">
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">
                      Total Cost:{" "}
                    </span>
                    <span className="text-green-600 font-semibold">
                      {formatCurrency(parseFloat(totals.cost))}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">
                      Total Retail:{" "}
                    </span>
                    <span className="text-blue-600 font-semibold">
                      {formatCurrency(parseFloat(totals.retail))}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <PaginationControls
              pagination={pagination}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        )}
      </div>

      {/* Create Purchase Order Modal */}
      <CreatePurchaseOrderModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={(purchaseOrderId, formData) => {
          // Close modal and navigate to create form with the new PO ID
          setCreateModalOpen(false);
          onCreateNew(purchaseOrderId, formData);
        }}
      />
    </div>
  );
};

export default PurchaseOrder;
