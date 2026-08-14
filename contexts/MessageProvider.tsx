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
  messageId: string; // real _id once confirmed, tempId while pending
  tempId?: string;
  text: string;
  type: MessageType;
  url?: string;
  senderId: string;
  createdAt: string;
  status: MessageStatus;
}

export interface ConversationEntry {
  type: "dm" | "group";
  participant?: { id: string; username: string; fullname: string };
  groupInfo?: { id: string; name: string; members: string[] };
  messageList: StoredMessage[];
  lastUpdated: string;
  unreadedCount: number;
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
      // merge rather than overwrite, in case sockets beat the fetch
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
      const { conversationId, tempId, realId, createdAt } = action.payload;
      const existing = state[conversationId];
      if (!existing) return state;

      return {
        ...state,
        [conversationId]: {
          ...existing,
          lastUpdated: createdAt,
          messageList: existing.messageList.map((m) =>
            m.tempId === tempId
              ? { ...m, messageId: realId, status: "sent", createdAt }
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

      // The cache may already hold a single "preview" message (from
      // /conversations) or local-only pending/failed sends. History is
      // the source of truth for anything with status "sent", so we
      // replace those, but keep anything still in-flight or failed that
      // hasn't landed in the DB yet (and therefore isn't in history).
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
      // Used for "scroll up to load older messages" — adds an older page
      // to the FRONT of the list without touching what's already loaded.
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
  ) => void;
  markMessageFailed: (conversationId: string, tempId: string) => void;
  markConversationRead: (conversationId: string) => void;
  loadHistory: (conversationId: string, messages: StoredMessage[]) => void;
  prependHistory: (conversationId: string, messages: StoredMessage[]) => void;
  setActiveConversation: (conversationId: string | null) => void;
}

const MessageContext = createContext<MessageContextValue | null>(null);

export function MessageProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(messageReducer, {});

  // Mutable, always-current pointer to "which chat is open right now".
  // A ref (not state) so socket listeners attached once can still read
  // the latest value without needing to re-subscribe on every navigation.
  const activeConversationRef = useRef<string | null>(null);

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
    ) => {
      dispatch({
        type: "CONFIRM_SENT_MESSAGE",
        payload: { conversationId, tempId, realId, createdAt },
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
