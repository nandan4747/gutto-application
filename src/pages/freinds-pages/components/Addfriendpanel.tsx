import { useEffect, useState } from "react";
import { ArrowLeft, Search, UserPlus, Check } from "lucide-react";
import { colorScheme } from "../../../theme/colorScheme";
import { searchUsers, sendFriendRequest } from "../api";
import { Avatar } from "../../../components/avatart_genrator/Avatar";
import styles from "../FriendsPanel.module.css";

interface SearchResult {
  _id: string;
  username: string;
  fullname: string;
  accountType: string;
}

interface Props {
  onClose: () => void;
}

export default function AddFriendPanel({ onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [sendingId, setSendingId] = useState<string | null>(null);

  // Debounced search — waits for the user to pause typing instead of
  // firing a request on every keystroke.
  useEffect(() => {
    const term = query.trim();
    if (!term) {
      setResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const data = await searchUsers(term);
        setResults(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSend = async (receiverId: string) => {
    setSendingId(receiverId);
    try {
      await sendFriendRequest(receiverId);
      setSentIds((prev) => new Set(prev).add(receiverId));
    } catch (err: any) {
      // Backend already gives useful messages here — "Request already
      // pending", "Unable to send connection request" (blocked/already
      // connected) — surface them as-is.
      setError(err.message);
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          onClick={onClose}
          className={styles.backIconButton}
          style={{ color: colorScheme.text }}
          aria-label="Back to friends list"
        >
          <ArrowLeft size={20} />
        </button>
        <p
          style={{ color: colorScheme.textSecondary }}
          className={styles.title}
        >
          Add Friend
        </p>
        <div style={{ width: 32 }} />{" "}
        {/* balances the back button for centering */}
      </div>

      <div
        className={styles.searchBar}
        style={{ borderColor: colorScheme.border }}
      >
        <Search size={16} color={colorScheme.textSecondary} />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by username or name..."
          style={{ color: colorScheme.text }}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.list}>
        {loading && <p className={styles.emptyText}>Searching...</p>}
        {error && <p className={styles.errorText}>{error}</p>}
        {!loading && query.trim() && results.length === 0 && !error && (
          <p className={styles.emptyText}>No users found</p>
        )}

        {results.map((person) => {
          const alreadySent = sentIds.has(person._id);
          return (
            <div key={person._id} className={styles.card}>
              <Avatar name={person.fullname || person.username} size={44} />
              <div className={styles.cardInfo}>
                <div
                  style={{ color: colorScheme.text }}
                  className={styles.cardName}
                >
                  {person.fullname}
                </div>
                <div
                  style={{ color: colorScheme.textSecondary }}
                  className={styles.cardUsername}
                >
                  @{person.username}
                </div>
              </div>
              <button
                className={styles.requestButton}
                disabled={alreadySent || sendingId === person._id}
                onClick={() => handleSend(person._id)}
                style={{
                  color: alreadySent ? colorScheme.textSecondary : "white",
                  background: alreadySent ? "transparent" : "#0a84ff",
                }}
                aria-label={
                  alreadySent ? "Request sent" : "Send friend request"
                }
              >
                {alreadySent ? <Check size={16} /> : <UserPlus size={16} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
