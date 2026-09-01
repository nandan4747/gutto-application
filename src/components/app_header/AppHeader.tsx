import React from "react";
import styles from "./AppHeader.module.css";
import AppLogo from "../../assets/logo-bg-no.png";
import { colorScheme } from "../../theme/colorScheme";
import { BookUser, Users, MessageCircle, Info } from "lucide-react";
import { useNavigationView } from "../../../contexts/Navigationprovider";
import { useUIContext } from "../../../contexts/UIContextProvider";
import { useNavigate } from "react-router-dom";
import { Avatar } from "../avatart_genrator/Avatar";
import { useAuth } from "../../../contexts/AuthProvider";
import { ThemeToggleButton } from "../toggle_btn/ThemeToggleButton";
import voiceLogo from "../../assets/logo_voice_.png";

const AppHeader: React.FC = () => {
  const { activeView, setActiveView } = useNavigationView();
  const { canShowDesktopHeader } = useUIContext();
  const { user } = useAuth();

  const currentUser = (user as any)?.fullname || "Un-known";
  const navItemStyle = (view: typeof activeView) => ({
    background: activeView === view ? colorScheme.selected : "transparent",
    cursor: "pointer",
    borderRadius: 8,
  });
  const nav = useNavigate();
  if (!canShowDesktopHeader) {
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: colorScheme.background,
        borderRight: `1px solid ${colorScheme.border}`,
      }}
      className={styles.sidebar}
    >
      <div className={styles.brandContainer}>
        <img src={AppLogo} alt="EN SAMACHARA Logo" className={styles.logo} />
        <h1 className={styles.appName} style={{ color: colorScheme.text }}>
          EN SAMACHARA
        </h1>
      </div>

      <div
        className={styles.navActions}
        style={navItemStyle("chats")}
        onClick={() => setActiveView("chats")}
      >
        <MessageCircle
          className={styles.navOptions}
          style={{
            background: colorScheme.backgroundTertiary,
            color: colorScheme.text,
          }}
          size={24}
        />
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
        <BookUser
          className={styles.navOptions}
          style={{
            background: colorScheme.backgroundTertiary,
            color: colorScheme.text,
          }}
          size={24}
        />
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
        <Users
          className={styles.navOptions}
          style={{
            background: colorScheme.backgroundTertiary,
            color: colorScheme.text,
          }}
          size={24}
        />
        <p
          className={styles.nav_label}
          style={{ color: colorScheme.textSecondary }}
        >
          Group chat
        </p>
      </div>

      <div className={styles.navActions} onClick={() => nav("/about")}>
        <Info
          className={styles.navOptions}
          style={{
            background: colorScheme.backgroundTertiary,
            color: colorScheme.text,
          }}
          size={24}
        />
        <p
          className={styles.nav_label}
          style={{ color: colorScheme.textSecondary }}
        >
          About
        </p>
      </div>

      <div className={styles.navActions}>
        <ThemeToggleButton />
        <p
          className={styles.nav_label}
          style={{ color: colorScheme.textSecondary }}
        >
          Theme
        </p>
      </div>

      <div className={styles.navActions}>
        <a
          href="https://voice-music.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            style={{ width: 40, height: 40 }}
            src={voiceLogo}
            alt="voice music"
          />
        </a>
        <p
          className={styles.nav_label}
          style={{ color: colorScheme.textSecondary }}
        >
          Voice Music
        </p>
      </div>

      <div className={styles.actions}>
        <div
          className={styles.avatar}
          onClick={() => setActiveView("profile")}
          style={{
            cursor: "pointer",
            outline: activeView === "profile" ? "2px solid #0a84ff" : "none",
          }}
        >
          <Avatar name={currentUser} size={38} />
        </div>
      </div>
    </div>
  );
};

export default AppHeader;
