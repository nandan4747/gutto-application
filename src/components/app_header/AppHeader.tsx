import styles from "./AppHeader.module.css";
import AppLogo from "../../assets/applogo.png";
import { colorScheme } from "../../theme/colorScheme";

const AppHeader = () => {
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
