import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../../../contexts/AuthProvider";
import { useConnectedPeople } from "../../../../contexts/RelationProvider";
import { usePseudoConnection } from "../../../../contexts/PseudoConnectionContext";
import type { StoredMessage } from "../../../../contexts/MessageProvider";
import { colorScheme } from "../../../theme/colorScheme";
import {
  deleteMessageApi,
  deleteFileMessageApi,
} from "../../../api/globalApiFetch";
import MessageContent from "../../chat-page/components/MessageContent";

interface Props {
  message: StoredMessage;
}

export default function GroupChatBubble({ message }: Props) {
  const { user } = useAuth();
  const { getConnection } = useConnectedPeople();
  const { getCachedUser, fetchUser } = usePseudoConnection();

  const currentUserId = (user as any)?.id ?? (user as any)?._id;

  const rawSenderId =
    (message.senderId as any)?._id ??
    (message.senderId as any)?.id ??
    message.senderId;

  const rawSenderIdStr = String(rawSenderId);
  const isOwn = rawSenderIdStr === String(currentUserId);
  const isDeleted = Boolean(message.isDeleted);

  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  let sender = getConnection(rawSenderIdStr);

  if (!sender && !isOwn) {
    sender = getCachedUser(rawSenderIdStr);
  }

  useEffect(() => {
    if (!isOwn && !sender) {
      fetchUser(rawSenderIdStr);
    }
  }, [isOwn, sender, rawSenderIdStr, fetchUser]);

  const handleTouchStart = () => {
    if (!isOwn || isDeleted) return;
    timerRef.current = setTimeout(() => {
      setShowDelete((prev) => !prev);
    }, 500);
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

  const senderName = isOwn
    ? "You"
    : (sender?.fullname ?? sender?.username ?? "Unknown");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isOwn ? "flex-end" : "flex-start",
        marginBottom: 8,
      }}
    >
      {!isOwn && (
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: colorScheme.textSecondary,
            marginBottom: 2,
            marginLeft: 12,
          }}
        >
          {senderName}
        </div>
      )}
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
          borderRadius: 12,
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

        {showDelete && isOwn && !isDeleted && (
          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            style={{
              marginTop: 6,
              padding: "2px 8px",
              fontSize: 11,
              fontWeight: 600,
              color: "#fff",
              backgroundColor: "#e53e3e",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              display: "block",
            }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>
    </div>
  );
}
