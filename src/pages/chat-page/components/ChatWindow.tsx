import { useEffect, useRef, useCallback } from "react";
import { useMessages } from "../../../../contexts/MessageProvider";
import { getChatHistory, markAsRead } from "../api";
import { normalizeChatHistoryPage } from "../utils/normalize";
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

interface PaginationState {
  nextCursor: string | null;
  hasMore: boolean;
  isLoading: boolean;
}

export default function ChatWindow({
  conversationId,
  onSendMessage,
  onBack,
}: Props) {
  const {
    state,
    setActiveConversation,
    markConversationRead,
    loadHistory,
    prependHistory,
  } = useMessages();

  // Tracks which conversations we've already fetched the FIRST page for,
  // so re-selecting the same chat doesn't refetch it.
  const loadedInitialRef = useRef(new Set<string>());

  // Per-conversation pagination bookkeeping (cursor / hasMore / in-flight
  // guard). Lives in a ref, not state — updating it shouldn't trigger a
  // re-render on its own, only the actual message list changing should.
  const paginationRef = useRef<Record<string, PaginationState>>({});

  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

    if (!loadedInitialRef.current.has(conversationId)) {
      loadedInitialRef.current.add(conversationId);
      getChatHistory(conversationId)
        .then((raw) => {
          const { messages, nextCursor } = normalizeChatHistoryPage(raw);
          // NOTE: loadHistory takes the message array itself, not the
          // {messages, nextCursor} wrapper — pass .messages here.
          loadHistory(conversationId, messages);
          paginationRef.current[conversationId] = {
            nextCursor,
            hasMore: nextCursor !== null,
            isLoading: false,
          };
        })
        .catch((err) => {
          console.error("Failed to load chat history:", err);
          loadedInitialRef.current.delete(conversationId); // allow retry
        });
    }

    return () => setActiveConversation(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const loadOlderMessages = useCallback(async () => {
    if (!conversationId) return;

    const pageState = paginationRef.current[conversationId];
    // No pagination state yet means the first page hasn't resolved.
    // Also bail if there's nothing more, or a fetch is already in flight.
    if (!pageState || !pageState.hasMore || pageState.isLoading) return;

    pageState.isLoading = true;

    const el = scrollContainerRef.current;
    const prevScrollHeight = el?.scrollHeight ?? 0;

    try {
      const raw = await getChatHistory(conversationId, {
        cursor: pageState.nextCursor,
      });
      const { messages, nextCursor } = normalizeChatHistoryPage(raw);

      prependHistory(conversationId, messages);
      paginationRef.current[conversationId] = {
        nextCursor,
        hasMore: nextCursor !== null,
        isLoading: false,
      };

      // Older messages just got inserted ABOVE the current scroll
      // position. Without this, the browser keeps scrollTop fixed and
      // the view visually jumps down by the height of what was added —
      // this restores the same messages the user was already looking at.
      requestAnimationFrame(() => {
        if (el) {
          const newScrollHeight = el.scrollHeight;
          el.scrollTop = newScrollHeight - prevScrollHeight;
        }
      });
    } catch (err) {
      console.error("Failed to load older messages:", err);
      pageState.isLoading = false;
    }
  }, [conversationId, prependHistory]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    // Trigger a bit before hitting the literal top so it feels
    // pre-emptive rather than snapping in after the user's already there.
    if (el.scrollTop < 150) {
      loadOlderMessages();
    }
  };

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
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <Avatar name={displayName || "Unknown"} size={50} />
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
      />
    </>
  );
}
