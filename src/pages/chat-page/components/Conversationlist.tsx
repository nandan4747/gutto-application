import { useMessages } from "../../../../contexts/MessageProvider";
import ConversationItem from "./ConversationItem";
import { colorScheme } from "../../../theme/colorScheme";

interface Props {
  selectedConversationId: string | null;
  onSelect: (conversationId: string) => void;
}

export default function ConversationList({
  selectedConversationId,
  onSelect,
}: Props) {
  const { state } = useMessages();

  const conversations = Object.entries(state).sort(
    ([, a], [, b]) =>
      new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
  );

  return (
    <div
      style={{
        width: "100%",
        borderRight: `1px solid ${colorScheme.border}`,
        overflowY: "auto",
      }}
    >
      {conversations.length === 0 && (
        <div style={{ padding: 16, color: colorScheme.textSecondary }}>
          No conversations yet
        </div>
      )}
      {conversations.map(([conversationId, entry]) => (
        <ConversationItem
          key={conversationId}
          conversationId={conversationId}
          entry={entry}
          isSelected={conversationId === selectedConversationId}
          onClick={() => onSelect(conversationId)}
        />
      ))}
    </div>
  );
}
