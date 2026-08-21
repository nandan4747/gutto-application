import { useState, createContext, useContext } from "react";

type UIContextType = {
  canShowAppHeader: boolean;
  setCanShowAppHeader: (show: boolean) => void;
  canShowDesktopHeader: boolean;
  setCanShowDesktopHeader: (show: boolean) => void;
};

export const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [canShowAppHeader, setCanShowAppHeader] = useState(false);
  const [canShowDesktopHeader, setCanShowDesktopHeader] = useState(true);

  return (
    <UIContext.Provider
      value={{
        canShowAppHeader,
        setCanShowAppHeader,
        canShowDesktopHeader,
        setCanShowDesktopHeader,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUIContext = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUIContext must be used within a UIContextProvider");
  }
  return context;
};
