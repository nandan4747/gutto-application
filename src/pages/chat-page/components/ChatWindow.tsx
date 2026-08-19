import { useEffect, useCallback, useRef } from "react";
import { useMessages } from "../../../../contexts/MessageProvider";
import { getChatHistory, markAsRead } from "../api";
import { normalizeChatHistoryPage } from "../utils/normalize";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import styles from "../Chat.module.css";
import { useConnectedPeople } from "../../../../contexts/RelationProvider";
import { usePseudoConnection } from "../../../../contexts/PseudoConnectionContext";

import { Avatar } from "../../../components/avatart_genrator/Avatar";
import { colorScheme } from "../../../theme/colorScheme";

interface Props {
  conversationId: string | null;
  onSendMessage: (params: {
    receiverId: string;
    text: string;
    isGroup: boolean;
  }) => void;
  onSendFile: (params: {
    receiverId: string;
    isGroup: boolean;
    file: File;
    caption?: string;
  }) => void;
  onBack: () => void;
}

export default function ChatWindow({
  conversationId,
  onSendMessage,
  onSendFile,
  onBack,
}: Props) {
  const {
    state,
    setActiveConversation,
    markConversationRead,
    loadHistory,
    prependHistory,
    hasLoadedInitial,
    markLoadedInitial,
    unmarkLoadedInitial,
    getPaginationState,
    setPaginationState,
  } = useMessages();

  // Only the scroll container stays local — it's a DOM handle for whichever
  // instance is currently mounted, there's nothing to preserve across remounts.
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { getConnection } = useConnectedPeople();
  const { getCachedUser, fetchUser } = usePseudoConnection();

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

    if (!hasLoadedInitial(conversationId)) {
      markLoadedInitial(conversationId);
      getChatHistory(conversationId)
        .then((raw) => {
          const { messages, nextCursor } = normalizeChatHistoryPage(raw);
          loadHistory(conversationId, messages);
          setPaginationState(conversationId, {
            nextCursor,
            hasMore: nextCursor !== null,
            isLoading: false,
          });
        })
        .catch((err) => {
          console.error("Failed to load chat history:", err);
          unmarkLoadedInitial(conversationId);
        });
    }

    return () => setActiveConversation(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const loadOlderMessages = useCallback(async () => {
    if (!conversationId) return;

    const pageState = getPaginationState(conversationId);
    if (!pageState || !pageState.hasMore || pageState.isLoading) return;

    setPaginationState(conversationId, { ...pageState, isLoading: true });

    const el = scrollContainerRef.current;
    const prevScrollHeight = el?.scrollHeight ?? 0;

    try {
      const raw = await getChatHistory(conversationId, {
        cursor: pageState.nextCursor,
      });
      const { messages, nextCursor } = normalizeChatHistoryPage(raw);

      prependHistory(conversationId, messages);
      setPaginationState(conversationId, {
        nextCursor,
        hasMore: nextCursor !== null,
        isLoading: false,
      });

      requestAnimationFrame(() => {
        if (el) {
          const newScrollHeight = el.scrollHeight;
          el.scrollTop = newScrollHeight - prevScrollHeight;
        }
      });
    } catch (err) {
      console.error("Failed to load older messages:", err);
      setPaginationState(conversationId, { ...pageState, isLoading: false });
    }
  }, [conversationId, prependHistory, getPaginationState, setPaginationState]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    if (el.scrollTop < 150) {
      loadOlderMessages();
    }
  };

  const entry = conversationId ? state[conversationId] : undefined;

  const knownConnection = conversationId
    ? (getConnection(conversationId) ?? getCachedUser(conversationId))
    : undefined;
  const knownName =
    entry?.type === "dm"
      ? (entry.participant?.fullname ??
        entry.participant?.username ??
        knownConnection?.fullname ??
        knownConnection?.username)
      : entry?.groupInfo?.name;

  useEffect(() => {
    if (!conversationId || entry?.type !== "dm" || knownName) return;
    fetchUser(conversationId);
  }, [conversationId, entry?.type, knownName, fetchUser]);

  if (!conversationId) {
    return (
      <div className={styles.emptyState}>
        Select a conversation to start chatting
      </div>
    );
  }

  const isResolving = entry?.type === "dm" && !knownName;
  const displayName = knownName ?? (isResolving ? "..." : "Unknown");

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
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <Avatar name={isResolving ? "?" : displayName} size={50} />
        {displayName}
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{ flex: 1, overflowY: "auto", padding: 16 }}
      >
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
        onSendFile={(file, caption) =>
          onSendFile({
            receiverId: conversationId,
            isGroup: entry?.type === "group",
            file,
            caption,
          })
        }
      />
    </>
  );
}
