import { useState } from "react";

// Helper function to get AM/PM from 24-hour time
const getAmPm = (time24) => {
  if (!time24) return "";
  const [hours] = time24.split(":");
  const hour24 = parseInt(hours);
  return hour24 >= 12 ? "PM" : "AM";
};

const LocationHours = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [hours, setHours] = useState({
    monday: { open: "09:00", close: "21:00", isOpen: true },
    tuesday: { open: "09:00", close: "21:00", isOpen: true },
    wednesday: { open: "09:00", close: "21:00", isOpen: true },
    thursday: { open: "09:00", close: "21:00", isOpen: true },
    friday: { open: "09:00", close: "22:00", isOpen: true },
    saturday: { open: "10:00", close: "22:00", isOpen: true },
    sunday: { open: "10:00", close: "20:00", isOpen: true },
  });

  const dayNames = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };

  const handleTimeChange = (day, field, value) => {
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleToggleDay = (day) => {
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: !prev[day].isOpen,
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to save location hours");
    } finally {
      setLoading(false);
    }
  };

  const copyToAllDays = (sourceDay) => {
    const sourceHours = hours[sourceDay];
    setHours((prev) => {
      const newHours = { ...prev };
      Object.keys(newHours).forEach((day) => {
        if (day !== sourceDay) {
          newHours[day] = {
            ...newHours[day],
            open: sourceHours.open,
            close: sourceHours.close,
          };
        }
      });
      return newHours;
    });
  };

  return (
    <div className="p-3">
      <h2 className="text-xl font-semibold text-gray-800 mb-1">
        Location Hours
      </h2>
      <p className="text-gray-600 text-sm mb-3">
        Set your store operating hours for each day of the week
      </p>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 text-sm">
            Location hours updated successfully!
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid gap-2">
          {Object.entries(hours).map(([day, dayHours]) => (
            <div
              key={day}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md"
            >
              <div className="w-20">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={dayHours.isOpen}
                    onChange={() => handleToggleDay(day)}
                    className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {dayNames[day].slice(0, 3)}
                  </span>
                </label>
              </div>

              <div className="flex items-center space-x-2 flex-1">
                {dayHours.isOpen ? (
                  <>
                    <div className="flex items-center space-x-1">
                      <input
                        type="time"
                        value={dayHours.open}
                        onChange={(e) =>
                          handleTimeChange(day, "open", e.target.value)
                        }
                        className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent w-24"
                      />
                      <span className="text-xs text-gray-500 ml-1 font-medium">
                        {getAmPm(dayHours.open)}
                      </span>
                    </div>
                    <span className="text-gray-400 text-sm">to</span>
                    <div className="flex items-center space-x-1">
                      <input
                        type="time"
                        value={dayHours.close}
                        onChange={(e) =>
                          handleTimeChange(day, "close", e.target.value)
                        }
                        className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent w-24"
                      />
                      <span className="text-xs text-gray-500 ml-1 font-medium">
                        {getAmPm(dayHours.close)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToAllDays(day)}
                      className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                      title="Copy to all days"
                    >
                      Copy
                    </button>
                  </>
                ) : (
                  <span className="text-gray-500 text-sm font-medium">
                    Closed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
          <h3 className="text-sm font-medium text-orange-900 mb-2">
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                const standardHours = {
                  open: "09:00",
                  close: "17:00",
                  isOpen: true,
                };
                setHours((prev) => {
                  const newHours = { ...prev };
                  Object.keys(newHours).forEach((day) => {
                    newHours[day] = { ...standardHours };
                  });
                  return newHours;
                });
              }}
              className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
            >
              9-5 Hours
            </button>
            <button
              type="button"
              onClick={() => {
                setHours((prev) => {
                  const newHours = { ...prev };
                  Object.keys(newHours).forEach((day) => {
                    newHours[day].isOpen = false;
                  });
                  return newHours;
                });
              }}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              All Closed
            </button>
            <button
              type="button"
              onClick={() => {
                setHours((prev) => {
                  const newHours = { ...prev };
                  Object.keys(newHours).forEach((day) => {
                    newHours[day].isOpen = true;
                  });
                  return newHours;
                });
              }}
              className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
            >
              All Open
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
          <button
            type="button"
            onClick={() => {
              setHours({
                monday: { open: "09:00", close: "21:00", isOpen: true },
                tuesday: { open: "09:00", close: "21:00", isOpen: true },
                wednesday: { open: "09:00", close: "21:00", isOpen: true },
                thursday: { open: "09:00", close: "21:00", isOpen: true },
                friday: { open: "09:00", close: "22:00", isOpen: true },
                saturday: { open: "10:00", close: "22:00", isOpen: true },
                sunday: { open: "10:00", close: "20:00", isOpen: true },
              });
            }}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center min-w-[120px] justify-center"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Save Hours"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LocationHours;
