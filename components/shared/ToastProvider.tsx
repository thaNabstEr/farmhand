"use client"

import * as React from "react"

export interface Toast {
  id: string;
  message: string;
  type?: "default" | "success" | "warning" | "error" | "info";
}

export interface ToastContextType {
  showToast: (message: string, type?: Toast["type"]) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const showToast = React.useCallback((message: string, type: Toast["type"] = "default") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container in bottom right */}
      <div className="fixed bottom-6 right-6 z-55 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => {
          let badgeColor = "bg-primary";
          if (toast.type === "error" || toast.type === "warning") {
            badgeColor = "bg-red-500";
          } else if (toast.type === "info") {
            badgeColor = "bg-blue-500";
          }
          
          return (
            <div
              key={toast.id}
              className="bg-card dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 text-xs px-4 py-3.5 rounded-card shadow-lg border border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between gap-3 pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-200"
            >
              <div className="flex items-center gap-2.5">
                <div className={`size-2 rounded-full ${badgeColor} animate-pulse shrink-0`} />
                <span className="font-semibold leading-tight">{toast.message}</span>
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-250 transition-colors p-0.5 shrink-0"
              >
                &times;
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export default ToastProvider;
