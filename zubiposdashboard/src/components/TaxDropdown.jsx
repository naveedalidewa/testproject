import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getAllTax } from "../services/taxService";
import SearchableDropdown from "./SearchableDropdown";

const TaxDropdown = ({
  value,
  onChange,
  placeholder = "Select tax",
  className = "",
  disabled = false,
  preloadedOptions = null,
}) => {
  const { selectedLocation, token } = useAuth();
  const [taxOptions, setTaxOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log(
      "TaxDropdown useEffect triggered with preloadedOptions:",
      preloadedOptions,
    );
    // If preloaded options are provided, use them immediately
    if (preloadedOptions && preloadedOptions.length > 0) {
      console.log("TaxDropdown setting preloaded options:", preloadedOptions);
      setTaxOptions(preloadedOptions);
      setLoading(false);
      return;
    }

    const fetchTaxOptions = async () => {
      if (!selectedLocation?.id) return;

      setLoading(true);
      setError("");

      try {
        const response = await getAllTax(token, {
          locationId: selectedLocation.id,
        });

        if (response.status === "success") {
          setTaxOptions(response.data || []);
        } else {
          setError("Failed to load tax options");
        }
      } catch (err) {
        setError("Failed to load tax options");
        console.error("Error fetching tax options:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTaxOptions();
  }, [selectedLocation?.id, preloadedOptions, token]);

  // Convert tax options to SearchableDropdown format using id and tax properties
  const options = taxOptions.map((tax) => ({
    name: tax.tax || tax.name || "No Tax",
    id: tax.id,
  }));

  return (
    <SearchableDropdown
      label=""
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      searchPlaceholder="Search tax..."
      displayKey="name"
      valueKey="id"
      showLabel={false}
      loading={loading}
      disabled={disabled || error}
      className={className}
    />
  );
};

export default TaxDropdown;
