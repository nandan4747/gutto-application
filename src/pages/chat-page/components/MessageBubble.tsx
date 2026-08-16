import { useAuth } from "../../../../contexts/AuthProvider";
import type { StoredMessage } from "../../../../contexts/MessageProvider";
import { colorScheme } from "../../../theme/colorScheme";

interface Props {
  message: StoredMessage;
}

export default function MessageBubble({ message }: Props) {
  const { user } = useAuth();
  const currentUserId = (user as any)?.id ?? (user as any)?._id;

  const isOwn = String(message.senderId) === String(currentUserId);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isOwn ? "flex-end" : "flex-start",
        marginBottom: 8,
      }}
    >
      <div
        style={{
          maxWidth: "60%",
          padding: "8px 12px",
          borderRadius: 12,
          background: isOwn
            ? colorScheme.primary
            : colorScheme.backgroundSecondary,
          color: isOwn ? colorScheme.text : colorScheme.text,
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
