import { useEffect, useRef, useCallback } from "react";
import { useMessages } from "../../../../contexts/MessageProvider";
import { useConnectedPeople } from "../../../../contexts/RelationProvider";
import { getGroupMessages } from "../Api";
import { normalizeGroupMessagesPage } from "../utils/normalize";
import GroupChatBubble from "./GroupChatBubble";
import MessageInput from "../../chat-page/components/MessageInput";
import styles from "../../chat-page/Chat.module.css";
import { Avatar } from "../../../components/avatart_genrator/Avatar";
import { colorScheme } from "../../../theme/colorScheme";

interface Props {
  conversationId: string | null; // groupId
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

export default function GroupChatWindow({
  conversationId,
  onSendMessage,
  onBack,
}: Props) {
  const { state, setActiveConversation, loadHistory, prependHistory } =
    useMessages();
  const { mergeConnections } = useConnectedPeople();

  const loadedInitialRef = useRef(new Set<string>());
  const paginationRef = useRef<Record<string, PaginationState>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveConversation(conversationId);

    if (!conversationId) return;

    if (!loadedInitialRef.current.has(conversationId)) {
      loadedInitialRef.current.add(conversationId);
      getGroupMessages(conversationId)
        .then((raw) => {
          const { messages, nextCursor, senders } =
            normalizeGroupMessagesPage(raw);
          loadHistory(conversationId, messages);
          if (senders.length > 0) mergeConnections(senders);
          paginationRef.current[conversationId] = {
            nextCursor,
            hasMore: nextCursor !== null,
            isLoading: false,
          };
        })
        .catch((err) => {
          console.error("Failed to load group history:", err);
          loadedInitialRef.current.delete(conversationId);
        });
    }

    return () => setActiveConversation(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const loadOlderMessages = useCallback(async () => {
    if (!conversationId) return;

    const pageState = paginationRef.current[conversationId];
    if (!pageState || !pageState.hasMore || pageState.isLoading) return;

    pageState.isLoading = true;

    const el = scrollContainerRef.current;
    const prevScrollHeight = el?.scrollHeight ?? 0;

    try {
      const raw = await getGroupMessages(conversationId, {
        cursor: pageState.nextCursor,
      });
      const { messages, nextCursor, senders } = normalizeGroupMessagesPage(raw);

      prependHistory(conversationId, messages);
      if (senders.length > 0) mergeConnections(senders);

      paginationRef.current[conversationId] = {
        nextCursor,
        hasMore: nextCursor !== null,
        isLoading: false,
      };

      // Preserve scroll position — older messages were just inserted
      // ABOVE the current view, so without this the browser keeps
      // scrollTop fixed and the view jumps down by whatever was added.
      requestAnimationFrame(() => {
        if (el) {
          const newScrollHeight = el.scrollHeight;
          el.scrollTop = newScrollHeight - prevScrollHeight;
        }
      });
    } catch (err) {
      console.error("Failed to load older group messages:", err);
      pageState.isLoading = false;
    }
  }, [conversationId, prependHistory, mergeConnections]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    if (el.scrollTop < 150) {
      loadOlderMessages();
    }
  };

  if (!conversationId) {
    return (
      <div className={styles.emptyState}>Select a group to start chatting</div>
    );
  }

  const entry = state[conversationId];
  const groupName = entry?.groupInfo?.name ?? "Group";

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
        <Avatar name={groupName} size={50} />
        <div>
          <div>{groupName}</div>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{ flex: 1, overflowY: "auto", padding: 16 }}
      >
        {entry?.messageList.map((message) => (
          <GroupChatBubble key={message.messageId} message={message} />
        ))}
      </div>

      <MessageInput
        onSend={(text) =>
          onSendMessage({
            receiverId: conversationId,
            text,
            isGroup: true,
          })
        }
      />
    </>
  );
}
