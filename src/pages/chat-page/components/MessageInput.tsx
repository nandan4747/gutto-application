import { useState } from "react";
import { colorScheme } from "../../../theme/colorScheme";
import { Send } from 'lucide-react';
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
        <Send />
      </button>
    </div>
  );
}
