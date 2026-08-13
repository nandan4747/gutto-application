import type {
  ConversationEntry,
  StoredMessage,
} from "../../../../contexts/MessageProvider";

export function normalizeConversations(
  raw: any[],
): Record<string, ConversationEntry> {
  const result: Record<string, ConversationEntry> = {};

  for (const convo of raw) {
    const conversationId = convo.partner._id;
    if (!conversationId) continue;

    const lm = convo.latestMessage;
    const previewMessage: StoredMessage | null = lm
      ? {
          messageId: `preview-${conversationId}`,
          text: lm.text,
          type: lm.type ?? "text",
          senderId: lm.senderId,
          createdAt: lm.createdAt,
          status: "sent",
        }
      : null;

    result[conversationId] = {
      type: "dm",
      participant: {
        id: conversationId,
        username: convo.partner.username,
        fullname: convo.partner.fullname,
      },
      messageList: previewMessage ? [previewMessage] : [],
      lastUpdated: previewMessage?.createdAt ?? new Date(0).toISOString(),
      unreadedCount: convo.unreadCount ?? 0,
    };
  }

  return result;
}

/**
 * Matches getUnreadSummary() in chatServices.ts:
 * [
 *   { _id, unreadCount, lastMessage, lastTimestamp, username, fullname },
 *   ...
 * ]
 * _id here is the sender's user id (from the aggregation's $group).
 */
export function normalizeUnreadCounts(
  raw: any[],
): { conversationId: string; count: number }[] {
  return raw.map((entry) => ({
    conversationId: entry._id,
    count: entry.unreadCount,
  }));
}

/**
 * Matches getChatHistory() in chatServices.ts — raw Message documents:
 * [{ _id, senderUserId, reciverUserId, text, type, url, isReaded, createdAt }, ...]
 */
export function normalizeChatHistory(raw: any[]): StoredMessage[] {
  return raw.map((m) => ({
    messageId: m._id,
    text: m.text,
    type: m.type ?? "text",
    url: m.url,
    senderId: m.senderUserId,
    createdAt: m.createdAt,
    status: "sent",
  }));
}
