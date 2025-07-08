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

const FeeTab = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [fees, setFees] = useState([
    {
      id: 1,
      name: "Credit Card Processing",
      amount: 2.5,
      type: "percentage",
      description: "Credit card transaction fee",
      isActive: true,
    },
    {
      id: 2,
      name: "ATM Fee",
      amount: 3.0,
      type: "fixed",
      description: "ATM withdrawal fee",
      isActive: true,
    },
    {
      id: 3,
      name: "Service Fee",
      amount: 1.99,
      type: "fixed",
      description: "General service fee",
      isActive: false,
    },
  ]);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    type: "fixed",
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

      // Validate amount
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount < 0) {
        throw new Error("Fee amount must be a positive number");
      }

      if (formData.type === "percentage" && amount > 100) {
        throw new Error("Percentage fee cannot exceed 100%");
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingId) {
        setFees((prev) =>
          prev.map((fee) =>
            fee.id === editingId
              ? { ...fee, ...formData, amount: amount }
              : fee,
          ),
        );
      } else {
        const newFee = {
          id: Date.now(),
          ...formData,
          amount: amount,
          isActive: true,
        };
        setFees((prev) => [...prev, newFee]);
      }

      setFormData({ name: "", amount: "", type: "fixed", description: "" });
      setEditingId(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to save fee configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (fee) => {
    setFormData({
      name: fee.name,
      amount: fee.amount.toString(),
      type: fee.type,
      description: fee.description,
    });
    setEditingId(fee.id);
  };

  const handleDelete = (id) => {
    setFees((prev) => prev.filter((fee) => fee.id !== id));
  };

  const handleCancel = () => {
    setFormData({ name: "", amount: "", type: "fixed", description: "" });
    setEditingId(null);
  };

  const toggleStatus = (id) => {
    setFees((prev) =>
      prev.map((fee) =>
        fee.id === id ? { ...fee, isActive: !fee.isActive } : fee,
      ),
    );
  };

  const formatFeeAmount = (amount, type) => {
    return type === "percentage" ? `${amount}%` : `$${amount.toFixed(2)}`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ color: "#374151", fontWeight: "600" }}
      >
        Fee Management
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure transaction fees and service charges
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Fee configuration {editingId ? "updated" : "created"} successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Form Section */}
        <Grid item xs={12} md={6}>
          <Card elevation={1} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: "#374151" }}>
                {editingId ? "Edit Fee" : "Add New Fee"}
              </Typography>

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Fee Name"
                  value={formData.name}
                  onChange={handleInputChange("name")}
                  variant="outlined"
                  required
                  placeholder="e.g., Processing Fee, Service Charge"
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
                  <Grid item xs={8}>
                    <TextField
                      fullWidth
                      label={
                        formData.type === "percentage"
                          ? "Fee Rate (%)"
                          : "Fee Amount ($)"
                      }
                      value={formData.amount}
                      onChange={handleInputChange("amount")}
                      variant="outlined"
                      required
                      type="number"
                      inputProps={{ min: 0, step: 0.01 }}
                      placeholder={
                        formData.type === "percentage" ? "2.50" : "3.00"
                      }
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
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      select
                      label="Type"
                      value={formData.type}
                      onChange={handleInputChange("type")}
                      variant="outlined"
                      SelectProps={{
                        native: true,
                      }}
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
                    >
                      <option value="fixed">Fixed</option>
                      <option value="percentage">%</option>
                    </TextField>
                  </Grid>
                </Grid>

                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={handleInputChange("description")}
                  variant="outlined"
                  multiline
                  rows={3}
                  placeholder="Brief description of when this fee applies"
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
                      "Update Fee"
                    ) : (
                      "Save Fee"
                    )}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Fees List */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom sx={{ color: "#374151" }}>
            Configured Fees
          </Typography>

          <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
            {fees.map((fee) => (
              <Card key={fee.id} elevation={1} sx={{ mb: 2 }}>
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
                          {fee.name}
                        </Typography>
                        <Chip
                          label={formatFeeAmount(fee.amount, fee.type)}
                          size="small"
                          sx={{
                            backgroundColor: "#059669",
                            color: "white",
                            height: 20,
                            fontSize: "0.75rem",
                            fontWeight: 600,
                          }}
                        />
                        <Chip
                          label={fee.type === "percentage" ? "%" : "$"}
                          size="small"
                          variant="outlined"
                          sx={{
                            height: 20,
                            fontSize: "0.75rem",
                            borderColor: "#059669",
                            color: "#059669",
                          }}
                        />
                        <Chip
                          label={fee.isActive ? "Active" : "Inactive"}
                          size="small"
                          color={fee.isActive ? "success" : "default"}
                          sx={{ height: 20, fontSize: "0.75rem" }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {fee.description}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        onClick={() => toggleStatus(fee.id)}
                        sx={{
                          color: fee.isActive ? "#ef4444" : "#10b981",
                          "&:hover": {
                            backgroundColor: fee.isActive
                              ? "#fef2f2"
                              : "#f0fdf4",
                          },
                        }}
                        title={fee.isActive ? "Deactivate" : "Activate"}
                      >
                        {fee.isActive ? "⏸️" : "▶️"}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(fee)}
                        sx={{
                          color: "#f97316",
                          "&:hover": { backgroundColor: "#fff7ed" },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(fee.id)}
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

export default FeeTab;
