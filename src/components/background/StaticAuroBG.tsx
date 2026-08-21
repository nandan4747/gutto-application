import React from "react";

interface StaticAuraBGProps {
  children?: React.ReactNode;
}

const containerStyle: React.CSSProperties = {
  position: "relative",
  overflow: "hidden",
  minHeight: "100vh",
  // Blend modes need a dark backdrop to pop correctly:
  backgroundColor: "#100e0b",
};

const contentStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
};

const layers: React.CSSProperties[] = [
  // Layer 1 - Center Glow
  {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(ellipse 120% 145% at 50% -50%, rgba(0,0,0,0) 58%, rgb(240,240,245) 76%, rgba(0,0,0,0) 84%)",
    mixBlendMode: "screen",
    filter: "blur(63px)",
    opacity: 0.9,
    transform: "translateZ(0)",
    pointerEvents: "none",
  },
  // Layer 2 - Purple Aura
  {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(ellipse 120% 145% at 50% -50%, rgba(0,0,0,0) 50%, rgba(121,42,242,0.35) 78%, rgba(0,0,0,0) 100%)",
    mixBlendMode: "screen",
    filter: "blur(200px)",
    transform: "translateZ(0)",
    pointerEvents: "none",
  },
  // Layer 3 - Pink Accent
  {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(ellipse 120% 145% at 50% -50%, rgba(0,0,0,0) 82.5%, #ff007a 83.5%, rgba(0,0,0,0) 84.5%)",
    mixBlendMode: "lighten",
    filter: "blur(30px)",
    opacity: 0.75,
    transform: "translateZ(0)",
    pointerEvents: "none",
  },
];

export default function StaticAuraBG({ children }: StaticAuraBGProps) {
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
