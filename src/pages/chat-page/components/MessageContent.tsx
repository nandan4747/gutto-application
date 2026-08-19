import type { CSSProperties } from "react";
import { FileText, Download } from "lucide-react";
import type { StoredMessage } from "../../../../contexts/MessageProvider";

interface Props {
  message: StoredMessage;
  isDeleted: boolean;
}

// Shared by MessageBubble (DM) and GroupChatBubble (group) — the "what does
// this message actually look like" logic is identical for both, only the
// surrounding bubble chrome (sender name, alignment, etc.) differs.
export default function MessageContent({ message, isDeleted }: Props) {
  if (isDeleted) {
    return (
      <div>
        <span style={{ marginRight: 6 }}>🚫</span>
        {message.text}
      </div>
    );
  }

  if (message.type === "image") {
    // While uploading, `url` is a local blob preview created client-side;
    // once confirmed it's swapped for the real Supabase URL — same <img>
    // either way.
    if (!message.url) return <div>{message.text || "Photo"}</div>;

    return (
      <div>
        <a href={message.url} target="_blank" rel="noopener noreferrer">
          <img
            src={message.url}
            alt={message.fileName ?? "image"}
            style={{
              maxWidth: 240,
              maxHeight: 240,
              borderRadius: 8,
              display: "block",
              objectFit: "cover",
            }}
          />
        </a>
        {message.text && <div style={{ marginTop: 6 }}>{message.text}</div>}
      </div>
    );
  }

  if (message.type === "file") {
    // Non-image files have no local preview, so `url` is only known once
    // the upload confirms — render a non-clickable placeholder chip until
    // then (the "Sending..." status line below already covers the wait).
    const chip = (
      <>
        <FileText size={20} />
        <span
          style={{
            maxWidth: 160,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {message.fileName ?? "Attachment"}
        </span>
        {message.url && (
          <Download size={16} style={{ marginLeft: "auto", flexShrink: 0 }} />
        )}
      </>
    );

    const chipStyle: CSSProperties = {
      display: "flex",
      alignItems: "center",
      gap: 8,
      color: "inherit",
      textDecoration: "none",
      background: "rgba(0,0,0,0.15)",
      borderRadius: 8,
      padding: "8px 10px",
    };

    return (
      <div>
        {message.url ? (
          <a
            href={message.url}
            target="_blank"
            rel="noopener noreferrer"
            download={message.fileName}
            style={chipStyle}
          >
            {chip}
          </a>
        ) : (
          <div style={chipStyle}>{chip}</div>
        )}
        {message.text && <div style={{ marginTop: 6 }}>{message.text}</div>}
      </div>
    );
  }

  return <div>{message.text}</div>;
}
