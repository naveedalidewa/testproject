import React from "react";

const LoadingOverlay = ({
  isVisible,
  message = "Processing...",
  subMessage = "",
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />

      {/* Loading Content */}
      <div className="relative bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center">
          {/* Spinner */}
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin">
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-orange-500 rounded-full animate-spin"></div>
            </div>
          </div>

          {/* Main Message */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
            {message}
          </h3>

          {/* Sub Message */}
          {subMessage && (
            <p className="text-sm text-gray-600 text-center mb-4">
              {subMessage}
            </p>
          )}

          {/* Progress Animation */}
          <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full animate-pulse"></div>
          </div>

          {/* Additional Info */}
          <p className="text-xs text-gray-500 mt-4 text-center">
            Please do not close this window
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
