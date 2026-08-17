import { useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthProvider";
import { useConnectedPeople } from "../../../../contexts/RelationProvider";
import { usePseudoConnection } from "../../../../contexts/PseudoConnectionContext"; // Make sure this path is right
import type { StoredMessage } from "../../../../contexts/MessageProvider";
import { colorScheme } from "../../../theme/colorScheme";

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

  // 1. Try the VIP list (Direct Connections)
  let sender = getConnection(rawSenderIdStr);

  // 2. Try the cache (Strangers we've already looked up)
  if (!sender && !isOwn) {
    sender = getCachedUser(rawSenderIdStr);
  }

  // 3. If they are a complete ghost, fetch them.
  // Because you built that sweet deduplication context, if 50 messages from
  // the same unknown user render at once, this fires 50 times but only
  // executes ONE network request. Glorious.
  useEffect(() => {
    if (!isOwn && !sender) {
      fetchUser(rawSenderIdStr);
    }
  }, [isOwn, sender, rawSenderIdStr, fetchUser]);

  // Fallbacks on fallbacks
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
        style={{
          maxWidth: "60%",
          padding: "8px 12px",
          borderRadius: 12,
          background: isOwn
            ? colorScheme.primary
            : colorScheme.backgroundSecondary,
          color: colorScheme.text,
          opacity: message.status === "sending" ? 0.6 : 1,
        }}
      >
        <div>{message.text}</div>
        {isOwn && (
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
    </div>
  );
}
