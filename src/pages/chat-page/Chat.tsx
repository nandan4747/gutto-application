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
import { useNavigationView } from "../../../contexts/Navigationprovider";
import FriendsPanel from "../freinds-pages/Friendspanel";
import { useConversation } from "../../../contexts/ConversationContext";
import ProfilePanel from "../freinds-pages/components/ProfilePanel";
import GroupChatPanel from "../group-chat/GroupChatPanel";
import GroupChatWindow from "../group-chat/components/GroupChatWindow";

export default function Chat() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { hydrateConversations, applyUnreadCounts } = useMessages();
  const { sendMessage } = useChatSocket();
  const { activeView } = useNavigationView();
  const {
    selectedConversationId,
    setSelectedConversationId,
    selectedUserProfile,
    setSelectedUserProfile,
  } = useConversation();

  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user === null) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Chats, Friends, and Group chat currently share the same
  // selectedConversationId/selectedUserProfile state (ConversationContext
  // isn't view-scoped). Without this, leaving a DM open and switching to
  // "Group chat" would try to render that DM's id as a group. Clearing on
  // every view switch keeps each tab starting from its own empty state.
  useEffect(() => {
    setSelectedConversationId(null);
    setSelectedUserProfile(null);
  }, [activeView, setSelectedConversationId, setSelectedUserProfile]);


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
  // instead of both panes at once. Extended to cover "groups" too — a
  // selected group behaves the same as a selected DM conversation here.
  const pageClassName = [
    styles.chatPage,
    (activeView === "chats" && selectedConversationId) ||
      (activeView === "friends" && selectedUserProfile) ||
      (activeView === "groups" && selectedConversationId)
      ? styles.conversationSelected
      : "",
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
        {activeView === "friends" ? (
          <FriendsPanel />
        ) : activeView === "groups" ? (
          <GroupChatPanel
            selectedConversationId={selectedConversationId}
            onSelect={setSelectedConversationId}
          />
        ) : (
          <ConversationList
            selectedConversationId={selectedConversationId}
            onSelect={setSelectedConversationId}
          />
        )}
      </div>
      <div className={styles.chatPane}>
        {activeView === "friends" && selectedUserProfile ? (
          <ProfilePanel />
        ) : activeView === "groups" ? (
          <GroupChatWindow
            conversationId={selectedConversationId}
            onSendMessage={sendMessage}
            onBack={() => setSelectedConversationId(null)}
          />
        ) : (
          <ChatWindow
            conversationId={selectedConversationId}
            onSendMessage={sendMessage}
            onBack={() => setSelectedConversationId(null)}
          />
        )}
      </div>
    </div>
  );
}