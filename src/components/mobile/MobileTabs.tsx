import React from "react";
import { BookUser, Users, MessageCircle, User } from "lucide-react";
import { useNavigationView } from "../../../contexts/Navigationprovider";
import { colorScheme } from "../../theme/colorScheme";
import styles from "./MobileLayout.module.css";

const MobileTabs: React.FC = () => {
  const { activeView, setActiveView } = useNavigationView();

  const getIconColor = (view: string) =>
    activeView === view ? "#3d5afe" : colorScheme.textSecondary; // Use your primary blue

  return (
    <div
      className={styles.mobileTabs}
      style={{
        backgroundColor: colorScheme.background,
        borderTop: `1px solid ${colorScheme.border}`,
      }}
    >
      <button
        onClick={() => setActiveView("chats")}
        className={styles.tabButton}
      >
        <MessageCircle size={26} color={getIconColor("chats")} />
      </button>

      <button
        onClick={() => setActiveView("friends")}
        className={styles.tabButton}
      >
        <BookUser size={26} color={getIconColor("friends")} />
      </button>

      <button
        onClick={() => setActiveView("groups")}
        className={styles.tabButton}
      >
        <Users size={26} color={getIconColor("groups")} />
      </button>

      <button
        onClick={() => setActiveView("profile")}
        className={styles.tabButton}
      >
        <User size={26} color={getIconColor("profile")} />
      </button>
    </div>
  );
};

export default MobileTabs;
