import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import zubiposLogo from "../assets/zubipos.png";

const Header = ({ onToggleSidebar }) => {
  const { user, selectedLocation, locations, selectLocation, logout } =
    useAuth();
  const navigate = useNavigate();
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const locationDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target)
      ) {
        setIsLocationDropdownOpen(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocationChange = (location) => {
    selectLocation(location);
    setIsLocationDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="flex items-center justify-between bg-white border-b border-gray-200 px-6 h-16 shadow-sm z-50">
      <div className="flex items-center gap-4">
        <button
          className="flex flex-col gap-1 p-2 hover:bg-gray-100 rounded transition-colors duration-200"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <span className="w-5 h-0.5 bg-gray-700 transition-all duration-300"></span>
          <span className="w-5 h-0.5 bg-gray-700 transition-all duration-300"></span>
          <span className="w-5 h-0.5 bg-gray-700 transition-all duration-300"></span>
        </button>
        <img src={zubiposLogo} alt="ZubiPOS Logo" className="h-12 w-auto" />
      </div>

      <nav />

      <div className="flex items-center gap-4">
        {/* Location Dropdown */}
        {locations.length > 0 && (
          <div className="relative" ref={locationDropdownRef}>
            <button
              onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <span className="max-w-32 truncate">
                {selectedLocation ? selectedLocation.name : "Select Location"}
              </span>
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
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isLocationDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                {locations.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handleLocationChange(location)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      selectedLocation.id === location.id
                        ? "bg-orange-50 text-orange-700"
                        : "text-gray-700"
                    }`}
                  >
                    <div className="font-medium">{location.name}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {location.address}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* User Dropdown */}
        <div className="relative" ref={userDropdownRef}>
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <span
              className="w-8 h-8 text-white rounded-full flex items-center justify-center font-bold text-sm"
              style={{
                backgroundColor: "rgb(255 153 25 / var(--tw-bg-opacity))",
              }}
            >
              {getUserInitials()}
            </span>
            <span className="font-medium text-gray-800 hidden sm:block">
              {user?.name || "User"}
            </span>
            <svg
              className="w-4 h-4 text-gray-500"
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
          </button>

          {isUserDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
              <div className="px-4 py-2 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
