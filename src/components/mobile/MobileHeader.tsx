import React from "react";
import AppLogo from "../../assets/applogo.png";
import { useNavigationView } from "../../../contexts/Navigationprovider";
import { useUIContext } from "../../../contexts/UIContextProvider";
import styles from "./MobileLayout.module.css";

const MobileHeader: React.FC = () => {
  const { canShowAppHeader } = useUIContext();
  const { activeView } = useNavigationView();

  const viewTitle = activeView.charAt(0).toUpperCase() + activeView.slice(1);

  if (!canShowAppHeader) return null;

  return (
    <header className={styles.mobileHeader}>
      <div className={styles.brand}>
        <img src={AppLogo} alt="EN SAMACHARA Logo" className={styles.logo} />
        <h1 className={styles.brandTitle}>EN SAMACHARA</h1>
        <span className={styles.separator}>/</span>
        <span className={styles.viewBreadcrumb}>{viewTitle}</span>
      </div>
    </header>
  );
};

export default MobileHeader;
