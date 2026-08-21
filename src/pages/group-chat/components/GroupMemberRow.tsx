import { X } from "lucide-react";
import { Avatar } from "../../../components/avatart_genrator/Avatar";
import { colorScheme } from "../../../theme/colorScheme";
import { useResolvedUser } from "../hook/Useresolveduser";
import styles from "../GroupInfoPanel.module.css";
import { useConversation } from "../../../../contexts/ConversationContext";
import { useNavigationView } from "../../../../contexts/Navigationprovider";

interface Props {
  userId: string;
  isAdmin: boolean; // is THIS member the group's admin
  canRemove: boolean; // is the CURRENT user allowed to remove them
  onRemove: () => void;
}

export default function GroupMemberRow({
  userId,
  isAdmin,
  canRemove,
  onRemove,
}: Props) {
  const user = useResolvedUser(userId);
  const name = user?.fullname ?? user?.username ?? "...";
  const { setSelectedUserProfile } = useConversation();
  const { setActiveView } = useNavigationView();

  return (
    <div className={styles.memberRow}>
      <Avatar
        name={name === "..." ? "?" : name}
        size={40}
        onClick={async () => {
          if (user) {
            setSelectedUserProfile(user);
            setActiveView("friends");
          }
        }}
      />
      <div className={styles.memberInfo}>
        <div style={{ color: colorScheme.text }} className={styles.memberName}>
          {name}
          {isAdmin && <span className={styles.adminBadge}>Admin</span>}
        </div>
        {user?.username && (
          <div
            style={{ color: colorScheme.textSecondary }}
            className={styles.memberUsername}
          >
            @{user.username}
          </div>
        )}
      </div>
      {canRemove && (
        <button
          className={styles.removeButton}
          onClick={onRemove}
          aria-label={`Remove ${name}`}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
