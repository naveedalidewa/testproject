import { useState, useRef, useEffect } from "react";

const DateRangePicker = ({
  label,
  value,
  onChange,
  placeholder = "Select date range",
  className = "",
  showLabel = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const dropdownRef = useRef(null);

  // Preset date ranges
  const presetRanges = [
    {
      label: "Today",
      value: "today",
      getRange: () => {
        const today = new Date().toISOString().split("T")[0];
        return { from: today, to: today };
      },
    },
    {
      label: "Yesterday",
      value: "yesterday",
      getRange: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dateStr = yesterday.toISOString().split("T")[0];
        return { from: dateStr, to: dateStr };
      },
    },
    {
      label: "This Week",
      value: "thisWeek",
      getRange: () => {
        const today = new Date();
        const firstDay = new Date(
          today.setDate(today.getDate() - today.getDay()),
        );
        const lastDay = new Date(
          today.setDate(today.getDate() - today.getDay() + 6),
        );
        return {
          from: firstDay.toISOString().split("T")[0],
          to: lastDay.toISOString().split("T")[0],
        };
      },
    },
    {
      label: "This Month",
      value: "thisMonth",
      getRange: () => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return {
          from: firstDay.toISOString().split("T")[0],
          to: lastDay.toISOString().split("T")[0],
        };
      },
    },
    {
      label: "This Year",
      value: "thisYear",
      getRange: () => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), 0, 1);
        const lastDay = new Date(today.getFullYear(), 11, 31);
        return {
          from: firstDay.toISOString().split("T")[0],
          to: lastDay.toISOString().split("T")[0],
        };
      },
    },
    {
      label: "Last Year",
      value: "lastYear",
      getRange: () => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear() - 1, 0, 1);
        const lastDay = new Date(today.getFullYear() - 1, 11, 31);
        return {
          from: firstDay.toISOString().split("T")[0],
          to: lastDay.toISOString().split("T")[0],
        };
      },
    },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Check if current value matches any preset
  useEffect(() => {
    if (value?.from && value?.to) {
      const matchingPreset = presetRanges.find((preset) => {
        const range = preset.getRange();
        return range.from === value.from && range.to === value.to;
      });
      setSelectedPreset(matchingPreset?.value || null);
    } else {
      setSelectedPreset(null);
    }
  }, [value]);

  const handleKeyDown = (event) => {
    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        setIsOpen(!isOpen);
        break;
      case "Escape":
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handlePresetClick = (preset) => {
    const range = preset.getRange();
    setSelectedPreset(preset.value);
    onChange(range);
    setIsOpen(false);
  };

  const handleCustomDateChange = (field, dateValue) => {
    const newValue = { ...value, [field]: dateValue };
    onChange(newValue);
    setSelectedPreset(null); // Clear preset selection when using custom dates
  };

  const getDisplayValue = () => {
    // Helper function to format date string without timezone conversion
    const formatDateString = (dateStr) => {
      if (!dateStr) return "";
      // Parse YYYY-MM-DD format manually to avoid timezone issues
      const [year, month, day] = dateStr.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toLocaleDateString();
    };

    if (value?.from && value?.to) {
      if (value.from === value.to) {
        return formatDateString(value.from);
      }
      return `${formatDateString(value.from)} - ${formatDateString(value.to)}`;
    } else if (value?.from) {
      return `From ${formatDateString(value.from)}`;
    } else if (value?.to) {
      return `Until ${formatDateString(value.to)}`;
    }

    return placeholder;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {showLabel && label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm ring-offset-background placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:border-gray-400 transition-colors duration-200"
          style={{
            "--tw-ring-color": "rgb(255 153 25 / var(--tw-bg-opacity))",
            "--tw-ring-offset-color": "white",
          }}
          onClick={toggleDropdown}
          onKeyDown={handleKeyDown}
        >
          <span
            className={`truncate ${!value?.from && !value?.to ? "text-gray-500" : "text-gray-900"}`}
          >
            {getDisplayValue()}
          </span>

          <div className="flex items-center gap-2">
            <svg
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
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
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-2 w-full min-w-[320px] rounded-lg border border-gray-200 bg-white shadow-lg">
            <div className="p-4">
              {/* Custom Date Range */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Custom Range
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={value?.from || ""}
                      onChange={(e) =>
                        handleCustomDateChange("from", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 transition-shadow duration-200"
                      style={{
                        "--tw-ring-color":
                          "rgb(255 153 25 / var(--tw-bg-opacity))",
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={value?.to || ""}
                      onChange={(e) =>
                        handleCustomDateChange("to", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 transition-shadow duration-200"
                      style={{
                        "--tw-ring-color":
                          "rgb(255 153 25 / var(--tw-bg-opacity))",
                      }}
                      min={value?.from || undefined}
                    />
                  </div>
                </div>
              </div>

              {/* Preset Options */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Quick Select
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {presetRanges.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handlePresetClick(preset)}
                      className={`px-2 py-1.5 text-xs rounded-md border transition-all duration-200 ${
                        selectedPreset === preset.value
                          ? "border-transparent text-white shadow-sm"
                          : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                      style={
                        selectedPreset === preset.value
                          ? {
                              backgroundColor:
                                "rgb(255 153 25 / var(--tw-bg-opacity))",
                            }
                          : {}
                      }
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-white rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
                  style={{
                    backgroundColor: "rgb(255 153 25 / var(--tw-bg-opacity))",
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateRangePicker;
