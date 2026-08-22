import {
  createContext,
  useContext,
  useCallback,
  useState,
  useRef,
  type ReactNode,
} from "react";
import Toast, { type ToastType } from "../src/components/notification/Toast";
import styles from "../src/components/notification/Toast.module.css";
// IMPORT YOUR SHINY NEW CARD HERE
import MessageToastCard from "../src/components/notification/MessageToastCard";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  children?: ReactNode;
  duration: number;
  leaving?: boolean;
  isMessage?: boolean; // <-- NEW FLAG
  senderName?: string; // <-- NEW DATA
}

interface ShowToastOptions {
  type?: ToastType;
  message: string;
  children?: ReactNode;
  duration?: number;
  isMessage?: boolean; // <-- NEW FLAG
  senderName?: string; // <-- NEW DATA
}

interface ToastContextValue {
  showToast: (options: ShowToastOptions) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const EXIT_ANIMATION_MS = 200;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    timersRef.current.delete(id);
  }, []);

  const dismissToast = useCallback(
    (id: string) => {
      const existingTimer = timersRef.current.get(id);
      if (existingTimer) clearTimeout(existingTimer);

      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
      );
      setTimeout(() => removeToast(id), EXIT_ANIMATION_MS);
    },
    [removeToast],
  );

  const showToast = useCallback(
    ({
      type = "info",
      message,
      children,
      duration = 3500,
      isMessage = false, // Default to false
      senderName,
    }: ShowToastOptions) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [
        ...prev,
        { id, type, message, children, duration, isMessage, senderName },
      ]);

      if (duration > 0) {
        const timer = setTimeout(() => dismissToast(id), duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [dismissToast],
  );

  const handleMouseEnter = (id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) clearTimeout(timer);
  };

  const handleMouseLeave = (toast: ToastItem) => {
    if (toast.duration > 0 && !toast.leaving) {
      const timer = setTimeout(() => dismissToast(toast.id), toast.duration);
      timersRef.current.set(toast.id, timer);
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div className={styles.toastStack}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            type={toast.type}
            // If it's a message, nuke the default text so it doesn't double-print
            message={toast.isMessage ? "" : toast.message}
            leaving={toast.leaving}
            onDismiss={() => dismissToast(toast.id)}
            onMouseEnter={() => handleMouseEnter(toast.id)}
            onMouseLeave={() => handleMouseLeave(toast)}
          >
            {/* The Magic Swap */}
            {toast.isMessage ? (
              <MessageToastCard
                senderName={toast.senderName ?? "Mysterious Stranger"}
                messageText={toast.message}
              />
            ) : (
              toast.children
            )}
          </Toast>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
