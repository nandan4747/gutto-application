import React from "react";

interface AvatarProps {
  name: string;
  size?: number; // Let's make it customizable so you can use it in diff places
}

// Magically turns a string into a consistent hex color. Don't look too closely at the bitwise math, just trust it.
const stringToColor = (string: string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
};

// Extracts initials. Handles John Doe (JD), Cher (C), and users who accidentally hit the spacebar too many times.
const getInitials = (name: string) => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const Avatar = ({ name, size = 48 }: AvatarProps) => {
  const backgroundColor = stringToColor(name);
  const initials = getInitials(name);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor,
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size / 2.5, // Automatically scales the text based on the circle size
        fontWeight: "bold",
        flexShrink: 0, // Prevents flexbox from squishing your beautiful circle into an oval
        textTransform: "uppercase",
      }}
      title={name}
    >
      {initials}
    </div>
  );
};
