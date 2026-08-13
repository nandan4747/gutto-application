import { useEffect, useRef } from "react";
import { useMessages } from "../../../../contexts/MessageProvider";
import { getChatHistory, markAsRead } from "../api";
import { normalizeChatHistory } from "../utils/normalize";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import styles from "../Chat.module.css";

import { Avatar } from "../../../components/avatart_genrator/Avatar";
import { colorScheme } from "../../../theme/colorScheme";

interface Props {
  conversationId: string | null;
  onSendMessage: (params: {
    receiverId: string;
    text: string;
    isGroup: boolean;
  }) => void;
  onBack: () => void;
}

export default function ChatWindow({
  conversationId,
  onSendMessage,
  onBack,
}: Props) {
  const { state, setActiveConversation, markConversationRead, loadHistory } =
    useMessages();

  // Tracks which conversations we've already fetched full history for,
  // so re-selecting the same chat doesn't refire the request.
  const loadedHistoryRef = useRef(new Set<string>());

  useEffect(() => {
    setActiveConversation(conversationId);

    if (!conversationId) return;

    const entry = state[conversationId];

    if (entry && entry.unreadedCount > 0) {
      markAsRead(conversationId).catch((err) =>
        console.error("Failed to mark as read:", err),
      );
      markConversationRead(conversationId);
    }

    if (!loadedHistoryRef.current.has(conversationId)) {
      loadedHistoryRef.current.add(conversationId);
      getChatHistory(conversationId)
        .then((raw) => loadHistory(conversationId, normalizeChatHistory(raw)))
        .catch((err) => {
          console.error("Failed to load chat history:", err);
          loadedHistoryRef.current.delete(conversationId); // allow retry
        });
    }

    return () => setActiveConversation(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  if (!conversationId) {
    return (
      <div className={styles.emptyState}>
        Select a conversation to start chatting
      </div>
    );
  }

  const entry = state[conversationId];
  const displayName =
    entry?.type === "dm"
      ? (entry.participant?.fullname ?? entry.participant?.username)
      : entry?.groupInfo?.name;

  return (
    <>
      <div
        style={{
          padding: 8,
          width: "100%",
          display: "flex",
          background: colorScheme.background,
          alignItems: "center",
          gap: 12,

          borderBottom: `1px solid ${colorScheme.border}`,
        }}
      >
        <button
          style={{ color: colorScheme.text }}
          className={styles.backButton}
          onClick={onBack}
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
            className="lucide lucide-chevron-left-icon lucide-chevron-left"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <Avatar name={displayName || "Unknown"} size={50} />
        {displayName}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {entry?.messageList.map((message) => (
          <MessageBubble key={message.messageId} message={message} />
        ))}
      </div>
      <MessageInput
        onSend={(text) =>
          onSendMessage({
            receiverId: conversationId,
            text,
            isGroup: entry?.type === "group",
          })
        }
      />
    </>
  );
}
