import React from "react";
import AppLogo from "../../assets/logo-bg-no.png";
import { useNavigationView } from "../../../contexts/Navigationprovider";
import { useUIContext } from "../../../contexts/UIContextProvider";
import styles from "./MobileLayout.module.css";
import { Info } from "lucide-react";
import { colorScheme } from "../../theme/colorScheme";
import { useNavigate } from "react-router-dom";
import { ThemeToggleButton } from "../toggle_btn/ThemeToggleButton";
import voiceLogo from "../../assets/logo_voice_.png";

const MobileHeader: React.FC = () => {
  const { canShowAppHeader, setCanShowAppHeader } = useUIContext();
  const { activeView } = useNavigationView();
  const nav = useNavigate();

  const viewTitle = activeView.charAt(0).toUpperCase() + activeView.slice(1);

  if (!canShowAppHeader) return null;

  return (
    <header
      className={styles.mobileHeader}
      style={{
        color: colorScheme.text,
        background: colorScheme.background,
        borderColor: colorScheme.border,
      }}
    >
      <div className={styles.brand}>
        <img src={AppLogo} alt="EN SAMACHARA Logo" className={styles.logo} />
        <h1 className={styles.brandTitle} style={{ color: colorScheme.text }}>
          EN SAMACHARA
        </h1>
        <span className={styles.separator}>/</span>
        <span className={styles.viewBreadcrumb}>{viewTitle}</span>
      </div>

      <div
        onClick={() => {
          nav("/about");
          setCanShowAppHeader(false);
        }}
      >
        <Info style={{ color: colorScheme.text }} size={15}></Info>
      </div>
      <div>
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
      </div>

      <ThemeToggleButton />
    </header>
  );
};

export default MobileHeader;
