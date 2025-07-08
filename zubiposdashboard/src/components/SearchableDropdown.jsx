import { useState, useRef, useEffect } from "react";

const SearchableDropdown = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  className = "",
  loading = false,
  onSearch = null,
  displayKey = "name",
  valueKey = "id",
  showLabel = true,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState("bottom");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setFocusedIndex(-1);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Filter options based on search term
  const filteredOptions = options.filter(
    (option) =>
      option[displayKey] &&
      option[displayKey].toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Debug logging
  useEffect(() => {
    if (label === "Vendor") {
      console.log("SearchableDropdown vendor options:", options);
      console.log(
        "SearchableDropdown vendor filtered options:",
        filteredOptions,
      );
    }
  }, [options, filteredOptions, label]);

  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    switch (event.key) {
      case "Enter":
        event.preventDefault();
        if (isOpen && focusedIndex >= 0 && filteredOptions[focusedIndex]) {
          handleSelect(filteredOptions[focusedIndex]);
        } else if (!isOpen) {
          setIsOpen(true);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setFocusedIndex(-1);
        setSearchTerm("");
        break;
      case "ArrowDown":
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0,
          );
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (isOpen) {
          setFocusedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1,
          );
        }
        break;
      default:
        break;
    }
  };

  const handleSelect = (option) => {
    onChange(option[valueKey]);
    setIsOpen(false);
    setFocusedIndex(-1);
    setSearchTerm("");
  };

  const calculateDropdownPosition = () => {
    if (!dropdownRef.current) return "bottom";

    const rect = dropdownRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 256; // max-h-64 = 16rem = 256px
    const spaceBelow = viewportHeight - rect.bottom - 10; // Add padding
    const spaceAbove = rect.top - 10; // Add padding

    // If there's not enough space below but more space above, position on top
    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      return "top";
    }

    // Default to bottom
    return "bottom";
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setFocusedIndex(-1);
      if (!isOpen) {
        setSearchTerm("");
        // Calculate position when opening
        setTimeout(() => {
          setDropdownPosition(calculateDropdownPosition());
        }, 0);
      }
    }
  };

  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    setFocusedIndex(-1);

    // Call external search handler if provided
    if (onSearch) {
      onSearch(newSearchTerm);
    }
  };

  const getDisplayValue = () => {
    const selectedOption = options.find((opt) => opt[valueKey] === value);
    return selectedOption ? selectedOption[displayKey] : placeholder;
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
  };

  return (
    <div
      className={`${showLabel ? "space-y-2" : ""} ${className}`}
      ref={dropdownRef}
    >
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Main dropdown container */}
        <div
          className={`relative border border-gray-300 rounded-md ${
            disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"
          }`}
          style={{
            "--tw-ring-color": "rgb(255 153 25 / var(--tw-bg-opacity))",
            "--tw-ring-offset-color": "white",
          }}
        >
          {/* Main dropdown button */}
          <button
            type="button"
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-controls={`searchable-dropdown-list-${label}`}
            className={`flex-1 flex items-center justify-between px-3 py-2 text-sm h-9 bg-transparent focus:outline-none ${
              disabled ? "cursor-not-allowed text-gray-500" : ""
            }`}
            onClick={toggleDropdown}
            onKeyDown={handleKeyDown}
            disabled={disabled}
          >
            <span
              style={{ pointerEvents: "none" }}
              className="line-clamp-1 text-left"
            >
              {getDisplayValue()}
            </span>
            <div className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`h-4 w-4 opacity-50 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </button>

          {/* Clear button positioned absolutely - NOT nested inside main button */}
          {value && (
            <button
              type="button"
              onClick={clearSelection}
              className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 z-10"
              title="Clear selection"
            >
              <svg
                className="w-3 h-3"
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
          )}
        </div>

        {/* Dropdown Menu */}
        {isOpen && !disabled && (
          <div
            className={`absolute z-[999] w-full bg-white border border-gray-200 rounded-md shadow-2xl max-h-64 overflow-hidden ${
              dropdownPosition === "top" ? "bottom-full mb-1" : "top-full mt-1"
            }`}
          >
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1"
                style={{
                  "--tw-ring-color": "rgb(255 153 25 / var(--tw-bg-opacity))",
                }}
                onFocus={(e) =>
                  (e.target.style.boxShadow =
                    "0 0 0 1px rgba(255, 153, 25, 0.5)")
                }
                onBlur={(e) => (e.target.style.boxShadow = "none")}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Options List */}
            <div className="max-h-48 overflow-y-auto">
              {loading ? (
                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                  Loading...
                </div>
              ) : filteredOptions.length > 0 ? (
                <ul
                  ref={listRef}
                  id={`searchable-dropdown-list-${label}`}
                  role="listbox"
                  className="py-1"
                >
                  {filteredOptions.map((option, index) => (
                    <li
                      key={option[valueKey] || `option-${index}`}
                      role="option"
                      aria-selected={value === option[valueKey]}
                      className={`px-3 py-2 text-sm cursor-pointer transition-colors duration-150 ${
                        value === option[valueKey]
                          ? "text-white"
                          : "text-gray-900 hover:bg-gray-100"
                      } ${index === focusedIndex ? "bg-gray-100" : ""}`}
                      style={
                        value === option[valueKey]
                          ? {
                              backgroundColor:
                                "rgb(255 153 25 / var(--tw-bg-opacity))",
                            }
                          : index === focusedIndex
                            ? {
                                backgroundColor: "rgb(243, 244, 246)",
                              }
                            : {}
                      }
                      onClick={() => handleSelect(option)}
                      onMouseEnter={() => setFocusedIndex(index)}
                    >
                      <div className="font-medium">{option[displayKey]}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                  No vendors found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchableDropdown;
