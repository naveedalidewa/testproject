import { createContext, useContext, useState } from "react";
import Modal from "../components/Modal";

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  const [toasts, setToasts] = useState([]);

  const showNotification = (options) => {
    setNotification(options);
  };

  const hideNotification = () => {
    setNotification(null);
  };

  // Convenience methods for different types of notifications
  const showError = (title, message, options = {}) => {
    showNotification({
      type: "error",
      title,
      message,
      ...options,
    });
  };

  const showWarning = (title, message, options = {}) => {
    showNotification({
      type: "warning",
      title,
      message,
      ...options,
    });
  };

  const showInfo = (title, message, options = {}) => {
    showNotification({
      type: "info",
      title,
      message,
      ...options,
    });
  };

  const showSuccess = (title, message, options = {}) => {
    showNotification({
      type: "success",
      title,
      message,
      ...options,
    });
  };

  const showConfirm = (title, message, onConfirm, options = {}) => {
    showNotification({
      type: "warning",
      title,
      message,
      showCancel: true,
      confirmText: "Confirm",
      cancelText: "Cancel",
      onConfirm: () => {
        onConfirm();
        hideNotification();
      },
      onCancel: hideNotification,
      ...options,
    });
  };

  // Yes/No confirmation
  const showYesNo = (title, message, onYes, onNo = null, options = {}) => {
    showNotification({
      type: "warning",
      title,
      message,
      showCancel: true,
      confirmText: "Yes",
      cancelText: "No",
      onConfirm: () => {
        onYes();
        hideNotification();
      },
      onCancel: () => {
        if (onNo) onNo();
        hideNotification();
      },
      ...options,
    });
  };

  // OK/Cancel confirmation
  const showOkCancel = (
    title,
    message,
    onOk,
    onCancel = null,
    options = {},
  ) => {
    showNotification({
      type: "info",
      title,
      message,
      showCancel: true,
      confirmText: "OK",
      cancelText: "Cancel",
      onConfirm: () => {
        onOk();
        hideNotification();
      },
      onCancel: () => {
        if (onCancel) onCancel();
        hideNotification();
      },
      ...options,
    });
  };

  // Delete confirmation (red theme)
  const showDeleteConfirm = (title, message, onDelete, options = {}) => {
    showNotification({
      type: "error",
      title,
      message,
      showCancel: true,
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: () => {
        onDelete();
        hideNotification();
      },
      onCancel: hideNotification,
      ...options,
    });
  };

  // Toast notification functions
  const addToast = (type, message, duration = 3000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, type, message, duration };

    setToasts((prev) => [...prev, newToast]);

    // Auto-remove toast after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const showToastSuccess = (message, duration = 3000) => {
    addToast("success", message, duration);
  };

  const showToastError = (message, duration = 5000) => {
    addToast("error", message, duration);
  };

  const showToastInfo = (message, duration = 3000) => {
    addToast("info", message, duration);
  };

  const value = {
    showNotification,
    hideNotification,
    showError,
    showWarning,
    showInfo,
    showSuccess,
    showConfirm,
    showYesNo,
    showOkCancel,
    showDeleteConfirm,
    // Toast functions
    showToastSuccess,
    showToastError,
    showToastInfo,
    removeToast,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {notification && (
        <Modal
          isOpen={true}
          onClose={hideNotification}
          title={notification.title}
          message={notification.message}
          type={notification.type || "info"}
          showCancel={notification.showCancel || false}
          confirmText={notification.confirmText || "OK"}
          cancelText={notification.cancelText || "Cancel"}
          onConfirm={notification.onConfirm || hideNotification}
          onCancel={notification.onCancel || hideNotification}
        />
      )}

      {/* Toast Container */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`px-4 py-3 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 ease-in-out ${
                toast.type === "success"
                  ? "bg-green-500 text-white"
                  : toast.type === "error"
                    ? "bg-red-500 text-white"
                    : "bg-blue-500 text-white"
              }`}
              style={{
                animation: "slideInRight 0.3s ease-out",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {toast.type === "success" && (
                    <svg
                      className="w-5 h-5 mr-2"
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
                  )}
                  {toast.type === "error" && (
                    <svg
                      className="w-5 h-5 mr-2"
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
                  )}
                  {toast.type === "info" && (
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01"
                      />
                    </svg>
                  )}
                  <span className="text-sm font-medium">{toast.message}</span>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="ml-2 text-white hover:text-gray-200"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast Animation Styles */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </NotificationContext.Provider>
  );
};
