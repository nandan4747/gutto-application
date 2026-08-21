import React from "react";
import { MessageCircle, BookUser, Users, User } from "lucide-react";
import { useNavigationView } from "../../../contexts/Navigationprovider";
import styles from "./MobileLayout.module.css";
import { useUIContext } from "../../../contexts/UIContextProvider";

const TABS = [
  { id: "chats", label: "Chats", Icon: MessageCircle },
  { id: "friends", label: "Friends", Icon: BookUser },
  { id: "groups", label: "Groups", Icon: Users },
  { id: "profile", label: "Profile", Icon: User },
] as const;

const MobileTabs: React.FC = () => {
  const { activeView, setActiveView } = useNavigationView();
  const { canShowDesktopHeader } = useUIContext();

  if (!canShowDesktopHeader) {
    return null;
  }

  return (
    <nav className={styles.mobileTabs}>
      {TABS.map(({ id, label, Icon }) => {
        const isActive = activeView === id;
        return (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            className={`${styles.tabButton} ${isActive ? styles.active : ""}`}
            aria-label={label}
          >
            {isActive && <span className={styles.activeIndicator} />}
            <Icon size={22} strokeWidth={isActive ? 2.2 : 1.75} />
          </button>
        );
      })}
    </nav>
  );
};

export default MobileTabs;
