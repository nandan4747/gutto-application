import { Avatar } from "../avatart_genrator/Avatar";

interface MessageToastCardProps {
  senderName: string;
  messageText: string;
}

export default function MessageToastCard({
  senderName,
  messageText,
}: MessageToastCardProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "4px 0",
        maxWidth: "280px", // Keeps the toast from turning into a billboard
      }}
    >
      <Avatar name={senderName} size={36} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          overflow: "hidden", // Required for the text ellipsis to work
        }}
      >
        <span
          style={{
            fontWeight: 600,
            fontSize: "14px",
            color: "inherit",
            marginBottom: "2px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {senderName}
        </span>
        <span
          style={{
            fontSize: "13px",
            opacity: 0.8, // Slightly dimmed text for that premium feel
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {messageText}
        </span>
      </div>
    </div>
  );
}
