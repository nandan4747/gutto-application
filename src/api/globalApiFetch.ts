import { API_DETAILS } from "./API_DETAILS";

const BASE = API_DETAILS.host;
async function handle(res: Response) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || `Request failed: ${res.status}`);
  }
  return res.json();
}
export const getUserProfile = async (userId: string) => {
  const res = await fetch(`${BASE}/user/profile/${userId}`, {
    credentials: "include",
  });
  return handle(res);
};

export const deleteMessageApi = async (messageId: string): Promise<void> => {
  const response = await fetch(`${BASE}/chat/${messageId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to delete message");
  }
};
