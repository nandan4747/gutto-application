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
export const getConnections = async () => {
  const res = await fetch(`${BASE}/connections`, {
    credentials: "include",
  });
  return handle(res);
};

// GET /api/user/search?q=
export const searchUsers = async (query: string) => {
  const res = await fetch(`${BASE}/search?q=${encodeURIComponent(query)}`, {
    credentials: "include",
  });
  return handle(res);
};

// POST /api/user/send/freindrequest
export const sendFriendRequest = async (receiverId: string) => {
  const res = await fetch(`${BASE}/send/freindrequest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ receiverId }),
  });
  return handle(res);
};
// GET /api/user/friendrequest/pending
// Response: { count, requests: [{ _id, senderId: {_id, username, fullname}, receiverId, status, createdAt }] }
export const getPendingRequests = async () => {
  const res = await fetch(`${BASE}/friendrequest/pending`, {
    credentials: "include",
  });
  return handle(res);
};

// POST /api/user/friendrequest/approve/:requestId
export const approveFriendRequest = async (requestId: string) => {
  const res = await fetch(`${BASE}/friendrequest/approve/${requestId}`, {
    method: "POST",
    credentials: "include",
  });
  return handle(res);
};

// POST /api/user/friendrequest/reject/:requestId
export const rejectFriendRequest = async (requestId: string) => {
  const res = await fetch(`${BASE}/friendrequest/reject/${requestId}`, {
    method: "POST",
    credentials: "include",
  });
  return handle(res);
};

// POST /api/user/unfriend?targetId=
export const unfriendUser = async (targetId: string) => {
  const res = await fetch(`${BASE}/unfriend?targetId=${encodeURIComponent(targetId)}`, {
    method: "POST",
    credentials: "include",
  });
  return handle(res);
};

// POST /api/user/block?targetId=
export const blockUser = async (targetId: string) => {
  const res = await fetch(`${BASE}/block?targetId=${encodeURIComponent(targetId)}`, {
    method: "POST",
    credentials: "include",
  });
  return handle(res);
};

// POST /api/user/unblock?targetId=
export const unblockUser = async (targetId: string) => {
  const res = await fetch(`${BASE}/unblock?targetId=${encodeURIComponent(targetId)}`, {
    method: "POST",
    credentials: "include",
  });
  return handle(res);
};

// GET /api/user/blocked
export const getBlockedUsers = async () => {
  const res = await fetch(`${BASE}/blocked`, {
    credentials: "include",
  });
  return handle(res);
};
