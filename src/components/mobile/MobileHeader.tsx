import React from "react";
import AppLogo from "../../../public/applogo.png";
import { useNavigationView } from "../../../contexts/Navigationprovider";
import { colorScheme } from "../../theme/colorScheme";
import { useUIContext } from "../../../contexts/UIContextProvider";
import styles from "./MobileLayout.module.css";

const MobileHeader: React.FC = () => {
  const { canShowAppHeader } = useUIContext();
  const { activeView } = useNavigationView();

  // Capitalize the first letter so "chats" becomes "Chats"
  const viewTitle = activeView.charAt(0).toUpperCase() + activeView.slice(1);

  return (
    <>
      {canShowAppHeader && (
        <div
          className={styles.mobileHeader}
          style={{
            backgroundColor: colorScheme.background,
            borderBottom: `1px solid ${colorScheme.border}`,
          }}
        >
          <div className={styles.brand}>
            <img
              src={AppLogo}
              alt="EN SAMACHARA Logo"
              className={styles.logo}
            />
            <h1>EN SAMACHARA</h1>
          </div>
          <div
            className={styles.activeTabTitle}
            style={{ color: colorScheme.textSecondary }}
          >
            {viewTitle}
          </div>
        </div>
      )}
    </>
  );
};

export default MobileHeader;
