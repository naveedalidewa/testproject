const PaginationControls = ({
  pagination,
  onPageChange,
  onItemsPerPageChange,
}) => {
  if (!pagination || pagination.totalItems === 0) return null;

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-700">
          Showing {pagination.startIndex} to {pagination.endIndex} of{" "}
          {pagination.totalItems} results
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Items per page:</label>
          <select
            value={pagination.itemsPerPage}
            onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1"
            onFocus={(e) =>
              (e.target.style.boxShadow = "0 0 0 1px rgba(255, 153, 25, 0.5)")
            }
            onBlur={(e) => (e.target.style.boxShadow = "none")}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(pagination.currentPage - 1)}
          disabled={!pagination.hasPreviousPage}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-200 ${
            pagination.hasPreviousPage
              ? "text-gray-700 hover:bg-gray-100"
              : "text-gray-400 cursor-not-allowed"
          }`}
        >
          Previous
        </button>

        <div className="flex items-center gap-1">
          {Array.from(
            { length: Math.min(pagination.totalPages, 5) },
            (_, i) => {
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.currentPage <= 3) {
                pageNum = i + 1;
              } else if (pagination.currentPage >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-200 ${
                    pageNum === pagination.currentPage
                      ? "text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  style={
                    pageNum === pagination.currentPage
                      ? {
                          backgroundColor:
                            "rgb(255 153 25 / var(--tw-bg-opacity))",
                        }
                      : {}
                  }
                >
                  {pageNum}
                </button>
              );
            },
          )}
        </div>

        <button
          onClick={() => onPageChange(pagination.currentPage + 1)}
          disabled={!pagination.hasNextPage}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-200 ${
            pagination.hasNextPage
              ? "text-gray-700 hover:bg-gray-100"
              : "text-gray-400 cursor-not-allowed"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;
