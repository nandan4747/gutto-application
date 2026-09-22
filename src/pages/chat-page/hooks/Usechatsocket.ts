import { useEffect, useCallback, useRef } from "react";
import { useSocket } from "../../../../contexts/SocketProvider";
import {
  useMessages,
  type MessageType,
} from "../../../../contexts/MessageProvider";
import { useAuth } from "../../../../contexts/AuthProvider";
import { sendFileMessageApi } from "../../../api/globalApiFetch";
import { useConversation } from "../../../../contexts/ConversationContext";
import applogo from "../../../assets/applogo.webp";
import { useToast } from "../../../../contexts/ToastProvider";
import { usePseudoConnection } from "../../../../contexts/PseudoConnectionContext";

// Add near the top of the file, after imports
interface NotificationOptionsWithRenotify extends NotificationOptions {
  renotify?: boolean;
}
export function useChatSocket() {
  const socket = useSocket();
  const { user } = useAuth();
  const {
    addIncomingMessage,
    addOptimisticMessage,
    confirmSentMessage,
    markMessageFailed,
    deleteMessage,
  } = useMessages();

  const { showToast } = useToast();
  const { selectedConversationId } = useConversation();
  const selectedConversationIdRef = useRef(selectedConversationId);

  const { getCachedUser, fetchUser } = usePseudoConnection();

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  useEffect(() => {
    if (!socket || !user) return;
    const currentUserId = (user as any).id ?? (user as any)._id;

    const handleNewMessage = async (payload: any) => {
      // payload: { _id, text, from, type, url, createdAt }

      if (String(payload.from) === String(currentUserId)) return;

      addIncomingMessage(
        payload.from,
        {
          messageId: payload._id,
          text: payload.text,
          type: payload.type,
          url: payload.url,
          fileName: payload.fileName,
          senderId: payload.from,
          createdAt: payload.createdAt,
        },
        "dm",
      );

      const isViewingThisChat =
        selectedConversationIdRef.current === String(payload.from);

      // Only notify (toast / system notification / title flash) when the
      // user isn't actively looking at this exact conversation.
      if (isViewingThisChat) return;

      let senderDetails = getCachedUser(payload.from);
      if (!senderDetails) {
        senderDetails = (await fetchUser(payload.from)) ?? undefined;
      }

      const notifBody =
        payload.type === "text" ? payload.text : "Sent you a file 📁";

      // Tab hidden (different tab / minimized / backgrounded) → title flash
      // AND still fire a system notification, since that's the whole point
      // of a background notification.
      if (document.hidden) {
        let isFlashing = false;
        const originalTitle = document.title;

        const flashInterval = setInterval(() => {
          document.title = isFlashing ? "💬 New Message!" : originalTitle;
          isFlashing = !isFlashing;
        }, 1000);

        const onVisibilityChange = () => {
          if (!document.hidden) {
            clearInterval(flashInterval);
            document.title = originalTitle;
            document.removeEventListener(
              "visibilitychange",
              onVisibilityChange,
            );
          }
        };

        document.addEventListener("visibilitychange", onVisibilityChange);
      } else {
        // Tab visible but user is on a different conversation → toast is enough
        // feedback inside the app; still fire a system notification below too
        // if you want cross-app visibility (e.g. they're in another window).
        showToast({
          type: "info",
          isMessage: true,
          senderName: senderDetails?.fullname,
          message: notifBody,
          senderId: payload.from,
        });
      }

      // System-level notification fires any time the user isn't viewing this
      // chat — hidden tab or not.
      if ("Notification" in window) {
        const title = senderDetails?.fullname
          ? `${senderDetails.fullname}`
          : "New Message!";

        const fireNotification = () => {
          const notif = new Notification(title, {
            body: notifBody,
            icon: applogo,
            tag: String(payload.from),
            renotify: true,
          } as NotificationOptionsWithRenotify);
          notif.onclick = () => {
            window.focus();
            notif.close();
          };
        };

        if (Notification.permission === "granted") {
          fireNotification();
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              fireNotification();
            }
          });
        }
      }
    };

    const handleNewGroupMessage = (payload: any) => {
      if (String(payload.from) === String(currentUserId)) return;
      addIncomingMessage(
        payload.groupId,
        {
          messageId: payload._id,
          text: payload.text,
          type: payload.type,
          url: payload.url,
          fileName: payload.fileName,
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
      showToast({ type: "alert", message: msg });
      console.warn("socket alert:", msg);
    };

    const handleMessageDeleted = ({
      conversationId,
      messageId,
    }: {
      conversationId: string;
      messageId: string;
    }) => {
      deleteMessage(conversationId, messageId);
    };

    const handleError = (payload: { message: string }) => {
      console.error("socket error:", payload.message);
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("newGroupMessage", handleNewGroupMessage);
    socket.on("messageSent", handleMessageSent);
    socket.on("alerts", handleAlert);
    socket.on("message_deleted", handleMessageDeleted);
    socket.on("error", handleError);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("newGroupMessage", handleNewGroupMessage);
      socket.off("messageSent", handleMessageSent);
      socket.off("alerts", handleAlert);
      socket.off("error", handleError);
      socket.off("message_deleted", handleMessageDeleted);
    };
  }, [
    socket,
    addIncomingMessage,
    confirmSentMessage,
    markMessageFailed,
    deleteMessage,
  ]);

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

  const sendFile = useCallback(
    async (params: {
      receiverId: string;
      isGroup: boolean;
      file: File;
      caption?: string;
    }) => {
      if (!user) return;

      const currentUserId = (user as any).id ?? (user as any)._id;
      const tempId = crypto.randomUUID();
      const createdAt = new Date().toISOString();
      const isImage = params.file.type.startsWith("image/");
      const localPreviewUrl = isImage
        ? URL.createObjectURL(params.file)
        : undefined;
      const conversationType = params.isGroup ? "group" : "dm";

      addOptimisticMessage(
        params.receiverId,
        {
          messageId: tempId,
          tempId,
          text: params.caption ?? "",
          type: isImage ? "image" : "file",
          url: localPreviewUrl,
          fileName: params.file.name,
          senderId: currentUserId,
          createdAt,
          status: "sending",
        },
        conversationType,
      );

      try {
        const saved = await sendFileMessageApi({
          receiverId: params.receiverId,
          isGroup: params.isGroup,
          file: params.file,
          text: params.caption,
        });

        confirmSentMessage(
          params.receiverId,
          tempId,
          saved._id,
          saved.createdAt,
          saved.url,
        );

        // Server URL is now in state — the blob preview is no longer
        // referenced, safe to free it.
        if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
      } catch (err) {
        console.error("File upload failed:", err);
        markMessageFailed(params.receiverId, tempId);
        // Leave the blob URL alive so the failed bubble can still show
        // what was being sent.
      }
    },
    [user, addOptimisticMessage, confirmSentMessage, markMessageFailed],
  );

  return { sendMessage, sendFile };
}
