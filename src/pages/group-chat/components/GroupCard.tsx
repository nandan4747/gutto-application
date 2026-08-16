import { Avatar } from "../../../components/avatart_genrator/Avatar";
import { colorScheme } from "../../../theme/colorScheme";
import styles from "../GroupChatPanel.module.css";
import type { ConversationEntry } from "../../../../contexts/MessageProvider";

interface Props {
    groupId: string;
    entry: ConversationEntry;
    isSelected: boolean;
    onClick: () => void;
}

export default function GroupCard({ entry, isSelected, onClick }: Props) {
    const name = entry.groupInfo?.name ?? "Group";
    const memberCount = entry.groupInfo?.members.length ?? 0;

    return (
        <div
            className={styles.card}
            onClick={onClick}
            style={{
                backgroundColor: isSelected ? colorScheme.selected : "transparent",
            }}
        >
            <Avatar name={name} size={44} />
            <div className={styles.cardInfo}>
                <div style={{ color: colorScheme.text }} className={styles.cardName}>
                    {name}
                </div>
                <div
                    style={{ color: colorScheme.textSecondary }}
                    className={styles.cardMeta}
                >
                    {memberCount} member{memberCount === 1 ? "" : "s"}
                </div>
            </div>
        </div>
    );
}