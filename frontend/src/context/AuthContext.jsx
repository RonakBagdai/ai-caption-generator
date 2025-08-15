import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  getCurrentUser,
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
} from "../api/auth";
import tokenManager from "../utils/tokenManager";
import { setTokenExpiredHandler, tokenManager as apiTokenManager } from "../api/client";
import { useToast } from "../components/Toast";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Handle token expiry
  const handleTokenExpiry = useCallback(
    (message) => {
      setUser(null);
      localStorage.removeItem("tokenExpiry"); // Clear stored expiry time
      apiTokenManager.removeToken(); // Clear stored auth token
      toast.error(`Session Expired: ${message}`);
      console.log("Token expired:", message);
    },
    [toast]
  );

  useEffect(() => {
    // Set up token expiry handler
    setTokenExpiredHandler(handleTokenExpiry);

    // Initialize token manager only once
    tokenManager.init({
      onTokenExpired: () =>
        handleTokenExpiry(
          "Your session has expired after 1 hour. Please log in again."
        ),
    });

    // Check current user status
    getCurrentUser()
      .then((res) => {
        setUser(res.data.user);
        console.log("User authenticated, token valid for 1 hour");
      })
      .catch(() => {
        setUser(null);
        console.log("No valid authentication found");
      })
      .finally(() => setLoading(false));

    // Cleanup on unmount
    return () => {
      tokenManager.destroy();
    };
  }, []); // Remove handleTokenExpiry dependency to prevent re-initialization

  const login = useCallback(
    async (username, password) => {
      try {
        const res = await loginApi({ username, password });
        if (res.data?.user) {
          setUser(res.data.user);

          // Store token expiry time for the indicator
          if (res.data.tokenExpiry) {
            localStorage.setItem("tokenExpiry", res.data.tokenExpiry);
          }

          // Store auth token for API requests
          if (res.data.token) {
            apiTokenManager.setToken(res.data.token);
          }

          console.log("Login successful - token expires in 1 hour");
          toast.success(
            "Welcome back! You are now logged in. Your session will expire in 1 hour."
          );
          return res;
        } else {
          throw new Error("Invalid response from server");
        }
      } catch (error) {
        console.error("Login error:", error);
        setUser(null); // Clear any partial state
        localStorage.removeItem("tokenExpiry"); // Clear any stored expiry
        apiTokenManager.removeToken(); // Clear any stored token
        throw error; // Re-throw to be handled by the component
      }
    },
    [toast]
  );

  const register = useCallback(
    async (username, password) => {
      const res = await registerApi({ username, password });
      if (res.data?.user) {
        setUser(res.data.user);

        // Store token expiry time for the indicator
        if (res.data.tokenExpiry) {
          localStorage.setItem("tokenExpiry", res.data.tokenExpiry);
        }

        // Store auth token for API requests
        if (res.data.token) {
          apiTokenManager.setToken(res.data.token);
        }

        console.log("Registration successful - token expires in 1 hour");
        toast.success(
          "Account created! You are now logged in. Your session will expire in 1 hour."
        );
      }
      return res;
    },
    [toast]
  );

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.log("Logout API error:", error);
    }
    setUser(null);
    tokenManager.destroy();
    localStorage.removeItem("tokenExpiry"); // Clear stored expiry time
    apiTokenManager.removeToken(); // Clear stored auth token
    toast.info("You have been successfully logged out.");
  }, [toast]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
