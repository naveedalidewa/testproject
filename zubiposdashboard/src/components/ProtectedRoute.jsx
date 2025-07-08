import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, requireLocation = false }) => {
  const { isAuthenticated, hasSelectedLocation, isLoading } = useAuth();

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireLocation && !hasSelectedLocation) {
    return <Navigate to="/locations" replace />;
  }

  return children;
};

export default ProtectedRoute;
