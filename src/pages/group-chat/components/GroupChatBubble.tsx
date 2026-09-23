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
import { useToast } from "../../../../contexts/ToastProvider";
import { Copy, Trash2 } from "lucide-react";
import { Avatar } from "../../../components/avatart_genrator/Avatar";
import { useConversation } from "../../../../contexts/ConversationContext";
import { useNavigationView } from "../../../../contexts/Navigationprovider";

interface Props {
  message: StoredMessage;
}

export default function GroupChatBubble({ message }: Props) {
  const { user } = useAuth();
  const { getConnection } = useConnectedPeople();
  const { getCachedUser, fetchUser } = usePseudoConnection();
  const { setSelectedUserProfile } = useConversation();

  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);

  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { showToast } = useToast();
  const openMenuAt = (x: number, y: number) => {
    if (isDeleted) return;
    setMenuPos({ x, y });
  };

  const currentUserId = (user as any)?.id ?? (user as any)?._id;
  const { setActiveView } = useNavigationView();

  const rawSenderId =
    (message.senderId as any)?._id ??
    (message.senderId as any)?.id ??
    message.senderId;

  const rawSenderIdStr = String(rawSenderId);
  const isOwn = rawSenderIdStr === String(currentUserId);
  const isDeleted = Boolean(message.isDeleted);

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

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

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
      showToast({
        type: "error",
        message: error.message,
      });
    } finally {
      setIsDeleting(false);
      setMenuPos(null);
    }
  };

  const senderName = isOwn
    ? "You"
    : (sender?.fullname ?? sender?.username ?? "Unknown");

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
            display: "flex",
            gap: "5px",
            alignItems: "center",
            padding: "5px",
          }}
        >
          <Avatar
            name={senderName}
            size={24}
            onClick={async () => {
              let con: any;
              con = getCachedUser(rawSenderIdStr);
              setSelectedUserProfile(con);
              setActiveView("friends");
            }}
          />
          {senderName}
        </div>
      )}
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
          wordBreak: "break-word",
          overflowWrap: "anywhere",
          whiteSpace: "pre-wrap",
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
              onClick={handleDeleteClick}
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
