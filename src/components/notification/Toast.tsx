import { CheckCircle2, Info, AlertTriangle, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./Toast.module.css";

export type ToastType = "success" | "info" | "alert" | "error";

interface Props {
  type: ToastType;
  message: string;
  children?: ReactNode;
  leaving?: boolean;
  onDismiss: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

// Semantic colors, not theme colors — these need to read as "success"/
// "error" regardless of light/dark mode, same green/red/blue hexes
// already used elsewhere in the app (accept/reject buttons, toggles).
const TOAST_CONFIG: Record<
  ToastType,
  { icon: typeof CheckCircle2; color: string }
> = {
  success: { icon: CheckCircle2, color: "#22c55e" },
  info: { icon: Info, color: "#0a84ff" },
  alert: { icon: AlertTriangle, color: "#f59e0b" },
  error: { icon: XCircle, color: "#f87171" },
};

export default function Toast({
  type,
  message,
  children,
  leaving,
  onDismiss,
  onMouseEnter,
  onMouseLeave,
}: Props) {
  const { icon: Icon, color } = TOAST_CONFIG[type];

  return (
    <div
      className={`${styles.toast} ${leaving ? styles.leaving : styles.entering}`}
      onClick={onDismiss}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="status"
    >
      <Icon size={18} color={color} style={{ flexShrink: 0 }} />
      <span className={styles.message}>{message}</span>
      {children && (
        // stopPropagation so clicking custom content (a button, a link)
        // doesn't also dismiss the toast via the outer onClick
        <div
          className={styles.childrenSlot}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      )}
    </div>
  );
}
