import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { colorScheme } from "../../theme/colorScheme";

export const ThemeToggleButton = () => {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    // Check local storage on mount
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setIsLight(true);
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isLight ? "dark" : "light";
    setIsLight(!isLight);
    localStorage.setItem("theme", newTheme);

    if (newTheme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      role="switch"
      aria-checked={isLight}
      aria-label={`Switch to ${isLight ? "Dark" : "Light"} Mode`}
      style={{
        position: "relative",
        width: "46px",
        height: "24px",
        padding: "3px",
        borderRadius: "999px",
        border: "none",
        cursor: "pointer",
        backgroundColor: isLight ? "#e2e8f0" : colorScheme.backgroundTertiary,
        transition: "background-color 0.3s ease",
        boxSizing: "border-box",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "3px",
          left: isLight ? "28px" : "4px",
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          backgroundColor: "#ededed",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
          transition: "left 0.3s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
        }}
      >
        {isLight ? (
          <Sun fill="#f97c00" color="#f97c00" />
        ) : (
          <Moon
            fill={colorScheme.backgroundTertiary}
            color={colorScheme.backgroundTertiary}
          />
        )}
      </span>
    </button>
  );
};
