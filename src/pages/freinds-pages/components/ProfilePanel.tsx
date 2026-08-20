import { useState } from "react";
import { useConversation } from "../../../../contexts/ConversationContext";
import { useNavigationView } from "../../../../contexts/Navigationprovider";
import { unfriendUser, blockUser, unblockUser } from "../api";
import { Avatar } from "../../../components/avatart_genrator/Avatar";
import { colorScheme } from "../../../theme/colorScheme";
import styles from "../../chat-page/Chat.module.css";
import { useUIContext } from "../../../../contexts/UIContextProvider";

export default function ProfilePanel() {
  const {
    selectedUserProfile,
    setSelectedUserProfile,
    setSelectedConversationId,
    blockedUsers,
    setBlockedUsers,
  } = useConversation();
  const { setActiveView } = useNavigationView();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setCanShowAppHeader } = useUIContext();

  if (!selectedUserProfile) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: colorScheme.textSecondary,
        }}
      >
        Select a friend to view their profile.
      </div>
    );
  }

  const isBlocked = blockedUsers.some((u) => u._id === selectedUserProfile._id);

  const handleMessage = () => {
    // 1. Trigger the view change (which triggers the cleanup useEffect in Chat.tsx)
    setActiveView("chats");

    // 2. Wait for the dust to settle, THEN set the ID
    setTimeout(() => {
      setSelectedConversationId(selectedUserProfile._id);
    }, 0);
  };

  const handleUnfriend = async () => {
    if (
      !window.confirm(
        `Are you sure you want to unfriend ${selectedUserProfile.fullname}?`,
      )
    )
      return;
    setLoading(true);
    setError(null);
    try {
      await unfriendUser(selectedUserProfile._id);
      setSelectedUserProfile(null);
      // Typically we'd trigger a re-fetch of connections here, but user can also just see it removed.
      window.location.reload(); // Quick way to sync state for now
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockToggle = async () => {
    if (isBlocked) {
      if (
        !window.confirm(
          `Are you sure you want to unblock ${selectedUserProfile.fullname}?`,
        )
      )
        return;
      setLoading(true);
      setError(null);
      try {
        await unblockUser(selectedUserProfile._id);
        setBlockedUsers(
          blockedUsers.filter((u) => u._id !== selectedUserProfile._id),
        );
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      if (
        !window.confirm(
          `Are you sure you want to block ${selectedUserProfile.fullname}?`,
        )
      )
        return;
      setLoading(true);
      setError(null);
      try {
        await blockUser(selectedUserProfile._id);
        setBlockedUsers([...blockedUsers, selectedUserProfile]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: colorScheme.background,
        color: colorScheme.text,
      }}
    >
      {/* Mobile back button header */}
      <div
        style={{
          padding: "8px",
          borderBottom: `1px solid ${colorScheme.border}`,
        }}
        className={styles.backButton}
      >
        <button
          style={{
            color: colorScheme.text,
            display: "flex",
            alignItems: "center",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
          onClick={() => {
            setSelectedUserProfile(null);
            setCanShowAppHeader(true);
          }}
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
          <span style={{ marginLeft: "8px", fontSize: "16px" }}>Back</span>
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          flex: 1,
        }}
      >
        <Avatar
          name={selectedUserProfile.fullname || selectedUserProfile.username}
          size={120}
        />
        <h2
          style={{ marginTop: "24px", marginBottom: "8px", fontSize: "24px" }}
        >
          {selectedUserProfile.fullname}
        </h2>
        <p
          style={{
            color: colorScheme.textSecondary,
            marginBottom: "40px",
            fontSize: "16px",
          }}
        >
          @{selectedUserProfile.username}
        </p>

        {error && (
          <div style={{ color: "#ff453a", marginBottom: "20px" }}>{error}</div>
        )}

        <div style={{ display: "flex", gap: "16px" }}>
          <button
            onClick={handleMessage}
            disabled={loading}
            style={{
              padding: "12px 24px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#0a84ff",
              color: "white",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "15px",
              fontWeight: "bold",
            }}
          >
            Message
          </button>
          <button
            onClick={handleUnfriend}
            disabled={loading}
            style={{
              padding: "12px 24px",
              borderRadius: "8px",
              border: `1px solid ${colorScheme.border}`,
              backgroundColor: "transparent",
              color: colorScheme.text,
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "15px",
              fontWeight: "bold",
            }}
          >
            Unfriend
          </button>
          <button
            onClick={handleBlockToggle}
            disabled={loading}
            style={{
              padding: "12px 24px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: isBlocked ? "#333" : "#ff453a",
              color: "white",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "15px",
              fontWeight: "bold",
            }}
          >
            {isBlocked ? "Unblock" : "Block"}
          </button>
        </div>
      </div>
    </div>
  );
}
