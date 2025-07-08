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
  Avatar,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";

const VendorTab = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [vendors, setVendors] = useState([
    {
      id: 1,
      name: "Coca-Cola Company",
      contact: "John Smith",
      phone: "(555) 123-4567",
      email: "orders@cocacola.com",
      address: "1234 Main St, Atlanta, GA",
      isActive: true,
    },
    {
      id: 2,
      name: "PepsiCo Inc",
      contact: "Jane Doe",
      phone: "(555) 987-6543",
      email: "sales@pepsi.com",
      address: "5678 Oak Ave, Purchase, NY",
      isActive: true,
    },
    {
      id: 3,
      name: "Local Bakery Supply",
      contact: "Mike Johnson",
      phone: "(555) 555-0123",
      email: "info@localbakery.com",
      address: "789 Baker St, Local City",
      isActive: false,
    },
  ]);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    phone: "",
    email: "",
    address: "",
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

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.email && !emailRegex.test(formData.email)) {
        throw new Error("Please enter a valid email address");
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingId) {
        setVendors((prev) =>
          prev.map((vendor) =>
            vendor.id === editingId ? { ...vendor, ...formData } : vendor,
          ),
        );
      } else {
        const newVendor = {
          id: Date.now(),
          ...formData,
          isActive: true,
        };
        setVendors((prev) => [...prev, newVendor]);
      }

      setFormData({ name: "", contact: "", phone: "", email: "", address: "" });
      setEditingId(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to save vendor information");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vendor) => {
    setFormData({
      name: vendor.name,
      contact: vendor.contact,
      phone: vendor.phone,
      email: vendor.email,
      address: vendor.address,
    });
    setEditingId(vendor.id);
  };

  const handleDelete = (id) => {
    setVendors((prev) => prev.filter((vendor) => vendor.id !== id));
  };

  const handleCancel = () => {
    setFormData({ name: "", contact: "", phone: "", email: "", address: "" });
    setEditingId(null);
  };

  const toggleStatus = (id) => {
    setVendors((prev) =>
      prev.map((vendor) =>
        vendor.id === id ? { ...vendor, isActive: !vendor.isActive } : vendor,
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
        Vendor Management
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage supplier and vendor information for purchase orders
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Vendor {editingId ? "updated" : "added"} successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Form Section */}
        <Grid item xs={12} md={6}>
          <Card elevation={1} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: "#374151" }}>
                {editingId ? "Edit Vendor" : "Add New Vendor"}
              </Typography>

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={formData.name}
                  onChange={handleInputChange("name")}
                  variant="outlined"
                  required
                  placeholder="e.g., ABC Supply Company"
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
                  label="Contact Person"
                  value={formData.contact}
                  onChange={handleInputChange("contact")}
                  variant="outlined"
                  required
                  placeholder="Primary contact name"
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

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={formData.phone}
                      onChange={handleInputChange("phone")}
                      variant="outlined"
                      required
                      placeholder="(555) 123-4567"
                      sx={{
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
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={formData.email}
                      onChange={handleInputChange("email")}
                      variant="outlined"
                      type="email"
                      placeholder="vendor@company.com"
                      sx={{
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
                  </Grid>
                </Grid>

                <TextField
                  fullWidth
                  label="Address"
                  value={formData.address}
                  onChange={handleInputChange("address")}
                  variant="outlined"
                  multiline
                  rows={2}
                  placeholder="Full business address"
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
                      "Update Vendor"
                    ) : (
                      "Save Vendor"
                    )}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Vendors List */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom sx={{ color: "#374151" }}>
            Active Vendors
          </Typography>

          <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
            {vendors.map((vendor) => (
              <Card key={vendor.id} elevation={1} sx={{ mb: 2 }}>
                <CardContent sx={{ pb: "16px !important" }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <Box display="flex" gap={2} flex={1}>
                      <Avatar
                        sx={{
                          backgroundColor: "#f97316",
                          width: 40,
                          height: 40,
                        }}
                      >
                        <BusinessIcon fontSize="small" />
                      </Avatar>
                      <Box flex={1}>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                          mb={0.5}
                        >
                          <Typography
                            variant="subtitle1"
                            fontWeight="600"
                            sx={{ color: "#374151" }}
                          >
                            {vendor.name}
                          </Typography>
                          <Chip
                            label={vendor.isActive ? "Active" : "Inactive"}
                            size="small"
                            color={vendor.isActive ? "success" : "default"}
                            sx={{ height: 18, fontSize: "0.7rem" }}
                          />
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: "0.8rem" }}
                        >
                          Contact: {vendor.contact}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: "0.8rem" }}
                        >
                          {vendor.phone} • {vendor.email}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: "0.8rem" }}
                        >
                          {vendor.address}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        onClick={() => toggleStatus(vendor.id)}
                        sx={{
                          color: vendor.isActive ? "#ef4444" : "#10b981",
                          "&:hover": {
                            backgroundColor: vendor.isActive
                              ? "#fef2f2"
                              : "#f0fdf4",
                          },
                        }}
                        title={vendor.isActive ? "Deactivate" : "Activate"}
                      >
                        {vendor.isActive ? "⏸️" : "▶️"}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(vendor)}
                        sx={{
                          color: "#f97316",
                          "&:hover": { backgroundColor: "#fff7ed" },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(vendor.id)}
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

export default VendorTab;
