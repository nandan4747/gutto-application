import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthProvider";
import type { StoredMessage } from "../../../../contexts/MessageProvider";
import { colorScheme } from "../../../theme/colorScheme";
import { Trash2, Copy } from "lucide-react";
import {
  deleteMessageApi,
  deleteFileMessageApi,
} from "../../../api/globalApiFetch";
import MessageContent from "./MessageContent";

interface Props {
  message: StoredMessage;
}

export default function MessageBubble({ message }: Props) {
  const { user } = useAuth();
  const currentUserId = (user as any)?.id ?? (user as any)?._id;

  const isOwn = String(message.senderId) === String(currentUserId);
  const isDeleted = Boolean(message.isDeleted);

  const [isDeleting, setIsDeleting] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const openMenuAt = (x: number, y: number) => {
    if (isDeleted) return;
    setMenuPos({ x, y });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;
    timerRef.current = setTimeout(() => openMenuAt(x, y), 500);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const x = e.clientX;
    const y = e.clientY;
    timerRef.current = setTimeout(() => openMenuAt(x, y), 500);
  };

  const clearHoldTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  // Right-click / long-press-equivalent on desktop can also open the menu directly
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    openMenuAt(e.clientX, e.clientY);
  };

  useEffect(() => {
    return () => clearHoldTimer();
  }, []);

  // Close on outside click / tap, or on Escape
  useEffect(() => {
    if (!menuPos) return;

    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuPos(null);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuPos(null);
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuPos]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      // File/image messages hit a separate route that also cleans up the
      // Supabase object; plain text messages don't need that step.
      if (message.type === "image" || message.type === "file") {
        await deleteFileMessageApi(message.messageId);
      } else {
        await deleteMessageApi(message.messageId);
      }
    } catch (error: any) {
      console.error("Delete failed:", error.message);
    } finally {
      setIsDeleting(false);
      setMenuPos(null);
    }
  };

  const handleCopy = async () => {
    try {
      const text = (message as any).content ?? (message as any).text ?? "";
      if (text) await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Copy failed:", error);
    } finally {
      setMenuPos(null);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isOwn ? "flex-end" : "flex-start",
        marginBottom: 8,
      }}
    >
      <div
        ref={bubbleRef}
        onMouseDown={handleMouseDown}
        onMouseUp={clearHoldTimer}
        onMouseLeave={clearHoldTimer}
        onTouchStart={handleTouchStart}
        onTouchEnd={clearHoldTimer}
        onContextMenu={handleContextMenu}
        style={{
          position: "relative",
          maxWidth: "60%",
          padding: "8px 12px",
          borderRadius: isOwn ? "16px 0px 16px 16px" : "0px 16px 16px 12px",
          background: isDeleted
            ? colorScheme.backgroundSecondary
            : isOwn
              ? colorScheme.primary
              : colorScheme.backgroundSecondary,
          color: isDeleted ? colorScheme.textSecondary : colorScheme.text,
          fontStyle: isDeleted ? "italic" : "normal",
          border: isDeleted ? "1px dashed rgba(255,255,255,0.15)" : "none",
          opacity: message.status === "sending" || isDeleting ? 0.6 : 1,
          userSelect: "none",
          cursor: !isDeleted ? "pointer" : "default",
        }}
      >
        <MessageContent message={message} isDeleted={isDeleted} />

        {isOwn && !isDeleted && (
          <div style={{ fontSize: 10, marginTop: 4, opacity: 0.8 }}>
            {message.status === "sending" && "Sending..."}
            {message.status === "failed" && "Failed to send"}
            {message.status === "sent" &&
              new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
          </div>
        )}
      </div>

      {/* Floating context menu */}
      {menuPos && (
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top: menuPos.y,
            left: menuPos.x,
            transform: "translate(-50%, -100%)",
            background: colorScheme.backgroundSecondary,
            border: `1px solid ${colorScheme.primary}33`,
            borderRadius: 10,
            boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
            padding: 4,
            zIndex: 1000,
            minWidth: 140,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <button onClick={handleCopy} style={menuItemStyle(colorScheme.text)}>
            <Copy size={14} /> Copy
          </button>

          {isOwn && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              style={menuItemStyle("#ff5c5c")}
            >
              <Trash2 size={14} />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function menuItemStyle(color: string): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 10px",
    background: "transparent",
    border: "none",
    borderRadius: 6,
    color,
    fontSize: 13,
    cursor: "pointer",
    textAlign: "left",
  };
}
