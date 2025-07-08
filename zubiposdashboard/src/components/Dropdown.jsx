import { useState, useRef, useEffect } from "react";

const Dropdown = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  className = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState("bottom");
  const dropdownRef = useRef(null);
  const listRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        if (isOpen && focusedIndex >= 0) {
          handleSelect(options[focusedIndex]);
        } else {
          setIsOpen(!isOpen);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
      case "ArrowDown":
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (isOpen) {
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
        }
        break;
      default:
        break;
    }
  };

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const calculateDropdownPosition = () => {
    if (!dropdownRef.current) return "bottom";

    const rect = dropdownRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 240; // max-h-60 = 15rem = 240px
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

      // Calculate position when opening
      if (!isOpen) {
        setTimeout(() => {
          setDropdownPosition(calculateDropdownPosition());
        }, 0);
      }
    }
  };

  const getDisplayValue = () => {
    const selectedOption = options.find((opt) => opt.value === value);
    return selectedOption ? selectedOption.label : placeholder;
  };

  return (
    <div className={`space-y-2 ${className}`} ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      <div className="relative">
        <button
          type="button"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={`dropdown-list-${label}`}
          className={`flex w-full items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 h-9 ${
            disabled
              ? "bg-gray-100 cursor-not-allowed opacity-50 text-gray-500"
              : "bg-white"
          }`}
          style={{
            "--tw-ring-color": "rgb(255 153 25 / var(--tw-bg-opacity))",
            "--tw-ring-offset-color": "white",
          }}
          onFocus={(e) =>
            (e.target.style.boxShadow =
              "0 0 0 2px white, 0 0 0 4px rgba(255, 153, 25, 0.2)")
          }
          onBlur={(e) => {
            if (!isOpen) {
              e.target.style.boxShadow = "none";
            }
          }}
          onClick={toggleDropdown}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        >
          <span style={{ pointerEvents: "none" }} className="line-clamp-1">
            {getDisplayValue()}
          </span>
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
        </button>

        {/* Dropdown Menu */}
        {isOpen && !disabled && (
          <div
            className={`absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto ${
              dropdownPosition === "top" ? "bottom-full mb-1" : "top-full mt-1"
            }`}
          >
            <ul
              ref={listRef}
              id={`dropdown-list-${label}`}
              role="listbox"
              className="py-1"
            >
              {options.map((option, index) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={value === option.value}
                  className={`px-3 py-2 text-sm cursor-pointer transition-colors duration-150 ${
                    value === option.value
                      ? "text-white"
                      : "text-gray-900 hover:bg-gray-100"
                  } ${index === focusedIndex ? "bg-gray-100" : ""}`}
                  style={
                    value === option.value
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
                  {option.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dropdown;
