import React from "react";
import styles from "./AppHeader.module.css";
import AppLogo from "../../assets/applogo.png";
import { colorScheme } from "../../theme/colorScheme";
import { BookUser, Users, MessageCircle } from "lucide-react";
import { useNavigationView } from "../../../contexts/Navigationprovider";

const AppHeader: React.FC = () => {
  const { activeView, setActiveView } = useNavigationView();

  const navItemStyle = (view: typeof activeView) => ({
    background: activeView === view ? colorScheme.selected : "transparent",
    cursor: "pointer",
    borderRadius: 8,
  });

  return (
    <div
      style={{
        backgroundColor: colorScheme.background,
        borderRight: `1px solid ${colorScheme.border}`,
      }}
      className={styles.sidebar}
    >
      <div className={styles.brandContainer}>
        <img src={AppLogo} alt="GUTTO Logo" className={styles.logo} />
        <h1 className={styles.appName}>GUTTO</h1>
      </div>

      <div
        className={styles.navActions}
        style={navItemStyle("chats")}
        onClick={() => setActiveView("chats")}
      >
        <MessageCircle className={styles.navOptions} size={24} />
        <p
          className={styles.nav_label}
          style={{ color: colorScheme.textSecondary }}
        >
          Chats
        </p>
      </div>

      <div
        className={styles.navActions}
        style={navItemStyle("friends")}
        onClick={() => setActiveView("friends")}
      >
        <BookUser className={styles.navOptions} size={24} />
        <p
          className={styles.nav_label}
          style={{ color: colorScheme.textSecondary }}
        >
          Friends
        </p>
      </div>

      <div
        className={styles.navActions}
        style={navItemStyle("groups")}
        onClick={() => setActiveView("groups")}
      >
        <Users className={styles.navOptions} size={24} />
        <p
          className={styles.nav_label}
          style={{ color: colorScheme.textSecondary }}
        >
          Group chat
        </p>
      </div>

      <div className={styles.actions}>
        <div className={styles.avatar}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="5" />
            <path d="M20 21a8 8 0 0 0-16 0" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default AppHeader;
