import axios from "axios";

// Determine backend base URL: use env if set, else default to local backend.
// Accept values like 'http://localhost:3000' or 'http://localhost:3000/'.
const envBase = import.meta.env.VITE_API_BASE_URL;
let baseURL = envBase ? envBase.replace(/\/$/, "") : "http://localhost:3000";
// If someone set VITE_API_BASE_URL to include /api, strip it because endpoints already begin with /api
if (/\/api$/i.test(baseURL)) {
  baseURL = baseURL.slice(0, -4); // remove '/api'
}

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Store token expiry handler globally
let tokenExpiredHandler = null;

// Set token expiry handler
export const setTokenExpiredHandler = (handler) => {
  tokenExpiredHandler = handler;
};

api.interceptors.response.use(
  (res) => {
    return res;
  },
  (err) => {
    // Handle token expiry
    if (err.response?.status === 401) {
      const data = err.response.data;
      if (data?.code === "TOKEN_EXPIRED") {
        console.log("Token expired - triggering logout");
        if (tokenExpiredHandler) {
          tokenExpiredHandler(
            "Token expired after 1 hour. Please log in again."
          );
        }
      } else if (data?.code === "INVALID_TOKEN") {
        console.log("Invalid token - triggering logout");
        if (tokenExpiredHandler) {
          tokenExpiredHandler("Invalid authentication. Please log in again.");
        }
      }
    }
    return Promise.reject(err);
  }
);
