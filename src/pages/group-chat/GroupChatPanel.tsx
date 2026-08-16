import { useEffect, useState } from "react";
import { useMessages } from "../../../contexts/MessageProvider";
import { useConnectedPeople } from "../../../contexts/RelationProvider";
import { getUserGroups } from "./Api";
import { normalizeGroupList, extractAllMembers } from "./utils/normalize";
import GroupCard from "./components/GroupCard";
import styles from "./GroupChatPanel.module.css";
import { colorScheme } from "../../theme/colorScheme";

interface Props {
    selectedConversationId: string | null;
    onSelect: (groupId: string) => void;
}

export default function GroupChatPanel({
    selectedConversationId,
    onSelect,
}: Props) {
    const { state, hydrateConversations } = useMessages();
    const { mergeConnections } = useConnectedPeople();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const raw = await getUserGroups();
                if (cancelled) return;

                // Group metadata (name, member ids) goes into the same cache
                // ChatWindow-style components already read from.
                hydrateConversations(normalizeGroupList(raw));

                // Every admin + member across every group goes into the shared
                // "known people" cache — this is what lets GroupChatBubble look
                // up a sender's display name with no extra fetch.
                mergeConnections(extractAllMembers(raw));

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
    }, [hydrateConversations, mergeConnections]);

    // Only entries of type "group" belong here — the same MessageProvider
    // cache also holds DM conversations, keyed by user id instead of group id.
    const groupEntries = Object.entries(state).filter(
        ([, entry]) => entry.type === "group",
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <p
                    style={{ color: colorScheme.textSecondary }}
                    className={styles.title}
                >
                    Group Chats
                </p>
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