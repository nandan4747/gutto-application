import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useMessages } from "../../../contexts/MessageProvider";
import { usePseudoConnection } from "../../../contexts/PseudoConnectionContext";
import { getUserGroups } from "./Api";
import { normalizeGroupList, extractAllMembers } from "./utils/normalize";
import GroupCard from "./components/GroupCard";
import CreateGroupPanel from "./components/CreateGroupPanel";
import styles from "./GroupChatPanel.module.css";
import { colorScheme } from "../../theme/colorScheme";
import { useUIContext } from "../../../contexts/UIContextProvider";

interface Props {
  selectedConversationId: string | null;
  onSelect: (groupId: string) => void;
}

export default function GroupChatPanel({
  selectedConversationId,
  onSelect,
}: Props) {
  const { state, hydrateConversations } = useMessages();
  const { mergeUsers } = usePseudoConnection();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { setCanShowAppHeader } = useUIContext();

  useEffect(() => {
    setCanShowAppHeader(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const raw = await getUserGroups();
        if (cancelled) return;

        hydrateConversations(normalizeGroupList(raw));
        mergeUsers(extractAllMembers(raw)); // group members are NOT friends -> pseudo cache, not RelationProvider

        setError(null);
      } catch (err: any) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrateConversations, mergeUsers]);

  const groupEntries = Object.entries(state).filter(
    ([, entry]) => entry.type === "group",
  );

  if (isCreating) {
    return (
      <CreateGroupPanel
        onClose={() => setIsCreating(false)}
        onCreated={(groupId) => {
          setIsCreating(false);
          onSelect(groupId);
        }}
      />
    );
  }

  return (
    <div className={styles.container}>
      <div
        className={styles.header}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <p
          style={{ color: colorScheme.textSecondary }}
          className={styles.title}
        >
          Group Chats
        </p>
        <button
          onClick={() => setIsCreating(true)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: colorScheme.text,
            display: "flex",
          }}
          aria-label="Create group"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className={styles.list}>
        {loading && <p className={styles.emptyText}>Loading groups...</p>}
        {error && <p className={styles.errorText}>{error}</p>}
        {!loading && !error && groupEntries.length === 0 && (
          <p className={styles.emptyText}>No group chats yet</p>
        )}
        {groupEntries.map(([groupId, entry]) => (
          <GroupCard
            key={groupId}
            groupId={groupId}
            entry={entry}
            isSelected={groupId === selectedConversationId}
            onClick={() => onSelect(groupId)}
          />
        ))}
      </div>
    </div>
  );
}
