import { useEffect, useState, useCallback, useRef } from "react";
import { Search, UserPlus } from "lucide-react";
import { colorScheme } from "../../theme/colorScheme";
import { getConnections, getPendingRequests, searchConnections } from "./api";
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

const PAGE_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 500;
const SCROLL_THRESHOLD_PX = 80;

export default function FriendsPanel() {
  const { blockedUsers, setBlockedUsers } = useConversation();
  const { connections, setConnections, mergeConnections } =
    useConnectedPeople();

  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("friends");

  // pagination
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  // remote fallback search
  const [remoteSearching, setRemoteSearching] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const listRef = useRef<HTMLDivElement | null>(null);

  const loadPendingRequests = useCallback(async () => {
    try {
      const requestsData = await getPendingRequests();
      setPendingRequests(requestsData.requests ?? []);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  // First page — gated on the context actually being empty.
  const loadInitial = useCallback(async () => {
    setLoading(true);
    try {
      const [connectionsRes] = await Promise.all([
        getConnections(undefined, PAGE_LIMIT),
        loadPendingRequests(),
      ]);
      setConnections(new Map(connectionsRes.data.map((c: any) => [c._id, c])));
      setCursor(connectionsRes.nextCursor);
      setHasNextPage(Boolean(connectionsRes.nextCursor));
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loadPendingRequests, setConnections]);

  useEffect(() => {
    if (connections.size === 0) {
      loadInitial();
    } else {
      // context already warm from a previous mount — skip /connections entirely
      setLoading(false);
      loadPendingRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasNextPage || loadingMore || !cursor) return;
    setLoadingMore(true);
    try {
      const res = await getConnections(cursor, PAGE_LIMIT);
      mergeConnections(res.data);
      setCursor(res.nextCursor);
      setHasNextPage(Boolean(res.nextCursor));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }, [cursor, hasNextPage, loadingMore, mergeConnections]);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD_PX) {
      loadMore();
    }
  }, [loadMore]);

  const filtered = Array.from(connections.values()).filter((c) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      c.username.toLowerCase().includes(term) ||
      c.fullname.toLowerCase().includes(term)
    );
  });

  // Local list has nothing for this term -> ask the server, scoped to
  // this user's own connections, then merge whatever comes back.
  useEffect(() => {
    const term = searchTerm.trim();
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (!term || filtered.length > 0) {
      setRemoteSearching(false);
      return;
    }

    searchDebounceRef.current = setTimeout(async () => {
      setRemoteSearching(true);
      try {
        const res = await searchConnections(term);
        if (res.data?.length) mergeConnections(res.data);
      } catch (err) {
        console.error("Friend search failed:", err);
      } finally {
        setRemoteSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const handleRequestResolved = (requestId: string, accepted: boolean) => {
    setPendingRequests((prev) => prev.filter((r) => r._id !== requestId));
    if (accepted) {
      getConnections(undefined, PAGE_LIMIT)
        .then((res: any) => mergeConnections(res.data))
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

          <div className={styles.list} ref={listRef} onScroll={handleScroll}>
            {loading && <p className={styles.emptyText}>Loading friends...</p>}
            {error && <p className={styles.errorText}>{error}</p>}
            {!loading && !error && filtered.length === 0 && (
              <p className={styles.emptyText}>
                {remoteSearching
                  ? "Searching..."
                  : connections.size === 0
                    ? "No friends yet"
                    : "No matches"}
              </p>
            )}
            {filtered.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
            {loadingMore && <p className={styles.emptyText}>Loading more...</p>}
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
