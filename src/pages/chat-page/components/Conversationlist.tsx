import { useMessages } from "../../../../contexts/MessageProvider";
import ConversationItem from "./ConversationItem";
import { colorScheme } from "../../../theme/colorScheme";
import { BrushCleaning } from "lucide-react";

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
        <div
          style={{
            padding: 16,
            height: "100vh",
            width: "100%",
            color: colorScheme.textSecondary,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BrushCleaning />
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
