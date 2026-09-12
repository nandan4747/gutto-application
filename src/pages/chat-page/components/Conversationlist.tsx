import { useMessages } from "../../../../contexts/MessageProvider";
import ConversationItem from "./ConversationItem";
import ConversationSkeleton from "./ConversationSkeleton";
import { colorScheme } from "../../../theme/colorScheme";
import TypewriterText from "../../../components/animated/TypewriterText";

import waveBg from "../../../assets/wave.svg?url";

interface Props {
  selectedConversationId: string | null;
  onSelect: (conversationId: string) => void;
}

export default function ConversationList({
  selectedConversationId,
  onSelect,
}: Props) {
  const { state, hasHydrated } = useMessages();

  const conversations = Object.entries(state ?? {})
    .filter(([, entry]) => entry.type === "dm")
    .sort(
      ([, a], [, b]) =>
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
    );

  let isLoading = !hasHydrated;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {isLoading && conversations.length === 0 && <ConversationSkeleton />}

      {!isLoading && conversations.length === 0 && (
        <div
          style={{
            flex: 1,
            width: "100%",
            color: colorScheme.textSecondary,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundImage: `url("${waveBg}")`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "bottom",
            maxHeight: "100%",
          }}
        >
          <TypewriterText
            text=" No conversations yet...."
            speed={60}
            cursorColor={colorScheme.primary}
            style={{
              position: "relative",
              zIndex: 10,
              fontSize: "1.25rem",
              fontFamily: "monospace",
              color: "#e2e8f0",
              letterSpacing: "0.5px",
              fontWeight: 600,
            }}
          />
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
