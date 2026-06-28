import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "info" | "success" | "warning" | "error";

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

const ICON_MAP: Record<ToastType, typeof Info> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

const COLOR_MAP: Record<ToastType, string> = {
  info: "border-blue-500",
  success: "border-green-500",
  warning: "border-yellow-500",
  error: "border-red-500",
};

const ICON_COLOR_MAP: Record<ToastType, string> = {
  info: "text-blue-400",
  success: "text-green-400",
  warning: "text-yellow-400",
  error: "text-red-400",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2">
        {toasts.map((toast) => {
          const Icon = ICON_MAP[toast.type];
          return (
            <div
              key={toast.id}
              className={`flex items-center gap-2 rounded border-l-4 bg-panel px-3 py-2 shadow-lg animate-slide-in ${COLOR_MAP[toast.type]}`}
            >
              <Icon size={16} className={ICON_COLOR_MAP[toast.type]} />
              <span className="text-sm text-text-primary">{toast.message}</span>
              <button
                className="ml-2 rounded p-0.5 text-text-muted hover:text-text-primary"
                onClick={() => dismiss(toast.id)}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
