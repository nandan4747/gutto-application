import { useEffect } from "react";
import type { ConversationEntry } from "../../../../contexts/MessageProvider";
import { colorScheme } from "../../../theme/colorScheme";
import { Avatar } from "../../../components/avatart_genrator/Avatar";
import { useConnectedPeople } from "../../../../contexts/RelationProvider";
import { usePseudoConnection } from "../../../../contexts/PseudoConnectionContext";

interface Props {
  conversationId: string;
  entry: ConversationEntry;
  isSelected: boolean;
  onClick: () => void;
}

export default function ConversationItem({
  conversationId,
  entry,
  isSelected,
  onClick,
}: Props) {
  const { getConnection } = useConnectedPeople();
  const { getCachedUser, fetchUser } = usePseudoConnection();

  // Fallback chain for DMs: the conversation's own cached participant
  // info -> the shared "known people" cache (friends/group members) ->
  // the one-off profile-lookup cache. Uses THIS card's conversationId,
  // not the globally selected one (that was the bug — selectedConversationId
  // has no relation to which row is rendering).
  const knownConnection =
    entry.type === "dm"
      ? (getConnection(conversationId) ?? getCachedUser(conversationId))
      : undefined;

  const knownName =
    entry.type === "dm"
      ? (entry.participant?.fullname ??
        entry.participant?.username ??
        knownConnection?.fullname ??
        knownConnection?.username)
      : entry.groupInfo?.name;

  // If it's a DM and we still don't know who this is from anything
  // already cached, go fetch it once. Guarded on knownName so this
  // doesn't refire every render — only when genuinely unresolved.
  useEffect(() => {
    if (entry.type !== "dm" || knownName) return;
    fetchUser(conversationId);
  }, [entry.type, knownName, conversationId, fetchUser]);

  const isResolving = entry.type === "dm" && !knownName;
  const displayName = knownName ?? (isResolving ? "..." : "Group");
  const lastMessage = entry.messageList[entry.messageList.length - 1];

  return (
    <div
      onClick={onClick}
      style={{
        padding: "12px 16px",
        cursor: "pointer",
        background: isSelected ? colorScheme.selected : "transparent",

        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          overflow: "hidden",
        }}
      >
        <Avatar name={isResolving ? "?" : displayName} size={48} />

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
            marginLeft: "8px",
            flexShrink: 0,
          }}
        >
          {entry.unreadedCount}
        </span>
      )}
    </div>
  );
}
