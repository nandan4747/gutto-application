import { createContext, useContext, useState, type ReactNode } from "react";

// What's currently shown inside Chat.tsx's sidebarPane. Lives here (not
// local state in either AppHeader or Chat.tsx) because those two are
// siblings that both need to read/write it without a route change.
export type SidebarView = "chats" | "friends" | "groups";

interface NavigationContextValue {
  activeView: SidebarView;
  setActiveView: (view: SidebarView) => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [activeView, setActiveView] = useState<SidebarView>("chats");

  return (
    <NavigationContext.Provider value={{ activeView, setActiveView }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigationView() {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error(
      "useNavigationView must be used within a NavigationProvider",
    );
  }
  return ctx;
}
