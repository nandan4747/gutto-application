import { useEffect, useCallback } from "react";
import { useSocket } from "../../../../contexts/SocketProvider";
import {
  useMessages,
  type MessageType,
} from "../../../../contexts/MessageProvider";
import { useAuth } from "../../../../contexts/AuthProvider";

export function useChatSocket() {
  const socket = useSocket();
  const { user } = useAuth();
  const {
    addIncomingMessage,
    addOptimisticMessage,
    confirmSentMessage,
    markMessageFailed,
  } = useMessages();

  useEffect(() => {
    if (!socket || !user) return;
    const currentUserId = (user as any).id ?? (user as any)._id;

    const handleNewMessage = (payload: any) => {
      // payload: { _id, text, from, type, url, createdAt }

      if (String(payload.from) === String(currentUserId)) return;
      addIncomingMessage(
        payload.from,
        {
          messageId: payload._id,
          text: payload.text,
          type: payload.type,
          url: payload.url,
          senderId: payload.from,
          createdAt: payload.createdAt,
        },
        "dm",
      );
    };

    const handleNewGroupMessage = (payload: any) => {
      // ASSUMPTION: payload includes groupId + from, matching the same
      // shape as newMessage plus groupId. Adjust if backend differs.
      if (String(payload.from) === String(currentUserId)) return;
      addIncomingMessage(
        payload.groupId,
        {
          messageId: payload._id,
          text: payload.text,
          type: payload.type,
          url: payload.url,
          senderId: payload.from,
          createdAt: payload.createdAt,
        },
        "group",
      );
    };

    const handleMessageSent = (payload: any) => {
      // payload: { _id, tempId, receiverId, text, type, createdAt }
      confirmSentMessage(
        payload.receiverId,
        payload.tempId,
        payload._id,
        payload.createdAt,
      );
    };

    const handleAlert = (msg: string) => {
      // "account is private" / "Message not sent" (blocked) — surface via
      // toast in whatever notification system you're using.
      console.warn("socket alert:", msg);
    };

    const handleError = (payload: { message: string }) => {
      console.error("socket error:", payload.message);
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("newGroupMessage", handleNewGroupMessage);
    socket.on("messageSent", handleMessageSent);
    socket.on("alerts", handleAlert);
    socket.on("error", handleError);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("newGroupMessage", handleNewGroupMessage);
      socket.off("messageSent", handleMessageSent);
      socket.off("alerts", handleAlert);
      socket.off("error", handleError);
    };
  }, [socket, addIncomingMessage, confirmSentMessage, markMessageFailed]);

  const sendMessage = useCallback(
    (params: {
      receiverId: string;
      text: string;
      isGroup: boolean;
      type?: MessageType;
      url?: string;
    }) => {
      if (!socket || !user) return;

      const tempId = crypto.randomUUID();
      const createdAt = new Date().toISOString();

      // Optimistic insert — shows up instantly, gets reconciled by
      // handleMessageSent once the server confirms.
      addOptimisticMessage(
        params.receiverId,
        {
          messageId: tempId,
          tempId,
          text: params.text,
          type: params.type ?? "text",
          url: params.url,
          senderId: (user as any).id ?? (user as any)._id,
          createdAt,
          status: "sending",
        },
        params.isGroup ? "group" : "dm",
      );

      socket.emit("message", {
        receiverId: params.receiverId,
        text: params.text,
        isGroup: params.isGroup,
        type: params.type ?? "text",
        url: params.url ?? "",
        tempId,
      });
    },
    [socket, user, addOptimisticMessage],
  );

  return { sendMessage };
}
