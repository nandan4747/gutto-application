import type { ConversationEntry, StoredMessage } from "../../../../contexts/MessageProvider";
import type { Connection } from "../../../../contexts/RelationProvider";

interface RawGroup {
    _id: string;
    name: string;
    admin: Connection;
    members: Connection[];
    groupIcon?: string;
    updatedAt: string;
}

export function normalizeGroupList(
    raw: { groups: RawGroup[] },
): Record<string, ConversationEntry> {
    const result: Record<string, ConversationEntry> = {};

    for (const group of raw.groups) {
        result[group._id] = {
            type: "group",
            groupInfo: {
                id: group._id,
                name: group.name,
                members: group.members.map((m) => m._id),
            },
            messageList: [],
            lastUpdated: group.updatedAt ?? new Date(0).toISOString(),
            unreadedCount: 0, // no unread-count endpoint exists for groups yet
        };
    }

    return result;
}

export function extractAllMembers(raw: { groups: RawGroup[] }): Connection[] {
    const people: Connection[] = [];
    for (const group of raw.groups) {
        people.push(group.admin, ...group.members);
    }
    return people;
}

export function normalizeGroupMessagesPage(raw: {
    messages: any[];
    nextCursor: string | null;
}): {
    messages: StoredMessage[];
    nextCursor: string | null;
    senders: Connection[];
} {
    const senders: Connection[] = [];

    const messages = raw.messages.map((m) => {
        const senderId =
            typeof m.senderUserId === "object" ? m.senderUserId._id : m.senderUserId;

        if (typeof m.senderUserId === "object") {
            senders.push({
                _id: m.senderUserId._id,
                username: m.senderUserId.username,
                fullname: m.senderUserId.fullname,
                accountType: m.senderUserId.accountType ?? "private",
            });
        }

        return {
            messageId: m._id,
            text: m.text,
            type: m.type ?? "text",
            url: m.url,
            senderId,
            createdAt: m.createdAt,
            status: "sent" as const,
        };
    });

    return { messages, nextCursor: raw.nextCursor, senders };
}