import { useState, useEffect } from "react";
import Tooltip from "./Tooltip";

const TokenIndicator = () => {
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  // Initialize token expiry from localStorage
  useEffect(() => {
    const savedExpiry = localStorage.getItem("tokenExpiry");
    if (savedExpiry) {
      setTokenExpiry(new Date(savedExpiry));
    }
  }, []); // Only run once on mount

  // Update time left calculation
  useEffect(() => {
    const updateTimeLeft = () => {
      if (tokenExpiry) {
        const now = new Date();
        const diff = tokenExpiry - now;

        if (diff <= 0) {
          setTimeLeft("Expired");
        } else {
          const minutes = Math.floor(diff / 60000);
          if (minutes < 60) {
            setTimeLeft(`${minutes}m`);
          } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            setTimeLeft(`${hours}h ${remainingMinutes}m`);
          }
        }
      } else {
        setTimeLeft("Active");
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [tokenExpiry]); // This will only re-run when tokenExpiry changes from localStorage

  // Listen for login events to update expiry
  useEffect(() => {
    const handleStorageChange = () => {
      const savedExpiry = localStorage.getItem("tokenExpiry");
      if (savedExpiry) {
        setTokenExpiry(new Date(savedExpiry));
      } else {
        setTokenExpiry(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  if (!timeLeft) return null;

  const getStatusColor = () => {
    if (timeLeft === "Active") return "bg-green-500";
    if (timeLeft === "Expired") return "bg-red-500";
    if (timeLeft.includes("h") || parseInt(timeLeft) > 30)
      return "bg-green-500";
    if (parseInt(timeLeft) > 10) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getTooltipContent = () => {
    if (timeLeft === "Expired") {
      return "Your session has expired. Please log in again.";
    }
    if (tokenExpiry) {
      return `Session expires at ${tokenExpiry.toLocaleTimeString()}`;
    }
    return "Your session will expire after 1 hour of login";
  };

  return (
    <Tooltip content={getTooltipContent()} position="bottom">
      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 cursor-default">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
        <span className="text-xs text-gray-600 dark:text-gray-400 select-none">
          {timeLeft === "Active" ? "1h token" : timeLeft}
        </span>
      </div>
    </Tooltip>
  );
};

export default TokenIndicator;
