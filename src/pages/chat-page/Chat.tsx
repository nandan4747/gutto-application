import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthProvider";
import { useEffect, useState } from "react";
import { useMessages } from "../../../contexts/MessageProvider";
import { getConversations, getUnreadedMessages } from "./api";
import {
  normalizeConversations,
  normalizeUnreadCounts,
} from "./utils/normalize";
import { useChatSocket } from "./hooks/Usechatsocket";
import ConversationList from "./components/Conversationlist";
import ChatWindow from "./components/ChatWindow";
import styles from "./Chat.module.css";
import { colorScheme } from "../../theme/colorScheme";

export default function Chat() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { hydrateConversations, applyUnreadCounts } = useMessages();
  const { sendMessage } = useChatSocket();

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user === null) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    (async () => {
      try {
        const rawConversations = await getConversations();
        if (cancelled) return;
        hydrateConversations(normalizeConversations(rawConversations));

        const rawUnread = await getUnreadedMessages();
        if (cancelled) return;
        applyUnreadCounts(normalizeUnreadCounts(rawUnread));
      } catch (err) {
        console.error("Failed to load chat data:", err);
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, hydrateConversations, applyUnreadCounts]);

  if (authLoading || initialLoading) {
    return <div className={styles.loadingScreen}>Loading chats...</div>;
  }

  // On mobile, this class flips the layout to show only the chat pane
  // instead of both panes at once (see .conversationSelected in the CSS).
  const pageClassName = [
    styles.chatPage,
    selectedConversationId ? styles.conversationSelected : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      style={{
        backgroundColor: colorScheme.background,
        color: colorScheme.text,
      }}
      className={pageClassName}
    >
      <div className={styles.sidebarPane}>
        <p
          style={{
            padding: 10,
            fontSize: "large",
            fontWeight: 600,
            color: colorScheme.textSecondary,
          }}
        >
          FREINDS
        </p>
        <ConversationList
          selectedConversationId={selectedConversationId}
          onSelect={setSelectedConversationId}
        />
      </div>
      <div className={styles.chatPane}>
        <ChatWindow
          conversationId={selectedConversationId}
          onSendMessage={sendMessage}
          onBack={() => setSelectedConversationId(null)}
        />
      </div>
    </div>
  );
}
