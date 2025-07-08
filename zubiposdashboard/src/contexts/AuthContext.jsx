import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Start with true for initial load

  // Check for persisted auth state on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("zubipos_user");
    const savedToken = localStorage.getItem("zubipos_token");
    const savedLocation = localStorage.getItem("zubipos_location");
    const savedLocations = localStorage.getItem("zubipos_locations");

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);

      if (savedLocation) {
        setSelectedLocation(JSON.parse(savedLocation));
      }

      if (savedLocations) {
        setLocations(JSON.parse(savedLocations));
      }
    }

    setIsLoading(false);
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);

    // Persist to localStorage
    localStorage.setItem("zubipos_user", JSON.stringify(userData));
    localStorage.setItem("zubipos_token", authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setSelectedLocation(null);
    setLocations([]);

    // Clear localStorage
    localStorage.removeItem("zubipos_user");
    localStorage.removeItem("zubipos_token");
    localStorage.removeItem("zubipos_location");
    localStorage.removeItem("zubipos_locations");
  };

  const selectLocation = (location) => {
    setSelectedLocation(location);
    // Persist selected location
    localStorage.setItem("zubipos_location", JSON.stringify(location));
  };

  const updateLocations = (locationsList) => {
    setLocations(locationsList);
    // Persist locations list
    localStorage.setItem("zubipos_locations", JSON.stringify(locationsList));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        selectedLocation,
        locations,
        isLoading,
        setLocations: updateLocations,
        setIsLoading,
        login,
        logout,
        selectLocation,
        isAuthenticated: !!token,
        hasSelectedLocation: !!selectedLocation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
