import { apiFetch } from "../../../utils/apiFetch";
import { API_DETAILS } from "../../api/API_DETAILS";

const BASE = `${API_DETAILS.host}/user`;

async function handle(res: Response) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body?.error || body?.message || `Request failed: ${res.status}`,
    );
  }
  return res.json();
}

// GET /api/user/connections
export const getConnections = async (cursor?: string, limit = 10) => {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  params.set("limit", String(limit));

  const res = await apiFetch(`${BASE}/connections?${params.toString()}`);
  return handle(res); // -> { data: Connection[], nextCursor: string | null }
};

export const searchConnections = async (username: string) => {
  const params = new URLSearchParams({ username });
  const res = await apiFetch(`${BASE}/connections/search?${params.toString()}`);
  return handle(res); // -> { data: Connection[] }
};
// GET /api/user/search?q=
export const searchUsers = async (query: string) => {
  const res = await apiFetch(`${BASE}/search?q=${encodeURIComponent(query)}`);
  return handle(res);
};

// POST /api/user/send/freindrequest
export const sendFriendRequest = async (receiverId: string) => {
  const res = await apiFetch(`${BASE}/send/freindrequest`, {
    method: "POST",
    body: JSON.stringify({ receiverId }),
  });
  return handle(res);
};
// GET /api/user/friendrequest/pending
// Response: { count, requests: [{ _id, senderId: {_id, username, fullname}, receiverId, status, createdAt }] }
export const getPendingRequests = async () => {
  const res = await apiFetch(`${BASE}/friendrequest/pending`);
  return handle(res);
};

// POST /api/user/friendrequest/approve/:requestId
export const approveFriendRequest = async (requestId: string) => {
  const res = await apiFetch(`${BASE}/friendrequest/approve/${requestId}`, {
    method: "POST",
  });
  return handle(res);
};

// POST /api/user/friendrequest/reject/:requestId
export const rejectFriendRequest = async (requestId: string) => {
  const res = await apiFetch(`${BASE}/friendrequest/reject/${requestId}`, {
    method: "POST",
  });
  return handle(res);
};

// POST /api/user/unfriend?targetId=
export const unfriendUser = async (targetId: string) => {
  const res = await apiFetch(
    `${BASE}/unfriend?targetId=${encodeURIComponent(targetId)}`,
    {
      method: "POST",
    },
  );
  return handle(res);
};

// POST /api/user/block?targetId=
export const blockUser = async (targetId: string) => {
  const res = await apiFetch(
    `${BASE}/block?targetId=${encodeURIComponent(targetId)}`,
    {
      method: "POST",
    },
  );
  return handle(res);
};

// POST /api/user/unblock?targetId=
export const unblockUser = async (targetId: string) => {
  const res = await apiFetch(
    `${BASE}/unblock?targetId=${encodeURIComponent(targetId)}`,
    {
      method: "POST",
    },
  );
  return handle(res);
};

// GET /api/user/blocked
export const getBlockedUsers = async () => {
  const res = await apiFetch(`${BASE}/blocked`);
  return handle(res);
};
