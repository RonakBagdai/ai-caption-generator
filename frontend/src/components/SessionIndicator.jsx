import { useState, useEffect } from "react";
import sessionManager from "../utils/sessionManager";
import Tooltip from "./Tooltip";

const SessionIndicator = () => {
  const [sessionInfo, setSessionInfo] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateSessionInfo = () => {
      const info = sessionManager.getSessionInfo();
      setSessionInfo(info);
      setIsVisible(info.isActive);
    };

    // Update immediately
    updateSessionInfo();

    // Update every 30 seconds
    const interval = setInterval(updateSessionInfo, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible || !sessionInfo) return null;

  const getStatusColor = () => {
    if (!sessionInfo.timeUntilExpiry || sessionInfo.timeUntilExpiry <= 0) {
      return "bg-red-500";
    }
    if (sessionInfo.timeUntilExpiry < 5 * 60 * 1000) {
      // Less than 5 minutes
      return "bg-yellow-500";
    }
    return "bg-green-500";
  };

  const formatTimeRemaining = () => {
    if (!sessionInfo.timeUntilExpiry || sessionInfo.timeUntilExpiry <= 0) {
      return "Expired";
    }

    const minutes = Math.floor(sessionInfo.timeUntilExpiry / 60000);
    if (minutes < 60) {
      return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getTooltipContent = () => {
    const timeRemaining = formatTimeRemaining();
    const lastActivity = new Date(
      sessionInfo.lastActivity
    ).toLocaleTimeString();

    return (
      <div className="text-xs">
        <div>Session expires in: {timeRemaining}</div>
        <div>Last activity: {lastActivity}</div>
        {sessionInfo.isWarningShown && (
          <div className="text-yellow-300">⚠ Warning active</div>
        )}
      </div>
    );
  };

  return (
    <Tooltip content={getTooltipContent()} position="bottom">
      <div
        className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 cursor-default"
        onClick={(e) => {
          // Prevent any click event from propagating or causing issues
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
        <span className="text-xs text-gray-600 dark:text-gray-400 select-none">
          {formatTimeRemaining()}
        </span>
      </div>
    </Tooltip>
  );
};

export default SessionIndicator;
