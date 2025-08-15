import { useState, useEffect } from "react";
import sessionManager from "../utils/sessionManager";

const SessionDebug = () => {
  const [sessionInfo, setSessionInfo] = useState(
    sessionManager.getSessionInfo()
  );
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionInfo(sessionManager.getSessionInfo());
    }, 1000);

    // Listen for keyboard shortcut (Ctrl/Cmd + Shift + S)
    const handleKeydown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "S") {
        e.preventDefault();
        setIsVisible(!isVisible);
      }
    };

    document.addEventListener("keydown", handleKeydown);

    return () => {
      clearInterval(interval);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [isVisible]);

  const formatTime = (milliseconds) => {
    if (milliseconds <= 0) return "Expired";

    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);

    return `${minutes}m ${seconds}s`;
  };

  const testSessionTimeout = (minutes) => {
    sessionManager.setSessionTimeout(minutes);
    console.log(`Session timeout set to ${minutes} minutes for testing`);
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-1 rounded text-xs">
        Press Ctrl+Shift+S to show session debug
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Session Debug
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <span className="text-gray-500 dark:text-gray-400">Status:</span>
          <span
            className={`ml-2 ${
              sessionInfo.isActive ? "text-green-600" : "text-red-600"
            }`}
          >
            {sessionInfo.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <div>
          <span className="text-gray-500 dark:text-gray-400">Time Left:</span>
          <span className="ml-2 text-gray-900 dark:text-white font-mono">
            {formatTime(sessionInfo.timeUntilExpiry)}
          </span>
        </div>

        <div>
          <span className="text-gray-500 dark:text-gray-400">Timeout:</span>
          <span className="ml-2 text-gray-900 dark:text-white">
            {sessionInfo.settings.sessionTimeout}m
          </span>
        </div>

        <div>
          <span className="text-gray-500 dark:text-gray-400">Warning:</span>
          <span
            className={`ml-2 ${
              sessionInfo.isWarningShown ? "text-yellow-600" : "text-green-600"
            }`}
          >
            {sessionInfo.isWarningShown ? "Shown" : "Hidden"}
          </span>
        </div>

        <div>
          <span className="text-gray-500 dark:text-gray-400">
            Last Activity:
          </span>
          <div className="text-xs text-gray-900 dark:text-white font-mono">
            {new Date(sessionInfo.lastActivity).toLocaleTimeString()}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Quick Tests:
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => testSessionTimeout(1)}
            className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            1m
          </button>
          <button
            onClick={() => testSessionTimeout(5)}
            className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            5m
          </button>
          <button
            onClick={() => testSessionTimeout(30)}
            className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            30m
          </button>
          <button
            onClick={() => sessionManager.startSession()}
            className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
          >
            Start
          </button>
          <button
            onClick={() => sessionManager.extendSession()}
            className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
          >
            Extend
          </button>
          <button
            onClick={() => sessionManager.debugSettings()}
            className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
          >
            Debug
          </button>
          <button
            onClick={() => sessionManager.reloadSettings()}
            className="px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
          >
            Reload
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionDebug;
