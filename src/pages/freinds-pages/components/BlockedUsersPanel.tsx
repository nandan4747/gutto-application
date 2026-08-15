import { useState } from "react";
import { unblockUser } from "../api";
import { Avatar } from "../../../components/avatart_genrator/Avatar";
import { colorScheme } from "../../../theme/colorScheme";
import styles from "../FriendsPanel.module.css";
import type { UserInfo } from "../../../../contexts/ConversationContext";



interface Props {
  users: UserInfo[];
  loading: boolean;
  error: string | null;
  onUnblocked: (userId: string) => void;
}

export default function BlockedUsersPanel({ users, loading, error, onUnblocked }: Props) {
  const [processing, setProcessing] = useState<string | null>(null);

  const handleUnblock = async (userId: string, fullname: string) => {
    if (!window.confirm(`Are you sure you want to unblock ${fullname}?`)) return;

    setProcessing(userId);
    try {
      await unblockUser(userId);
      onUnblocked(userId);
    } catch (err: any) {
      alert(`Failed to unblock: ${err.message}`);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className={styles.list}>
      {loading && <p className={styles.emptyText}>Loading blocked users...</p>}
      {error && <p className={styles.errorText}>{error}</p>}
      {!loading && !error && users.length === 0 && (
        <p className={styles.emptyText}>No blocked users</p>
      )}

      {users.map((user) => (
        <div key={user._id} className={styles.card} style={{ cursor: 'default' }}>
          <Avatar name={user.fullname || user.username} size={44} />
          <div className={styles.cardInfo}>
            <div style={{ color: colorScheme.text }} className={styles.cardName}>
              {user.fullname}
            </div>
            <div
              style={{ color: colorScheme.textSecondary }}
              className={styles.cardUsername}
            >
              @{user.username}
            </div>
          </div>
          <button
            onClick={() => handleUnblock(user._id, user.fullname)}
            disabled={processing === user._id}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: `1px solid ${colorScheme.border}`,
              backgroundColor: 'transparent',
              color: colorScheme.text,
              cursor: processing === user._id ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              marginLeft: 'auto'
            }}
          >
            {processing === user._id ? 'Unblocking...' : 'Unblock'}
          </button>
        </div>
      ))}
    </div>
  );
}
