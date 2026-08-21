import StaticAuraBG from "../background/StaticAuroBG";
import TypewriterText from "../animated/TypewriterText";

export default function EmptyChatState() {
  return (
    <StaticAuraBG>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100vh",
        }}
      >
        <TypewriterText
          text="Select a conversation to start chatting..."
          speed={60}
          cursorColor="#9333ea" // Matches the aura purple theme
          style={{
            position: "relative",
            zIndex: 10,
            fontSize: "3.25rem",

            color: "#e2e8f0",
            letterSpacing: "0.5px",
            fontWeight: 600,
          }}
        />
      </div>
    </StaticAuraBG>
  );
}
