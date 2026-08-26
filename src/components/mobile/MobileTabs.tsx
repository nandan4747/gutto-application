import React from "react";
import { MessageCircle, BookUser, Users, User } from "lucide-react";
import { useNavigationView } from "../../../contexts/Navigationprovider";
import styles from "./MobileLayout.module.css";
import { useUIContext } from "../../../contexts/UIContextProvider";
import { Avatar } from "../avatart_genrator/Avatar";
import { useAuth } from "../../../contexts/AuthProvider";
import { colorScheme } from "../../theme/colorScheme";

const TABS = [
  { id: "chats", label: "Chats", Icon: MessageCircle, needAvatar: false },
  { id: "friends", label: "Friends", Icon: BookUser, needAvatar: false },
  { id: "groups", label: "Groups", Icon: Users, needAvatar: false },
  { id: "profile", label: "Profile", Icon: User, needAvatar: true },
] as const;

const MobileTabs: React.FC = () => {
  const { activeView, setActiveView } = useNavigationView();
  const { canShowDesktopHeader, canShowTabs } = useUIContext();
  const { user } = useAuth();
  const currentUser = (user as any)?.fullname || "Un-known";

  if (!canShowDesktopHeader || !canShowTabs) {
    return null;
  }

  return (
    <nav
      style={{ background: colorScheme.backgroundGradient }}
      className={styles.mobileTabs}
    >
      {TABS.map(({ id, label, Icon, needAvatar }) => {
        const isActive = activeView === id;
        return (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            className={`${styles.tabButton} ${isActive ? styles.active : ""}`}
            aria-label={label}
          >
            {isActive && <span className={styles.activeIndicator} />}
            {!needAvatar && (
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.75} />
            )}
            {needAvatar && <Avatar name={currentUser} size={24} />}
          </button>
        );
      })}
    </nav>
  );
};

export default MobileTabs;
