import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { locationService } from "../services/locationService";
import zubiposLogo from "../assets/zubipos.png";

const LocationSelector = () => {
  const { user, token, locations, setLocations, selectLocation, logout } =
    useAuth();

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLocations = async () => {
      if (locations.length === 0) {
        setIsLoading(true);
        try {
          const response = await locationService.getLocations(token);

          if (response.status === "success") {
            setLocations(response.data);

            // Auto-select if only one location
            if (response.data.length === 1) {
              selectLocation(response.data[0]);
              navigate("/dashboard");
              return;
            }
          } else {
            setError(response.message || "Failed to fetch locations");
          }
        } catch (err) {
          setError(err.message || "An error occurred while fetching locations");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchLocations();
  }, []); // Removed dependencies that could cause loops

  const handleLocationSelect = (location) => {
    selectLocation(location);
    navigate("/dashboard");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <img className="h-16 w-auto" src={zubiposLogo} alt="ZubiPOS" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome, {user?.name || "User"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please select a location to continue
          </p>
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {locations.map((location) => (
            <div
              key={location.id}
              onClick={() => handleLocationSelect(location)}
              className="cursor-pointer border border-gray-300 rounded-lg p-4 hover:border-orange-500 hover:bg-orange-50 transition-colors duration-200"
            >
              <h3 className="font-semibold text-gray-900">{location.name}</h3>
              <p className="text-sm text-gray-600">{location.address}</p>
              <p className="text-sm text-gray-500">{location.businessType}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationSelector;
