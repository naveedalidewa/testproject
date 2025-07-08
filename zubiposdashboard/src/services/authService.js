// Configuration flag - set to false to use dummy data
// Set to false for development to avoid CORS issues
export const isAPI = false;

// Base API URL for all endpoints
export const BASE_URL = "http://13.60.184.128/backOffice";

// Dummy login data for testing
const DUMMY_LOGIN = {
  email: "7-eleven@gmail.com",
  password: "12345678",
};

const DUMMY_RESPONSE = {
  status: "success",
  message: "franchise get successfully",
  data: {
    id: "c30299b0-724d-41ef-85e4-69ca6adebb38",
    adminId: null,
    type: 0,
    name: "Lydia Burks",
    email: "gul@gmail.com",
    contact: "21546545646464",
    businessType: "Consectetur incidun",
    businessDescription: "Enim est quas et qui",
    isActive: true,
    isDeleted: false,
    createdAt: "2025-06-25T16:20:35.000Z",
    updatedAt: "2025-06-25T16:20:35.000Z",
  },
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImMzMDI5OWIwLTcyNGQtNDFlZi04NWU0LTY5Y2E2YWRlYmIzOCIsIm5hbWUiOiJMeWRpYSBCdXJrcyIsInR5cGUiOjAsInJvbGUiOiJmcmFuY2hpc2UiLCJzdWJGcmFuY2hpc2VJZCI6bnVsbCwiaWF0IjoxNzUxMzI3MTYzLCJleHAiOjE3NTE1ODYzNjN9.Fx5x_7Z3dV94c1_UL67FLzYJ0IMl0Vv8xM_fclzINN4",
};

export const authService = {
  async login(email, password) {
    if (!isAPI) {
      // Use dummy data
      if (email === DUMMY_LOGIN.email && password === DUMMY_LOGIN.password) {
        return DUMMY_RESPONSE;
      } else {
        throw new Error("Invalid credentials");
      }
    }

    // Real API call
    try {
      console.log("Attempting to login with API:", `${BASE_URL}/login`);

      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      console.log("login", data);

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      return data;
    } catch (error) {
      console.error("API Login Error:", error);

      // If it's a network error (CORS, server down, etc.), provide helpful message
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error(
          "Unable to connect to server. Please check your connection or contact support.",
        );
      }

      throw error;
    }
  },
};
