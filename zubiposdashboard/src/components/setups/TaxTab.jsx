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

const TaxTab = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [taxes, setTaxes] = useState([
    {
      id: 1,
      name: "Sales Tax",
      rate: 8.25,
      description: "Standard sales tax for retail items",
      isActive: true,
    },
    {
      id: 2,
      name: "Food Tax",
      rate: 2.5,
      description: "Reduced tax rate for food items",
      isActive: true,
    },
    {
      id: 3,
      name: "Luxury Tax",
      rate: 15.0,
      description: "Higher tax rate for luxury goods",
      isActive: false,
    },
  ]);
  const [formData, setFormData] = useState({
    name: "",
    rate: "",
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

      // Validate rate
      const rate = parseFloat(formData.rate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        throw new Error("Tax rate must be between 0 and 100");
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingId) {
        setTaxes((prev) =>
          prev.map((tax) =>
            tax.id === editingId ? { ...tax, ...formData, rate: rate } : tax,
          ),
        );
      } else {
        const newTax = {
          id: Date.now(),
          ...formData,
          rate: rate,
          isActive: true,
        };
        setTaxes((prev) => [...prev, newTax]);
      }

      setFormData({ name: "", rate: "", description: "" });
      setEditingId(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to save tax configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tax) => {
    setFormData({
      name: tax.name,
      rate: tax.rate.toString(),
      description: tax.description,
    });
    setEditingId(tax.id);
  };

  const handleDelete = (id) => {
    setTaxes((prev) => prev.filter((tax) => tax.id !== id));
  };

  const handleCancel = () => {
    setFormData({ name: "", rate: "", description: "" });
    setEditingId(null);
  };

  const toggleStatus = (id) => {
    setTaxes((prev) =>
      prev.map((tax) =>
        tax.id === id ? { ...tax, isActive: !tax.isActive } : tax,
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
        Tax Configuration
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Set up and manage tax rates for different product categories
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Tax configuration {editingId ? "updated" : "created"} successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Form Section */}
        <Grid item xs={12} md={6}>
          <Card elevation={1} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: "#374151" }}>
                {editingId ? "Edit Tax Rate" : "Add New Tax Rate"}
              </Typography>

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Tax Name"
                  value={formData.name}
                  onChange={handleInputChange("name")}
                  variant="outlined"
                  required
                  placeholder="e.g., Sales Tax, VAT, etc."
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
                  label="Tax Rate (%)"
                  value={formData.rate}
                  onChange={handleInputChange("rate")}
                  variant="outlined"
                  required
                  type="number"
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                  placeholder="e.g., 8.25"
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
                  placeholder="Brief description of when this tax applies"
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
                      "Update Tax"
                    ) : (
                      "Save Tax"
                    )}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Taxes List */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom sx={{ color: "#374151" }}>
            Configured Tax Rates
          </Typography>

          <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
            {taxes.map((tax) => (
              <Card key={tax.id} elevation={1} sx={{ mb: 2 }}>
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
                          {tax.name}
                        </Typography>
                        <Chip
                          label={`${tax.rate}%`}
                          size="small"
                          sx={{
                            backgroundColor: "#f97316",
                            color: "white",
                            height: 20,
                            fontSize: "0.75rem",
                            fontWeight: 600,
                          }}
                        />
                        <Chip
                          label={tax.isActive ? "Active" : "Inactive"}
                          size="small"
                          color={tax.isActive ? "success" : "default"}
                          sx={{ height: 20, fontSize: "0.75rem" }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {tax.description}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        onClick={() => toggleStatus(tax.id)}
                        sx={{
                          color: tax.isActive ? "#ef4444" : "#10b981",
                          "&:hover": {
                            backgroundColor: tax.isActive
                              ? "#fef2f2"
                              : "#f0fdf4",
                          },
                        }}
                        title={tax.isActive ? "Deactivate" : "Activate"}
                      >
                        {tax.isActive ? "⏸️" : "▶️"}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(tax)}
                        sx={{
                          color: "#f97316",
                          "&:hover": { backgroundColor: "#fff7ed" },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(tax.id)}
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

export default TaxTab;
