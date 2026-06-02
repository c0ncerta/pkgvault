"use client";

import { IconAlertTriangle, IconCheck, IconX } from "@/components/ui/icons";
import { type ReactNode, createContext, useCallback, useContext, useState } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  exiting?: boolean;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const icons: Record<ToastType, ReactNode> = {
  success: <IconCheck size={14} />,
  error: <IconX size={14} />,
  info: <span style={{ fontWeight: 700, fontSize: "var(--fs-base)" }}>ℹ</span>,
  warning: <IconAlertTriangle size={14} />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 250);
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      // Auto-dismiss after 4s
      setTimeout(() => removeToast(id), 4000);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast toast-${t.type} ${t.exiting ? "exiting" : ""}`}
            role="alert"
          >
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: "var(--fs-base)",
                fontWeight: 700,
                background:
                  t.type === "success"
                    ? "rgba(34,197,94,0.15)"
                    : t.type === "error"
                      ? "rgba(239,68,68,0.15)"
                      : t.type === "warning"
                        ? "rgba(245,158,11,0.15)"
                        : "rgba(99,102,241,0.15)",
                color:
                  t.type === "success"
                    ? "var(--color-success)"
                    : t.type === "error"
                      ? "var(--color-danger)"
                      : t.type === "warning"
                        ? "var(--color-warning)"
                        : "var(--color-accent)",
              }}
            >
              {icons[t.type]}
            </span>
            <span style={{ flex: 1 }}>{t.message}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeToast(t.id);
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--color-text-muted)",
                cursor: "pointer",
                fontSize: "var(--fs-sm)",
                padding: 4,
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
