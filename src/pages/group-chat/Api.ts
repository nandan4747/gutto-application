import { API_DETAILS } from "../../api/API_DETAILS";

const BASE = `${API_DETAILS.host}/groupchat`;

async function handle(res: Response) {
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
            body?.error || body?.message || `Request failed: ${res.status}`,
        );
    }
    return res.json();
}

// GET /api/groupchat  -> { count, groups: [{ _id, name, admin, members, groupIcon?, updatedAt, createdAt }] }
export const getUserGroups = async () => {
    const res = await fetch(`${BASE}/`, { credentials: "include" });
    return handle(res);
};

// GET /api/groupchat/messages/:groupId?cursor=&limit=
// Response: { messages: [...], nextCursor: string | null }
// senderUserId on each message is POPULATED ({_id, username, fullname}),
// unlike 1:1 chat history where it's a plain id — see normalize.ts.
export const getGroupMessages = async (
    groupId: string,
    opts?: { cursor?: string | null; limit?: number },
) => {
    const params = new URLSearchParams();
    if (opts?.cursor) params.set("cursor", opts.cursor);
    if (opts?.limit) params.set("limit", String(opts.limit));

    const qs = params.toString();
    const res = await fetch(
        `${BASE}/messages/${groupId}${qs ? `?${qs}` : ""}`,
        { credentials: "include" },
    );
    return handle(res);
};