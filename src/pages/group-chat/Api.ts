import { apiFetch } from "../../../utils/apiFetch";
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

export const getUserGroups = async () => {
  const res = await apiFetch(`${BASE}/`);
  return handle(res);
};

export const getGroupMessages = async (
  groupId: string,
  opts?: { cursor?: string | null; limit?: number },
) => {
  const params = new URLSearchParams();
  if (opts?.cursor) params.set("cursor", opts.cursor);
  if (opts?.limit) params.set("limit", String(opts.limit));

  const qs = params.toString();
  const res = await apiFetch(
    `${BASE}/messages/${groupId}${qs ? `?${qs}` : ""}`,
  );
  return handle(res);
};

// POST /api/groupchat  { groupChatName, newMembers }
export const createGroup = async (
  groupChatName: string,
  newMembers: string[],
) => {
  const res = await apiFetch(`${BASE}/`, {
    method: "POST",
    body: JSON.stringify({ groupChatName, newMembers }),
  });
  return handle(res);
};

// DELETE /api/groupchat  { groupId }  — admin only, enforced server-side
export const deleteGroup = async (groupId: string) => {
  const res = await apiFetch(`${BASE}/`, {
    method: "DELETE",
    body: JSON.stringify({ groupId }),
  });
  return handle(res);
};

// POST /api/groupchat/member  { groupId, newMembers }  — admin only
export const addGroupMembers = async (
  groupId: string,
  newMembers: string[],
) => {
  const res = await apiFetch(`${BASE}/member`, {
    method: "POST",
    body: JSON.stringify({ groupId, newMembers }),
  });
  return handle(res);
};

// DELETE /api/groupchat/member  { groupId, targetId }  — admin only
export const removeGroupMember = async (groupId: string, targetId: string) => {
  const res = await apiFetch(`${BASE}/member`, {
    method: "DELETE",

    body: JSON.stringify({ groupId, targetId }),
  });
  return handle(res);
};
// GET /api/groupchat/:groupId/leave
// Note: this is a GET despite being a mutation, matching the existing route.
export const leaveGroup = async (groupId: string) => {
  const res = await apiFetch(`${BASE}/${groupId}/leave`, {
    method: "GET",
  });
  return handle(res);
};
