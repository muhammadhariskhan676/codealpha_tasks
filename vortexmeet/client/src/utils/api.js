// utils/api.js
// Pre-configured Axios instance.
// Automatically attaches the JWT from localStorage to every request.

import axios from "axios";

const api = axios.create({
  baseURL: "/api", // CRA proxy forwards this to http://localhost:5000
  headers: { "Content-Type": "application/json" },
});

// Attach token to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("vx_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — log the user out if their token expired
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("vx_token");
      localStorage.removeItem("vx_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
