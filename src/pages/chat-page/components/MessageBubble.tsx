import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthProvider";
import type { StoredMessage } from "../../../../contexts/MessageProvider";
import { colorScheme } from "../../../theme/colorScheme";
import { MessageCircleX } from "lucide-react";
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

  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = () => {
    if (!isOwn || isDeleted) return;
    timerRef.current = setTimeout(() => {
      setShowDelete((prev) => !prev);
    }, 500); // 500ms hold duration
  };

  const handleTouchEnd = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
      setShowDelete(false);
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
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
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
          cursor: isOwn && !isDeleted ? "pointer" : "default",
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

        {/* Delete Trigger Button */}
        {showDelete && isOwn && !isDeleted && (
          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            style={{
              marginTop: 6,
              padding: "2px 4px",

              backgroundColor: "transparent",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              display: "block",
              color: "white",
            }}
          >
            {isDeleting ? (
              "Deleting..."
            ) : (
              <MessageCircleX fill="red" stroke="white" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
