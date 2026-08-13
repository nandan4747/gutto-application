import { useState } from "react";
import { colorScheme } from "../../../theme/colorScheme";
interface Props {
  onSend: (text: string) => void;
}

export default function MessageInput({ onSend }: Props) {
  const [text, setText] = useState("");

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <div
      style={{
        display: "flex",
        padding: 12,
        borderTop: `1px solid ${colorScheme.border}`,
      }}
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSend();
        }}
        placeholder="Type a message..."
        style={{
          flex: 1,
          padding: "14px 16px",
          borderRadius: 8,
          border: `1px solid ${colorScheme.border}`,
          background: colorScheme.background,
          color: colorScheme.text,
        }}
      />
      <button
        style={{
          marginLeft: 8,
          padding: "0px 26px",
          background: colorScheme.primary,
          color: colorScheme.text,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "none",
          borderRadius: 16,
          cursor: "pointer",
        }}
        onClick={handleSend}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-send-icon lucide-send"
        >
          <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
          <path d="m21.854 2.147-10.94 10.939" />
        </svg>
      </button>
    </div>
  );
}
