import axios from "axios";
import { auth } from "../firebase";

const api = axios.create({
  baseURL: "http://localhost:3000", // change if your backend uses another port
});

// Automatically attach Firebase token to every request
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
