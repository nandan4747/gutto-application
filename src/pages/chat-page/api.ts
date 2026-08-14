import { API_DETAILS } from "../../api/API_DETAILS";

const BASE = `${API_DETAILS.host}/chat`;

async function handle(res: Response) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

// GET /api/chat/conversations
// ASSUMPTION: returns an array of conversation summaries, each with the
// other participant's info + last message. Adjust field names in
// normalizeConversations() (utils/normalize.ts) if the real shape differs.
export const getConversations = async () => {
  const res = await fetch(`${BASE}/conversations`, {
    credentials: "include",
  });
  return handle(res);
};

// GET /api/chat/unreaded
// ASSUMPTION: returns an array like [{ senderId, count }, ...]
export const getUnreadedMessages = async () => {
  const res = await fetch(`${BASE}/unreaded`, {
    credentials: "include",
  });
  return handle(res);
};

// GET /api/chat/markasread?senderId=
export const markAsRead = async (senderId: string) => {
  const res = await fetch(
    `${BASE}/markasread?senderId=${encodeURIComponent(senderId)}`,
    { credentials: "include" },
  );
  return handle(res);
};

// GET /api/chat/:senderId
export const getChatHistory = async (
  senderId: string,
  opts?: { cursor?: string | null; limit?: number },
) => {
  const params = new URLSearchParams();
  if (opts?.cursor) params.set("cursor", opts.cursor);
  if (opts?.limit) params.set("limit", String(opts.limit));

  const qs = params.toString();
  const res = await fetch(`${BASE}/${senderId}${qs ? `?${qs}` : ""}`, {
    credentials: "include",
  });
  return handle(res);
};
