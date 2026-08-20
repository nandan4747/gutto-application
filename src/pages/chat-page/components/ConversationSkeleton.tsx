import styles from "./ConversationSkeleton.module.css";

interface Props {
  count?: number;
}

export default function ConversationSkeleton({ count = 8 }: Props) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.row}>
          <div className={`${styles.avatar} ${styles.shimmer}`} />
          <div className={styles.lines}>
            <div className={`${styles.lineName} ${styles.shimmer}`} />
            <div className={`${styles.lineMessage} ${styles.shimmer}`} />
          </div>
        </div>
      ))}
    </>
  );
}
