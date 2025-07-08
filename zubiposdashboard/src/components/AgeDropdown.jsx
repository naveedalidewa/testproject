import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getMinAge } from "../services/ageService";
import SearchableDropdown from "./SearchableDropdown";

const AgeDropdown = ({
  value,
  onChange,
  placeholder = "Select age restriction",
  className = "",
  disabled = false,
  preloadedOptions = null,
}) => {
  const { selectedLocation, token } = useAuth();
  const [ageOptions, setAgeOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log(
      "AgeDropdown useEffect triggered with preloadedOptions:",
      preloadedOptions,
    );
    // If preloaded options are provided, use them immediately
    if (preloadedOptions && preloadedOptions.length > 0) {
      console.log("AgeDropdown setting preloaded options:", preloadedOptions);
      setAgeOptions(preloadedOptions);
      setLoading(false);
      return;
    }

    const fetchAgeOptions = async () => {
      if (!selectedLocation?.id) return;

      setLoading(true);
      setError("");

      try {
        const response = await getMinAge(token, {
          locationId: selectedLocation.id,
        });

        if (response.status === "success") {
          setAgeOptions(response.data || []);
        } else {
          setError("Failed to load age options");
        }
      } catch (err) {
        setError("Failed to load age options");
        console.error("Error fetching age options:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgeOptions();
  }, [selectedLocation?.id, preloadedOptions, token]);

  // Convert age options to SearchableDropdown format using id and minAge properties
  const options = ageOptions.map((age) => ({
    name: age.minAge === "no restriction" ? "No Restriction" : age.minAge,
    id: age.id,
  }));

  return (
    <SearchableDropdown
      label=""
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      searchPlaceholder="Search age..."
      displayKey="name"
      valueKey="id"
      showLabel={false}
      loading={loading}
      disabled={disabled || error}
      className={className}
    />
  );
};

export default AgeDropdown;
