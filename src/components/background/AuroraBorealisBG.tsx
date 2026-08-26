import React from "react";

interface AuroraBorealisBGProps {
  children?: React.ReactNode;
}

const containerStyle: React.CSSProperties = {
  position: "relative",
  overflow: "hidden",
  minHeight: "100vh",
  // Base backdrop color required for mix-blend-mode to work correctly:
  backgroundColor: "#100e0b",
};

const contentStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
};

const layers: React.CSSProperties[] = [
  // Layer 1 - Primary Cyan/Teal Arc
  {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(154deg, transparent 18%, rgba(12, 44, 72, 0.06) 29%, rgba(34, 0, 255, 0.4) 36%, rgb(255,255,255) 42%, rgba(73, 104, 207, 0.32) 48%, rgba(58, 38, 158, 0.22) 55%, rgba(102, 0, 255, 0.3) 62%, rgba(20, 15, 76, 0.08) 68%, transparent 82%)",
    mixBlendMode: "screen",
    filter: "blur(85px)",
    transform: "translateZ(0)",
    pointerEvents: "none",
  },
  // Layer 2 - Secondary Cyan Beam
  {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(128deg, transparent 28%, rgba(15,82,96,0.06) 38%, rgba(0,183,255,0.35) 43%, rgb(255,255,255) 48%, rgba(68,197,185,0.22) 52%, rgba(68, 0, 255, 0.25) 57%, rgba(25,105,112,0.10) 62%, transparent 76%)",
    mixBlendMode: "screen",
    filter: "blur(78px)",
    opacity: 0.9,
    transform: "translateZ(0)",
    pointerEvents: "none",
  },
  // Layer 3 - Central Emerald Radial Glow
  {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(ellipse 78% 20% at 51% 53%, rgba(65, 83, 183, 0.24) 0%, rgba(30, 35, 102, 0.1) 45%, transparent 82%)",
    mixBlendMode: "screen",
    filter: "blur(70px)",
    opacity: 0.9,
    transform: "translateZ(0)",
    pointerEvents: "none",
  },
  // Layer 4 - Mint Core Highlight
  {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(ellipse 48% 9% at 52% 50%, rgba(190, 194, 255, 0.14) 0%, rgba(112, 91, 195, 0.06) 45%, transparent 80%)",
    mixBlendMode: "screen",
    filter: "blur(175px)",
    transform: "translateZ(0)",
    pointerEvents: "none",
  },
  // Layer 5 - Vignette Shadow (Multiply blend)
  {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to top, rgba(1,5,13,0.90) 0%, rgba(2,7,16,0.58) 28%, rgba(3,9,20,0.20) 55%, transparent 78%)",
    mixBlendMode: "multiply",
    filter: "blur(80px)",
    opacity: 0.9,
    transform: "translateZ(0)",
    pointerEvents: "none",
  },
  // Layer 6 - Violet Accent Glow
  {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(ellipse 50% 28% at 72% 18%, rgba(89,62,151,0.10) 0%, rgba(57,44,100,0.04) 45%, transparent 82%)",
    mixBlendMode: "screen",
    filter: "blur(138px)",
    opacity: 0.7,
    transform: "translateZ(0)",
    pointerEvents: "none",
  },
];

export default function AuroraBorealisBG({ children }: AuroraBorealisBGProps) {
  return (
    <div style={containerStyle}>
      {/* Background Aura Layers */}
      {layers.map((layerStyle, index) => (
        <div key={index} style={layerStyle} />
      ))}

      {/* Foreground Content */}
      <div style={contentStyle}>{children}</div>
    </div>
  );
}
