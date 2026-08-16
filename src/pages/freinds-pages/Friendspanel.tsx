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
import { useConnectedPeople } from "../../../contexts/RelationProvider";

interface PendingRequest {
  _id: string;
  senderId: { _id: string; username: string; fullname: string };
  createdAt: string;
}

type Tab = "friends" | "requests" | "blocked";

export default function FriendsPanel() {
  const { blockedUsers, setBlockedUsers } = useConversation();
  const { connections, setConnections } = useConnectedPeople();
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("friends");

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [connectionsData, requestsData] = await Promise.all([
        getConnections(),
        getPendingRequests(),
      ]);
      // CHANGED: Map keyed by _id instead of a Set — see RelationProvider
      // for why (correct dedup + O(1) lookup for group chat name resolution).
      setConnections(new Map(connectionsData.map((c: any) => [c._id, c])));
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

  // CHANGED: Array.from(connections.values()) instead of Array.from(connections)
  // — Map iterates as [key, value] pairs by default, .values() gives us
  // just the Connection objects, same as before.
  const filtered = Array.from(connections.values()).filter((c) => {
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
      getConnections()
        .then((data: any[]) =>
          setConnections(new Map(data.map((c) => [c._id, c]))),
        )
        .catch((err) => console.error("Failed to refresh connections:", err));
    }
  };

  const handleUnblocked = (userId: string) => {
    setBlockedUsers((prev) => prev.filter((u) => u._id !== userId));
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
                {connections.size === 0 ? "No friends yet" : "No matches"}
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