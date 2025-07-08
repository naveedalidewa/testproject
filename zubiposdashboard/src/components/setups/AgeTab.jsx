import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

const AgeTab = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [ageRestrictions, setAgeRestrictions] = useState([
    {
      id: 1,
      name: "Alcohol",
      minimumAge: 21,
      description: "Alcoholic beverages and spirits",
      isActive: true,
    },
    {
      id: 2,
      name: "Tobacco",
      minimumAge: 18,
      description: "Cigarettes, cigars, and tobacco products",
      isActive: true,
    },
    {
      id: 3,
      name: "Energy Drinks",
      minimumAge: 16,
      description: "High-caffeine energy drinks",
      isActive: false,
    },
  ]);
  const [formData, setFormData] = useState({
    name: "",
    minimumAge: "",
    description: "",
  });
  const [editingId, setEditingId] = useState(null);

  const handleInputChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Validate age
      const age = parseInt(formData.minimumAge);
      if (isNaN(age) || age < 0 || age > 120) {
        throw new Error("Minimum age must be between 0 and 120");
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingId) {
        setAgeRestrictions((prev) =>
          prev.map((restriction) =>
            restriction.id === editingId
              ? { ...restriction, ...formData, minimumAge: age }
              : restriction,
          ),
        );
      } else {
        const newRestriction = {
          id: Date.now(),
          ...formData,
          minimumAge: age,
          isActive: true,
        };
        setAgeRestrictions((prev) => [...prev, newRestriction]);
      }

      setFormData({ name: "", minimumAge: "", description: "" });
      setEditingId(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to save age restriction");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (restriction) => {
    setFormData({
      name: restriction.name,
      minimumAge: restriction.minimumAge.toString(),
      description: restriction.description,
    });
    setEditingId(restriction.id);
  };

  const handleDelete = (id) => {
    setAgeRestrictions((prev) =>
      prev.filter((restriction) => restriction.id !== id),
    );
  };

  const handleCancel = () => {
    setFormData({ name: "", minimumAge: "", description: "" });
    setEditingId(null);
  };

  const toggleStatus = (id) => {
    setAgeRestrictions((prev) =>
      prev.map((restriction) =>
        restriction.id === id
          ? { ...restriction, isActive: !restriction.isActive }
          : restriction,
      ),
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ color: "#374151", fontWeight: "600" }}
      >
        Age Restriction Management
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure age restrictions for products that require minimum age
        verification
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Age restriction {editingId ? "updated" : "created"} successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Form Section */}
        <Grid item xs={12} md={6}>
          <Card elevation={1} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: "#374151" }}>
                {editingId ? "Edit Age Restriction" : "Add New Age Restriction"}
              </Typography>

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Product Category"
                  value={formData.name}
                  onChange={handleInputChange("name")}
                  variant="outlined"
                  required
                  placeholder="e.g., Alcohol, Tobacco, etc."
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": {
                        borderColor: "#f97316",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#f97316",
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Minimum Age"
                  value={formData.minimumAge}
                  onChange={handleInputChange("minimumAge")}
                  variant="outlined"
                  required
                  type="number"
                  inputProps={{ min: 0, max: 120 }}
                  placeholder="e.g., 18, 21"
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": {
                        borderColor: "#f97316",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#f97316",
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={handleInputChange("description")}
                  variant="outlined"
                  multiline
                  rows={3}
                  placeholder="Description of products in this category"
                  sx={{
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": {
                        borderColor: "#f97316",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#f97316",
                    },
                  }}
                />

                <Box display="flex" gap={2}>
                  {editingId && (
                    <Button
                      variant="outlined"
                      onClick={handleCancel}
                      disabled={loading}
                      sx={{
                        borderColor: "#6b7280",
                        color: "#6b7280",
                        "&:hover": {
                          borderColor: "#4b5563",
                          backgroundColor: "#f9fafb",
                        },
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{
                      backgroundColor: "#f97316",
                      "&:hover": {
                        backgroundColor: "#ea580c",
                      },
                      flex: 1,
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: "white" }} />
                    ) : editingId ? (
                      "Update Restriction"
                    ) : (
                      "Save Restriction"
                    )}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Restrictions List */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom sx={{ color: "#374151" }}>
            Active Age Restrictions
          </Typography>

          <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
            {ageRestrictions.map((restriction) => (
              <Card key={restriction.id} elevation={1} sx={{ mb: 2 }}>
                <CardContent sx={{ pb: "16px !important" }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="600"
                          sx={{ color: "#374151" }}
                        >
                          {restriction.name}
                        </Typography>
                        <Chip
                          label={`${restriction.minimumAge}+ years`}
                          size="small"
                          sx={{
                            backgroundColor: "#dc2626",
                            color: "white",
                            height: 20,
                            fontSize: "0.75rem",
                            fontWeight: 600,
                          }}
                        />
                        <Chip
                          label={restriction.isActive ? "Active" : "Inactive"}
                          size="small"
                          color={restriction.isActive ? "success" : "default"}
                          sx={{ height: 20, fontSize: "0.75rem" }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {restriction.description}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        onClick={() => toggleStatus(restriction.id)}
                        sx={{
                          color: restriction.isActive ? "#ef4444" : "#10b981",
                          "&:hover": {
                            backgroundColor: restriction.isActive
                              ? "#fef2f2"
                              : "#f0fdf4",
                          },
                        }}
                        title={restriction.isActive ? "Deactivate" : "Activate"}
                      >
                        {restriction.isActive ? "⏸️" : "▶️"}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(restriction)}
                        sx={{
                          color: "#f97316",
                          "&:hover": { backgroundColor: "#fff7ed" },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(restriction.id)}
                        sx={{
                          color: "#ef4444",
                          "&:hover": { backgroundColor: "#fef2f2" },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AgeTab;
