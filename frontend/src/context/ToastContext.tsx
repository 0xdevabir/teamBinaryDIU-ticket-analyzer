import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const styles = {
  success:
    "border-neutral-200 bg-white text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white",
  error:
    "border-red-200 bg-white text-red-800 dark:border-red-900 dark:bg-neutral-900 dark:text-red-400",
  info: "border-neutral-200 bg-white text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center gap-2 rounded-md border px-4 py-3 text-sm font-medium shadow-saas-md ${styles[t.type]}`}
            >
              <Icon size={16} className="shrink-0" />
              <span>{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="ml-2 opacity-60 hover:opacity-100">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
