import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Swapped ShieldAlert for ShieldCheck because we are SECURE now (mostly)
import { ShieldCheck, Zap, Database, Cloud } from "lucide-react";
import { GradientBackground } from "../../components/background/GradientBackground";
import { colorScheme } from "../../theme/colorScheme";
import { useUIContext } from "../../../contexts/UIContextProvider";
import styles from "./About.module.css";
import { markUserAsVisted } from "../../../utils/freshUser";

export default function About() {
  const { setCanShowDesktopHeader } = useUIContext();
  const navigate = useNavigate();

  useEffect(() => {
    markUserAsVisted();
    setCanShowDesktopHeader(false);

    return () => {
      setCanShowDesktopHeader(true);
    };
  }, [setCanShowDesktopHeader]);

  return (
    <div className={styles.aboutPage}>
      {/* Background is now locked in a fixed wrapper behind everything */}
      <div className={styles.fixedBackground}>
        <GradientBackground />
      </div>

      {/* The container that handles the snap scrolling */}
      <div className={styles.scrollContainer}>
        {/* Slide 1: Introduction */}
        <section className={styles.snapSection}>
          <div className={styles.contentMax}>
            <header className={styles.header}>
              <h1 className={styles.title}>EN SAMACHARA</h1>
              <p
                className={styles.subtitle}
                style={{ color: colorScheme.textSecondary }}
              >
                A real-time MERN stack messaging experience.
              </p>
            </header>

            <div className={styles.section}>
              <h2>The Project</h2>
              <p>
                EN SAMACHARA is a full-stack portfolio project built to
                demonstrate seamless, real-time communication using WebSockets.
                It is designed to handle instant messaging and file sharing
                smoothly, showcasing modern web development practices from the
                ground up.
              </p>
            </div>
          </div>
        </section>

        {/* Slide 2: The Tech Stack */}
        <section className={styles.snapSection}>
          <div className={styles.contentMax}>
            <div className={styles.techGrid}>
              <div className={styles.techItem}>
                <Zap size={36} color={colorScheme.primary} />
                <div className={styles.techText}>
                  <h3>Socket.io</h3>
                  <p>
                    Powering the real-time engine to deliver messages instantly
                    without page refreshes.
                  </p>
                </div>
              </div>

              <div className={styles.techItem}>
                <Database size={36} color="#00ED64" />
                <div className={styles.techText}>
                  <h3>MongoDB Atlas</h3>
                  <p>
                    A scalable cloud database storing all user data and
                    conversation history.
                  </p>
                </div>
              </div>

              <div className={styles.techItem}>
                <Cloud size={36} color="#3ECF8E" />
                <div className={styles.techText}>
                  <h3>Supabase</h3>
                  <p>
                    Handling robust cloud storage for shared files, images, and
                    media attachments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Slide 3: The "We Have Encryption Now" Flex */}
        <section className={styles.snapSection}>
          <div className={styles.contentMax}>
            <div className={styles.warningBox}>
              <ShieldCheck
                size={36}
                color="#00ED64"
                className={styles.warningIcon}
              />
              <div className={styles.warningText}>
                <h3>Military-Grade(ish) Security</h3>
                <p>
                  We recently upgraded to{" "}
                  <strong>AES-256-GCM Server-Side Encryption!</strong>
                  Is it WhatsApp-level, NSA-proof, End-to-End encryption? No.
                  But is it a hell of a lot better than storing your texts in
                  plain text? Absolutely. Your messages are now locked down at
                  rest. (Still, maybe don't text your bank password here).
                </p>
              </div>
            </div>

            <button className={styles.ctaButton} onClick={() => navigate("/")}>
              Get Started
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
