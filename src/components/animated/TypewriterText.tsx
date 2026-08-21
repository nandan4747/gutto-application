import React, { useState, useEffect } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number; // Base speed in ms
  startDelay?: number; // Initial wait time before typing starts
  cursorColor?: string;
  style?: React.CSSProperties;
}

export default function TypewriterText({
  text,
  speed = 70,
  startDelay = 400,
  cursorColor = "#3182ce",
  style,
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  // Initial startup delay
  useEffect(() => {
    const timer = setTimeout(() => setHasStarted(true), startDelay);
    return () => clearTimeout(timer);
  }, [startDelay]);

  // Character-by-character typing loop
  useEffect(() => {
    if (!hasStarted || index >= text.length) return;

    // Add tiny randomized noise (+/- 25ms) so keystrokes feel organic
    const randomSpeed = speed + (Math.random() * 50 - 25);

    const timeout = setTimeout(
      () => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      },
      Math.max(20, randomSpeed),
    );

    return () => clearTimeout(timeout);
  }, [index, text, speed, hasStarted]);

  return (
    <p style={{ display: "inline-flex", alignItems: "center", ...style }}>
      <span>{displayedText}</span>
      <span className="typewriter-cursor">|</span>

      <style>{`
        .typewriter-cursor {
          display: inline-block;
          margin-left: 3px;
          color: ${cursorColor};
          font-weight: bold;
          animation: blink 0.8s infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </p>
  );
}
