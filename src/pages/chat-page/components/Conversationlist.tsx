import { useMessages } from "../../../../contexts/MessageProvider";
import ConversationItem from "./ConversationItem";
import ConversationSkeleton from "./ConversationSkeleton";
import { colorScheme } from "../../../theme/colorScheme";
import { BrushCleaning } from "lucide-react";
import TypewriterText from "../../../components/animated/TypewriterText";
import { screen } from "../../../../utils/scope";
import { GradientBackground } from "../../../components/background/GradientBackground";

interface Props {
  selectedConversationId: string | null;
  onSelect: (conversationId: string) => void;
}

export default function ConversationList({
  selectedConversationId,
  onSelect,
}: Props) {
  // Assumes MessageProvider exposes an `isLoading` flag alongside `state`.
  // Rename this destructure if your provider calls it something else.
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
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        overscrollBehaviorY: "contain",
        paddingBottom: "16px",
      }}
    >
      {isLoading && conversations.length === 0 && <ConversationSkeleton />}

      {!isLoading && conversations.length === 0 && (
        <div
          style={{
            height: "100%",
            width: "100%",
            color: colorScheme.textSecondary,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {screen.isMobile && <GradientBackground />}
          {screen.isMobile && (
            <TypewriterText
              text=" No conversations yet...."
              speed={60}
              cursorColor={colorScheme.primary} // Matches the aura purple theme
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
          )}

          {!screen.isMobile && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",

                alignItems: "center",
              }}
            >
              <BrushCleaning />
              No conversations yet
            </div>
          )}
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
