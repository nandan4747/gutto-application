import { useEffect, useState, useCallback } from "react";
import { Search, UserPlus } from "lucide-react";
import { colorScheme } from "../../theme/colorScheme";
import { getConnections, getPendingRequests } from "./api";
import FriendCard from "./components/Friendcard";
import AddFriendPanel from "./components/Addfriendpanel";
import PendingRequestsPanel from "./components/PendingRequestsPanel";
import BlockedUsersPanel from "./components/BlockedUsersPanel";
import styles from "./FriendsPanel.module.css";
import { useConversation } from "../../../contexts/ConversationContext";

interface Connection {
  _id: string;
  username: string;
  fullname: string;
  accountType: string;
}

interface PendingRequest {
  _id: string;
  senderId: { _id: string; username: string; fullname: string };
  createdAt: string;
}

type Tab = "friends" | "requests" | "blocked";

export default function FriendsPanel() {
  const { blockedUsers, setBlockedUsers } = useConversation();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("friends");

  // Fetch both on mount — pending count is needed for the tab badge
  // regardless of which tab is currently active.
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [connectionsData, requestsData] = await Promise.all([
        getConnections(),
        getPendingRequests(),
      ]);
      setConnections(connectionsData);
      setPendingRequests(requestsData.requests ?? []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const filtered = connections.filter((c) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      c.username.toLowerCase().includes(term) ||
      c.fullname.toLowerCase().includes(term)
    );
  });

  const handleRequestResolved = (requestId: string, accepted: boolean) => {
    setPendingRequests((prev) => prev.filter((r) => r._id !== requestId));
    if (accepted) {
      // A newly-accepted request means a new connection now exists on
      // the backend — refetch so it shows up under the Friends tab
      // without the user needing to manually refresh.
      getConnections()
        .then(setConnections)
        .catch((err) => console.error("Failed to refresh connections:", err));
    }
  };

  const handleUnblocked = (userId: string) => {
    setBlockedUsers((prev) => prev.filter((u) => u._id !== userId));
    // The user might also want to reload connections if they become friends again,
    // but unblocking doesn't add to connections automatically.
  };

  if (isAdding) {
    return <AddFriendPanel onClose={() => setIsAdding(false)} />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p
          style={{ color: colorScheme.textSecondary }}
          className={styles.title}
        >
          Friends
        </p>
        <button
          className={styles.addButton}
          style={{ color: colorScheme.text }}
          onClick={() => setIsAdding(true)}
          aria-label="Add friend"
        >
          <UserPlus size={20} />
        </button>
      </div>

      <div className={styles.tabRow}>
        <button
          className={styles.tabButton}
          style={{
            color:
              activeTab === "friends"
                ? colorScheme.text
                : colorScheme.textSecondary,
            borderBottomColor:
              activeTab === "friends" ? "#0a84ff" : "transparent",
          }}
          onClick={() => setActiveTab("friends")}
        >
          Friends
        </button>
        <button
          className={styles.tabButton}
          style={{
            color:
              activeTab === "requests"
                ? colorScheme.text
                : colorScheme.textSecondary,
            borderBottomColor:
              activeTab === "requests" ? "#0a84ff" : "transparent",
          }}
          onClick={() => setActiveTab("requests")}
        >
          Requests
          {pendingRequests.length > 0 && (
            <span className={styles.badge}>{pendingRequests.length}</span>
          )}
        </button>
        <button
          className={styles.tabButton}
          style={{
            color:
              activeTab === "blocked"
                ? colorScheme.text
                : colorScheme.textSecondary,
            borderBottomColor:
              activeTab === "blocked" ? "#0a84ff" : "transparent",
          }}
          onClick={() => setActiveTab("blocked")}
        >
          Blocked
        </button>
      </div>

      {activeTab === "friends" && (
        <>
          <div
            className={styles.searchBar}
            style={{ borderColor: colorScheme.border }}
          >
            <Search size={16} color={colorScheme.textSecondary} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search friends..."
              style={{ color: colorScheme.text }}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.list}>
            {loading && <p className={styles.emptyText}>Loading friends...</p>}
            {error && <p className={styles.errorText}>{error}</p>}
            {!loading && !error && filtered.length === 0 && (
              <p className={styles.emptyText}>
                {connections.length === 0 ? "No friends yet" : "No matches"}
              </p>
            )}
            {filtered.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        </>
      )}

      {activeTab === "requests" && (
        <PendingRequestsPanel
          requests={pendingRequests}
          loading={loading}
          error={error}
          onResolved={handleRequestResolved}
        />
      )}

      {activeTab === "blocked" && (
        <BlockedUsersPanel
          users={blockedUsers}
          loading={loading}
          error={error}
          onUnblocked={handleUnblocked}
        />
      )}
    </div>
  );
}
