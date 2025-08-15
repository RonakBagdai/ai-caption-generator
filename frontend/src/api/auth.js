import { api } from "./client";

// Always use leading slashes so axios joins with baseURL correctly.
export function register(data) {
  return api.post("/api/auth/register", data);
}

export function login(data) {
  return api.post("/api/auth/login", data);
}

export function getCurrentUser() {
  return api.get("/api/auth/user");
}

export function logout() {
  return api.post("/api/auth/logout");
}
