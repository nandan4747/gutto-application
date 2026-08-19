import {
  createContext,
  useContext,
  useReducer,
  useRef,
  useCallback,
  type ReactNode,
} from "react";

// ---------- Types ----------

export type MessageStatus = "sending" | "sent" | "failed";
export type MessageType = "text" | "image" | "file";

export interface StoredMessage {
  messageId: string;
  tempId?: string;
  text: string;
  type: MessageType;
  url?: string;
  fileName?: string;
  senderId: string;
  createdAt: string;
  status: MessageStatus;
  isDeleted?: boolean;
}

export interface ConversationEntry {
  type: "dm" | "group";
  participant?: { id: string; username: string; fullname: string };
  groupInfo?: { id: string; name: string; members: string[]; admin: string };
  messageList: StoredMessage[];
  lastUpdated: string;
  unreadedCount: number;
}

// Moved here from ChatWindow/GroupChatWindow — component-local useRef state
// reset to empty on unmount/remount (e.g. switching away from a chat and
// back), which re-triggered the initial-history fetch every time. Living on
// the provider means it survives that. Refs, not state, so mutating them
// never re-renders anything reading `state`.
export interface PaginationState {
  nextCursor: string | null;
  hasMore: boolean;
  isLoading: boolean;
}

interface MessageState {
  [conversationId: string]: ConversationEntry;
}

// ---------- Actions ----------

type Action =
  | { type: "HYDRATE_CONVERSATIONS"; payload: MessageState }
  | {
      type: "APPLY_UNREAD_COUNTS";
      payload: { conversationId: string; count: number }[];
    }
  | {
      type: "ADD_INCOMING_MESSAGE";
      payload: {
        conversationId: string;
        message: Omit<StoredMessage, "status">;
        isActive: boolean;
        conversationType: "dm" | "group";
      };
    }
  | {
      type: "ADD_OPTIMISTIC_MESSAGE";
      payload: {
        conversationId: string;
        message: StoredMessage;
        conversationType: "dm" | "group";
      };
    }
  | {
      type: "CONFIRM_SENT_MESSAGE";
      payload: {
        conversationId: string;
        tempId: string;
        realId: string;
        createdAt: string;
        // File/image sends don't get a socket echo back to the sender
        // (only the receiver's room is emitted to) — the server URL
        // comes back in the HTTP response instead, so we patch it in
        // here, replacing the local blob preview.
        url?: string;
      };
    }
  | {
      type: "MARK_MESSAGE_FAILED";
      payload: { conversationId: string; tempId: string };
    }
  | { type: "MARK_CONVERSATION_READ"; payload: { conversationId: string } }
  | {
      type: "LOAD_HISTORY";
      payload: { conversationId: string; messages: StoredMessage[] };
    }
  | {
      type: "PREPEND_HISTORY";
      payload: { conversationId: string; messages: StoredMessage[] };
    }
  | {
      type: "UPDATE_GROUP_INFO";
      payload: {
        conversationId: string;
        members?: string[];
        name?: string;
      };
    }
  | {
      type: "REMOVE_CONVERSATION";
      payload: { conversationId: string };
    }
  | {
      type: "DELETE_MESSAGE";
      payload: { conversationId: string; messageId: string };
    };

// ---------- Reducer ----------

function ensureConversation(
  state: MessageState,
  conversationId: string,
  conversationType: "dm" | "group",
): ConversationEntry {
  return (
    state[conversationId] ?? {
      type: conversationType,
      messageList: [],
      lastUpdated: new Date().toISOString(),
      unreadedCount: 0,
    }
  );
}

function messageReducer(state: MessageState, action: Action): MessageState {
  switch (action.type) {
    case "HYDRATE_CONVERSATIONS": {
      return { ...action.payload, ...state };
    }

    case "APPLY_UNREAD_COUNTS": {
      const next = { ...state };
      for (const { conversationId, count } of action.payload) {
        const convo = next[conversationId];
        if (convo) {
          next[conversationId] = { ...convo, unreadedCount: count };
        }
      }
      return next;
    }

    case "ADD_INCOMING_MESSAGE": {
      const { conversationId, message, isActive, conversationType } =
        action.payload;
      const existing = ensureConversation(
        state,
        conversationId,
        conversationType,
      );

      return {
        ...state,
        [conversationId]: {
          ...existing,
          messageList: [
            ...existing.messageList,
            { ...message, status: "sent" },
          ],
          lastUpdated: message.createdAt,
          unreadedCount: isActive ? 0 : existing.unreadedCount + 1,
        },
      };
    }

    case "ADD_OPTIMISTIC_MESSAGE": {
      const { conversationId, message, conversationType } = action.payload;
      const existing = ensureConversation(
        state,
        conversationId,
        conversationType,
      );

      return {
        ...state,
        [conversationId]: {
          ...existing,
          messageList: [...existing.messageList, message],
          lastUpdated: message.createdAt,
        },
      };
    }

    case "CONFIRM_SENT_MESSAGE": {
      const { conversationId, tempId, realId, createdAt, url } =
        action.payload;
      const existing = state[conversationId];
      if (!existing) return state;

      return {
        ...state,
        [conversationId]: {
          ...existing,
          lastUpdated: createdAt,
          messageList: existing.messageList.map((m) =>
            m.tempId === tempId
              ? {
                  ...m,
                  messageId: realId,
                  status: "sent",
                  createdAt,
                  ...(url ? { url } : {}),
                }
              : m,
          ),
        },
      };
    }

    case "MARK_MESSAGE_FAILED": {
      const { conversationId, tempId } = action.payload;
      const existing = state[conversationId];
      if (!existing) return state;

      return {
        ...state,
        [conversationId]: {
          ...existing,
          messageList: existing.messageList.map((m) =>
            m.tempId === tempId ? { ...m, status: "failed" } : m,
          ),
        },
      };
    }

    case "MARK_CONVERSATION_READ": {
      const { conversationId } = action.payload;
      const existing = state[conversationId];
      if (!existing) return state;

      return {
        ...state,
        [conversationId]: { ...existing, unreadedCount: 0 },
      };
    }

    case "LOAD_HISTORY": {
      const { conversationId, messages } = action.payload;
      const existing = state[conversationId];
      if (!existing) return state;

      const historyIds = new Set(messages.map((m) => m.messageId));
      const pendingLocal = existing.messageList.filter(
        (m) => m.status !== "sent" && !historyIds.has(m.messageId),
      );

      return {
        ...state,
        [conversationId]: {
          ...existing,
          messageList: [...messages, ...pendingLocal],
        },
      };
    }

    case "PREPEND_HISTORY": {
      const { conversationId, messages } = action.payload;
      const existing = state[conversationId];
      if (!existing) return state;

      const existingIds = new Set(existing.messageList.map((m) => m.messageId));
      const newOnes = messages.filter((m) => !existingIds.has(m.messageId));

      return {
        ...state,
        [conversationId]: {
          ...existing,
          messageList: [...newOnes, ...existing.messageList],
        },
      };
    }

    case "UPDATE_GROUP_INFO": {
      const { conversationId, members, name } = action.payload;
      const existing = state[conversationId];
      if (!existing || !existing.groupInfo) return state;

      return {
        ...state,
        [conversationId]: {
          ...existing,
          groupInfo: {
            ...existing.groupInfo,
            ...(members ? { members } : {}),
            ...(name ? { name } : {}),
          },
        },
      };
    }

    case "REMOVE_CONVERSATION": {
      const { conversationId } = action.payload;
      if (!state[conversationId]) return state;
      const next = { ...state };
      delete next[conversationId];
      return next;
    }

    case "DELETE_MESSAGE": {
      const { conversationId, messageId } = action.payload;
      const existing = state[conversationId];
      if (!existing) return state;

      return {
        ...state,
        [conversationId]: {
          ...existing,
          messageList: existing.messageList.map((m) =>
            m.messageId === messageId
              ? {
                  ...m,
                  text: "This message was deleted by sender",
                  isDeleted: true,
                  url: undefined,
                }
              : m,
          ),
        },
      };
    }

    default:
      return state;
  }
}

// ---------- Context ----------

interface MessageContextValue {
  state: MessageState;
  activeConversationRef: React.MutableRefObject<string | null>;
  hydrateConversations: (payload: MessageState) => void;
  applyUnreadCounts: (
    payload: { conversationId: string; count: number }[],
  ) => void;
  addIncomingMessage: (
    conversationId: string,
    message: Omit<StoredMessage, "status">,
    conversationType: "dm" | "group",
  ) => void;
  addOptimisticMessage: (
    conversationId: string,
    message: StoredMessage,
    conversationType: "dm" | "group",
  ) => void;
  confirmSentMessage: (
    conversationId: string,
    tempId: string,
    realId: string,
    createdAt: string,
    url?: string,
  ) => void;
  markMessageFailed: (conversationId: string, tempId: string) => void;
  markConversationRead: (conversationId: string) => void;
  loadHistory: (conversationId: string, messages: StoredMessage[]) => void;
  prependHistory: (conversationId: string, messages: StoredMessage[]) => void;
  setActiveConversation: (conversationId: string | null) => void;
  updateGroupInfo: (
    conversationId: string,
    patch: { members?: string[]; name?: string },
  ) => void;
  removeConversation: (conversationId: string) => void;

  // ---- pagination / initial-load guard ----
  hasLoadedInitial: (conversationId: string) => boolean;
  markLoadedInitial: (conversationId: string) => void;
  unmarkLoadedInitial: (conversationId: string) => void; // retry after failed fetch
  getPaginationState: (conversationId: string) => PaginationState | undefined;
  setPaginationState: (conversationId: string, state: PaginationState) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
}

const MessageContext = createContext<MessageContextValue | null>(null);

export function MessageProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(messageReducer, {});
  const activeConversationRef = useRef<string | null>(null);

  // See PaginationState comment above — these survive ChatWindow /
  // GroupChatWindow unmount+remount because they live here, not in the
  // component. REMOVE_CONVERSATION (group deleted) should also clear
  // these so a recreated group with the same-shaped state doesn't get
  // stale pagination — handled in removeConversation below.
  const loadedInitialRef = useRef(new Set<string>());
  const paginationRef = useRef<Record<string, PaginationState>>({});

  const setActiveConversation = useCallback((conversationId: string | null) => {
    activeConversationRef.current = conversationId;
  }, []);

  const hydrateConversations = useCallback((payload: MessageState) => {
    dispatch({ type: "HYDRATE_CONVERSATIONS", payload });
  }, []);

  const applyUnreadCounts = useCallback(
    (payload: { conversationId: string; count: number }[]) => {
      dispatch({ type: "APPLY_UNREAD_COUNTS", payload });
    },
    [],
  );

  const addIncomingMessage = useCallback(
    (
      conversationId: string,
      message: Omit<StoredMessage, "status">,
      conversationType: "dm" | "group",
    ) => {
      const isActive = activeConversationRef.current === conversationId;
      dispatch({
        type: "ADD_INCOMING_MESSAGE",
        payload: { conversationId, message, isActive, conversationType },
      });
    },
    [],
  );

  const addOptimisticMessage = useCallback(
    (
      conversationId: string,
      message: StoredMessage,
      conversationType: "dm" | "group",
    ) => {
      dispatch({
        type: "ADD_OPTIMISTIC_MESSAGE",
        payload: { conversationId, message, conversationType },
      });
    },
    [],
  );

  const confirmSentMessage = useCallback(
    (
      conversationId: string,
      tempId: string,
      realId: string,
      createdAt: string,
      url?: string,
    ) => {
      dispatch({
        type: "CONFIRM_SENT_MESSAGE",
        payload: { conversationId, tempId, realId, createdAt, url },
      });
    },
    [],
  );

  const markMessageFailed = useCallback(
    (conversationId: string, tempId: string) => {
      dispatch({
        type: "MARK_MESSAGE_FAILED",
        payload: { conversationId, tempId },
      });
    },
    [],
  );

  const markConversationRead = useCallback((conversationId: string) => {
    dispatch({ type: "MARK_CONVERSATION_READ", payload: { conversationId } });
  }, []);

  const loadHistory = useCallback(
    (conversationId: string, messages: StoredMessage[]) => {
      dispatch({ type: "LOAD_HISTORY", payload: { conversationId, messages } });
    },
    [],
  );

  const prependHistory = useCallback(
    (conversationId: string, messages: StoredMessage[]) => {
      dispatch({
        type: "PREPEND_HISTORY",
        payload: { conversationId, messages },
      });
    },
    [],
  );

  const updateGroupInfo = useCallback(
    (conversationId: string, patch: { members?: string[]; name?: string }) => {
      dispatch({
        type: "UPDATE_GROUP_INFO",
        payload: { conversationId, ...patch },
      });
    },
    [],
  );

  const removeConversation = useCallback((conversationId: string) => {
    dispatch({ type: "REMOVE_CONVERSATION", payload: { conversationId } });
    // Clean up the guard/pagination stores too — otherwise a stale
    // "already loaded" / cursor entry sits around forever for an id
    // that no longer has a conversation, a small but real memory leak
    // over a long session with lots of group churn.
    loadedInitialRef.current.delete(conversationId);
    delete paginationRef.current[conversationId];
  }, []);

  const hasLoadedInitial = useCallback(
    (conversationId: string) => loadedInitialRef.current.has(conversationId),
    [],
  );

  const markLoadedInitial = useCallback((conversationId: string) => {
    loadedInitialRef.current.add(conversationId);
  }, []);

  const unmarkLoadedInitial = useCallback((conversationId: string) => {
    loadedInitialRef.current.delete(conversationId);
  }, []);

  const getPaginationState = useCallback(
    (conversationId: string) => paginationRef.current[conversationId],
    [],
  );

  const setPaginationState = useCallback(
    (conversationId: string, pageState: PaginationState) => {
      paginationRef.current[conversationId] = pageState;
    },
    [],
  );

  const deleteMessage = useCallback(
    (conversationId: string, messageId: string) => {
      dispatch({
        type: "DELETE_MESSAGE",
        payload: { conversationId, messageId },
      });
    },
    [],
  );

  return (
    <MessageContext.Provider
      value={{
        state,
        activeConversationRef,
        hydrateConversations,
        applyUnreadCounts,
        addIncomingMessage,
        addOptimisticMessage,
        confirmSentMessage,
        markMessageFailed,
        markConversationRead,
        loadHistory,
        prependHistory,
        setActiveConversation,
        updateGroupInfo,
        removeConversation,
        hasLoadedInitial,
        markLoadedInitial,
        unmarkLoadedInitial,
        getPaginationState,
        setPaginationState,
        deleteMessage,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
}

export function useMessages() {
  const ctx = useContext(MessageContext);
  if (!ctx)
    throw new Error("useMessages must be used within a MessageProvider");
  return ctx;
}
