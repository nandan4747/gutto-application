import type { ConversationEntry } from "../../../../contexts/MessageProvider";
import { colorScheme } from "../../../theme/colorScheme";
import { Avatar } from "../../../components/avatart_genrator/Avatar";
import { useConnectedPeople } from "../../../../contexts/RelationProvider";
import { useConversation } from "../../../../contexts/ConversationContext";

interface Props {
  conversationId: string;
  entry: ConversationEntry;
  isSelected: boolean;
  onClick: () => void;
}

export default function ConversationItem({
  entry,
  isSelected,
  onClick,
}: Props) {

  const { selectedConversationId } = useConversation();
  const { getConnection } = useConnectedPeople();

  const displayName =
    entry.type === "dm"
      ? (entry.participant?.fullname ??
        entry.participant?.username ??
        getConnection(selectedConversationId)?.fullname ?? "Unknown")
      : (entry.groupInfo?.name ?? "Group");

  const lastMessage = entry.messageList[entry.messageList.length - 1];


  return (
    <div
      onClick={onClick}
      style={{
        padding: "12px 16px",
        cursor: "pointer",
        background: isSelected ? colorScheme.selected : "transparent",
        borderBottom: `1px solid ${colorScheme.border}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* Grouped Avatar and Text with a gap */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          overflow: "hidden",
        }}
      >
        <Avatar name={displayName || "Unknown"} size={48} />

        {/* Added overflow handling so long names don't wreck your UI */}
        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {displayName}
          </div>
          <div
            style={{
              fontSize: 13,
              color: colorScheme.textSecondary,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {lastMessage?.text ?? "No messages yet"}
          </div>
        </div>
      </div>

      {entry.unreadedCount > 0 && (
        <span
          style={{
            background: "#0a84ff",
            color: "white",
            borderRadius: 12,
            padding: "2px 8px",
            fontSize: 12,
            marginLeft: "8px", // Gives some breathing room if the name pushes right up against it
            flexShrink: 0,
          }}
        >
          {entry.unreadedCount}
        </span>
      )}
    </div>
  );
}
