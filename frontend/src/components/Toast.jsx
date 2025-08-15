import { useEffect, useState } from "react";

let toastId = 0;

// Global toast state
const toastState = {
  toasts: [],
  listeners: new Set(),
  add: (toast) => {
    const id = ++toastId;
    const newToast = { id, ...toast, timestamp: Date.now() };
    toastState.toasts.push(newToast);
    toastState.notify();
    return id;
  },
  remove: (id) => {
    toastState.toasts = toastState.toasts.filter((t) => t.id !== id);
    toastState.notify();
  },
  notify: () => {
    toastState.listeners.forEach((fn) => fn([...toastState.toasts]));
  },
};

// Hook to use toasts
export function useToast() {
  const [toasts, setToasts] = useState(toastState.toasts);

  useEffect(() => {
    toastState.listeners.add(setToasts);
    return () => toastState.listeners.delete(setToasts);
  }, []);

  return {
    toasts,
    toast: {
      success: (message, duration = 4000) => {
        const id = toastState.add({ type: "success", message });
        setTimeout(() => toastState.remove(id), duration);
        return id;
      },
      error: (message, duration = 6000) => {
        const id = toastState.add({ type: "error", message });
        setTimeout(() => toastState.remove(id), duration);
        return id;
      },
      info: (message, duration = 4000) => {
        const id = toastState.add({ type: "info", message });
        setTimeout(() => toastState.remove(id), duration);
        return id;
      },
    },
  };
}

// Toast component
export default function Toast() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto max-w-sm w-full rounded-lg shadow-lg p-4 transition-all duration-300 ${
            toast.type === "success"
              ? "bg-green-500 text-white"
              : toast.type === "error"
              ? "bg-red-500 text-white"
              : "bg-blue-500 text-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => toastState.remove(toast.id)}
              className="ml-3 text-white/80 hover:text-white text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
