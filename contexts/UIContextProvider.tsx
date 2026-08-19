import { useState, createContext, useContext } from "react";

type UIContextType = {
  canShowAppHeader: boolean;
  setCanShowAppHeader: (show: boolean) => void;
};

export const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [canShowAppHeader, setCanShowAppHeader] = useState(false);

  return (
    <UIContext.Provider value={{ canShowAppHeader, setCanShowAppHeader }}>
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
