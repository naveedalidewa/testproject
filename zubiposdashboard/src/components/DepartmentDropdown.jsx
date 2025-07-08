import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { departmentService } from "../services/departmentService";
import SearchableDropdown from "./SearchableDropdown";

const DepartmentDropdown = ({
  value,
  onChange,
  placeholder = "Select Department",
  className = "",
  disabled = false,
}) => {
  const { token, selectedLocation } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDepartments = async () => {
      if (!selectedLocation?.id || !token) return;

      setLoading(true);
      setError("");

      try {
        const response = await departmentService.getDepartments(
          token,
          selectedLocation.id,
        );

        if (response.status === "success") {
          setDepartments(response.data);
        } else {
          setError(response.message || "Failed to fetch departments");
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching departments");
        console.error("Department fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [token, selectedLocation?.id]);

  // Convert departments to SearchableDropdown format
  const departmentOptions = departments.map((dept) => ({
    name: dept.name,
    id: dept.name,
  }));

  return (
    <SearchableDropdown
      label=""
      value={value}
      onChange={onChange}
      options={departmentOptions}
      placeholder={placeholder}
      searchPlaceholder="Search departments..."
      displayKey="name"
      valueKey="id"
      showLabel={false}
      loading={loading}
      disabled={disabled || error}
    />
  );
};

export default DepartmentDropdown;
