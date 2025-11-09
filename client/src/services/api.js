// client/src/services/api.js
import axios from "axios";
import { auth } from "../firebase";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor - attach Firebase token
api.interceptors.request.use(
  async (config) => {
    try {
      if (auth && auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting auth token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error("API Error:", error.response.status, error.response.data);
      
      if (error.response.status === 401) {
        // Token expired or invalid - could trigger re-login
        console.error("Authentication failed");
      }
    } else if (error.request) {
      // Request made but no response
      console.error("No response from server:", error.message);
    } else {
      // Error setting up request
      console.error("Request setup error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;