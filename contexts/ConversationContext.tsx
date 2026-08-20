import React, { createContext, useContext, useState, useEffect } from "react";
import { API_DETAILS } from "../src/api/API_DETAILS";
import { apiFetch } from "../utils/apiFetch";

export interface UserInfo {
  _id: string;
  username: string;
  fullname: string;
  accountType?: string;
}

interface ConversationContextValue {
  selectedConversationId: string | null;
  setSelectedConversationId: React.Dispatch<
    React.SetStateAction<string | null>
  >;
  selectedUserProfile: UserInfo | null;
  setSelectedUserProfile: React.Dispatch<React.SetStateAction<UserInfo | null>>;
  blockedUsers: UserInfo[];
  setBlockedUsers: React.Dispatch<React.SetStateAction<UserInfo[]>>;
  showGroupInfo: boolean;
  setShowGroupInfo: (show: boolean) => void;
}

const ConversationContext = createContext<ConversationContextValue | undefined>(
  undefined,
);

export function ConversationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [selectedUserProfile, setSelectedUserProfile] =
    useState<UserInfo | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<UserInfo[]>([]);

  const [showGroupInfo, setShowGroupInfo] = useState(false);

  // Fetch blocked users from the API on mount so the list survives refreshes
  useEffect(() => {
    apiFetch(`${API_DETAILS.host}/user/blocked`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setBlockedUsers(data))
      .catch(() => {
        // Silently fail — user might not be logged in yet
      });
  }, []);

  return (
    <ConversationContext.Provider
      value={{
        selectedConversationId,
        setSelectedConversationId,
        selectedUserProfile,
        setSelectedUserProfile,
        blockedUsers,
        setBlockedUsers,
        showGroupInfo,
        setShowGroupInfo,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error(
      "useConversation must be used within a ConversationProvider",
    );
  }
  return context;
}
