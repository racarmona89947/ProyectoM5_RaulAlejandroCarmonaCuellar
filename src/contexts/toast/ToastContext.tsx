import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { ToastContext } from "./toastContextStore";

export type ToastVariant = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, message, variant }]);
      window.setTimeout(
        () =>
          setToasts((current) => current.filter((toast) => toast.id !== id)),
        4000,
      );
    },
    [],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-label="Notificaciones"
        className="fixed bottom-4 right-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3"
        role="region"
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={() =>
              setToasts((current) =>
                current.filter((item) => item.id !== toast.id),
              )
            }
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  const styles: Record<ToastVariant, string> = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    error: "border-red-200 bg-red-50 text-red-900",
    info: "border-sky-200 bg-sky-50 text-sky-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
  };
  const icons: Record<ToastVariant, string> = {
    success: "✓",
    error: "!",
    info: "i",
    warning: "!",
  };

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-4 shadow-xl ${styles[toast.variant]}`}
      role="status"
    >
      <span
        aria-hidden="true"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-current/10 font-bold"
      >
        {icons[toast.variant]}
      </span>
      <p className="flex-1 text-sm font-semibold leading-6">{toast.message}</p>
      <button
        aria-label="Cerrar notificación"
        className="text-lg leading-none opacity-60 transition hover:opacity-100"
        onClick={onClose}
        type="button"
      >
        ×
      </button>
    </div>
  );
}
