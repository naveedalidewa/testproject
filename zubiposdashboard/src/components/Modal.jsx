import { useEffect } from "react";

const Modal = ({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  showCancel = false,
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) => {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Icon based on type
  const getIcon = () => {
    switch (type) {
      case "error":
        return (
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <svg
              className="w-6 h-6 text-red-600"
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
          </div>
        );
      case "warning":
        return (
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full">
            <svg
              className="w-6 h-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
        );
      case "success":
        return (
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        );
      default: // info
        return (
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
    }
  };

  // Color scheme based on type
  const getColorScheme = () => {
    switch (type) {
      case "error":
        return {
          button: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
          cancelButton: "bg-gray-300 hover:bg-gray-400 text-gray-700",
        };
      case "warning":
        return {
          button: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
          cancelButton: "bg-gray-300 hover:bg-gray-400 text-gray-700",
        };
      case "success":
        return {
          button: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
          cancelButton: "bg-gray-300 hover:bg-gray-400 text-gray-700",
        };
      default: // info
        return {
          button: "hover:bg-orange-700 focus:ring-orange-500",
          cancelButton: "bg-gray-300 hover:bg-gray-400 text-gray-700",
        };
    }
  };

  const colorScheme = getColorScheme();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Content */}
          <div className="px-6 py-6">
            {/* Icon */}
            <div className="mb-4">{getIcon()}</div>

            {/* Title */}
            {title && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 text-center">
                  {title}
                </h3>
              </div>
            )}

            {/* Message */}
            <div className="mb-6">
              <div className="text-sm text-gray-600 text-center whitespace-pre-line">
                {message}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-center">
              {showCancel && (
                <button
                  onClick={handleCancel}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ${colorScheme.cancelButton}`}
                >
                  {cancelText}
                </button>
              )}
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${type === "info" ? "hover:bg-orange-700 focus:ring-orange-500" : colorScheme.button}`}
                style={
                  type === "info"
                    ? {
                        backgroundColor:
                          "rgb(255 153 25 / var(--tw-bg-opacity))",
                      }
                    : {}
                }
                autoFocus
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
