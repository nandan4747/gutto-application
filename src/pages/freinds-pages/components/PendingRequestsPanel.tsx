import { useState } from "react";
import { Check, X } from "lucide-react";
import { colorScheme } from "../../../theme/colorScheme";
import { approveFriendRequest, rejectFriendRequest } from "../api";
import { Avatar } from "../../../components/avatart_genrator/Avatar";
import styles from "../FriendsPanel.module.css";

interface PendingRequest {
  _id: string;
  senderId: { _id: string; username: string; fullname: string };
  createdAt: string;
}

interface Props {
  requests: PendingRequest[];
  loading: boolean;
  error: string | null;
  onResolved: (requestId: string, accepted: boolean) => void;
}

export default function PendingRequestsPanel({
  requests,
  loading,
  error,
  onResolved,
}: Props) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleDecision = async (
    requestId: string,
    action: "approve" | "reject",
  ) => {
    setProcessingId(requestId);
    setActionError(null);
    try {
      if (action === "approve") {
        await approveFriendRequest(requestId);
      } else {
        await rejectFriendRequest(requestId);
      }
      onResolved(requestId, action === "approve");
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className={styles.list}>
      {loading && <p className={styles.emptyText}>Loading requests...</p>}
      {error && <p className={styles.errorText}>{error}</p>}
      {actionError && <p className={styles.errorText}>{actionError}</p>}
      {!loading && !error && requests.length === 0 && (
        <p className={styles.emptyText}>No pending requests</p>
      )}

      {requests.map((req) => (
        <div key={req._id} className={styles.card}>
          <Avatar
            name={req.senderId.fullname || req.senderId.username}
            size={44}
          />
          <div className={styles.cardInfo}>
            <div
              style={{ color: colorScheme.text }}
              className={styles.cardName}
            >
              {req.senderId.fullname}
            </div>
            <div
              style={{ color: colorScheme.textSecondary }}
              className={styles.cardUsername}
            >
              @{req.senderId.username}
            </div>
          </div>
          <div className={styles.requestActions}>
            <button
              className={styles.iconButtonAccept}
              disabled={processingId === req._id}
              onClick={() => handleDecision(req._id, "approve")}
              aria-label="Accept request"
            >
              <Check size={16} />
            </button>
            <button
              className={styles.iconButtonReject}
              disabled={processingId === req._id}
              onClick={() => handleDecision(req._id, "reject")}
              aria-label="Reject request"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
