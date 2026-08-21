import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthProvider";
import { useEffect, useState } from "react";
import { useMessages } from "../../../contexts/MessageProvider";
import { getConversations } from "./api";
import { normalizeConversations } from "./utils/normalize";
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
import GroupInfoPanel from "../group-chat/GroupInfoPanel";
import ProfileSettingsPanel from "../profile-page/ProfileSettingsPanel";
import { useUIContext } from "../../../contexts/UIContextProvider";
import { HashLoader } from "react-spinners";
import { isUserAlreadyVisted } from "../../../utils/freshUser";

export default function Chat() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { hydrateConversations, applyUnreadCounts } = useMessages();
  const { sendMessage, sendFile } = useChatSocket();
  const { activeView } = useNavigationView();
  const {
    selectedConversationId,
    setSelectedConversationId,
    selectedUserProfile,
    setSelectedUserProfile,
    showGroupInfo,
    setShowGroupInfo,
  } = useConversation();

  const [initialLoading, setInitialLoading] = useState(true);

  const { setCanShowAppHeader } = useUIContext();

  useEffect(() => {
    //console.log("setting to true");
    setCanShowAppHeader(true);
    const userStuff = isUserAlreadyVisted();
    if (!userStuff) {
      navigate("/about");
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user === null) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (activeView !== "chats" && activeView !== "groups") {
      setSelectedConversationId(null);
    }

    if (activeView !== "friends") {
      setSelectedUserProfile(null);
    }

    if (activeView !== "groups") {
      setShowGroupInfo(false);
    }
  }, [
    activeView,
    setSelectedConversationId,
    setSelectedUserProfile,
    setShowGroupInfo,
  ]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    (async () => {
      try {
        const rawConversations = await getConversations();
        if (cancelled) return;
        hydrateConversations(normalizeConversations(rawConversations));
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
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          width: "100%",
          backgroundColor: colorScheme.background,
        }}
      >
        <HashLoader color={colorScheme.primary} />
      </div>
    );
  }

  if (activeView === "profile") {
    return (
      <div
        style={{
          backgroundColor: colorScheme.background,
          color: colorScheme.text,
          height: "100%",
        }}
      >
        <ProfileSettingsPanel />
      </div>
    );
  }

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
        ) : activeView === "groups" && showGroupInfo ? (
          <GroupInfoPanel />
        ) : activeView === "groups" ? (
          <GroupChatWindow
            conversationId={selectedConversationId}
            onSendMessage={sendMessage}
            onSendFile={sendFile}
            onBack={() => setSelectedConversationId(null)}
          />
        ) : (
          <ChatWindow
            conversationId={selectedConversationId}
            onSendMessage={sendMessage}
            onSendFile={sendFile}
            onBack={() => setSelectedConversationId(null)}
          />
        )}
      </div>
    </div>
  );
}
