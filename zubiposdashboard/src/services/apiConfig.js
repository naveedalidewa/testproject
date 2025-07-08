// API Configuration
// Set up your HTTP client instance here

// Example setup (uncomment and configure when ready):
// import axios from 'axios';

// export const Instance = axios.create({
//   baseURL: 'https://your-api-base-url.com/api', // Replace with your actual API base URL
//   timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json',
//     // Add any default headers here (e.g., Authorization)
//   },
// });

// // Add request interceptor for authentication or logging
// Instance.interceptors.request.use(
//   (config) => {
//     // Add auth token if available
//     const token = localStorage.getItem('authToken');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Add response interceptor for error handling
// Instance.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     // Handle common errors (401, 500, etc.)
//     if (error.response?.status === 401) {
//       // Handle unauthorized access
//       localStorage.removeItem('authToken');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// Temporary placeholder for development
export const Instance = {
  post: async (url, data) => {
    console.log(`API Call: ${url}`, data);
    throw new Error(
      "API Instance not configured yet. Please set up your axios instance in apiConfig.js",
    );
  },
};
