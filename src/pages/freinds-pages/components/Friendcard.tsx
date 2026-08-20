import { Avatar } from "../../../components/avatart_genrator/Avatar";
import { colorScheme } from "../../../theme/colorScheme";
import styles from "../FriendsPanel.module.css";
import { useConversation } from "../../../../contexts/ConversationContext";
import { useUIContext } from "../../../../contexts/UIContextProvider";

interface Friend {
  _id: string;
  username: string;
  fullname: string;
  accountType: string;
}

export default function FriendCard({ friend }: { friend: Friend }) {
  const { setSelectedUserProfile, selectedUserProfile } = useConversation();
  const { setCanShowAppHeader } = useUIContext();

  const isSelected = selectedUserProfile?._id === friend._id;

  return (
    <div
      className={styles.card}
      onClick={() => {
        setCanShowAppHeader(false);
        setSelectedUserProfile(friend);
      }}
      style={{
        cursor: "pointer",
        backgroundColor: isSelected ? colorScheme.surface : "transparent",
      }}
    >
      <Avatar name={friend.fullname || friend.username} size={44} />
      <div className={styles.cardInfo}>
        <div style={{ color: colorScheme.text }} className={styles.cardName}>
          {friend.fullname}
        </div>
        <div
          style={{ color: colorScheme.textSecondary }}
          className={styles.cardUsername}
        >
          @{friend.username}
        </div>
      </div>
    </div>
  );
}
