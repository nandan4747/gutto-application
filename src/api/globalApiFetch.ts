import { apiFetch } from "../../utils/apiFetch";
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
  const res = await apiFetch(`${BASE}/user/profile/${userId}`);
  return handle(res);
};

export const deleteMessageApi = async (messageId: string): Promise<void> => {
  const response = await apiFetch(`${BASE}/chat/${messageId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to delete message");
  }
};

export interface SentFileMessage {
  _id: string;
  text: string;
  type: "image" | "file";
  url: string;
  fileName?: string;
  createdAt: string;
}

// POST /api/chat/message/file (multipart) — matches the socket "message"
// event's permission checks (block list / friend-only) server-side, but
// goes over HTTP because you can't stream a File through socket.io here.
export const sendFileMessageApi = async (params: {
  receiverId: string;
  isGroup: boolean;
  file: File;
  text?: string;
}): Promise<SentFileMessage> => {
  const formData = new FormData();
  formData.append("file", params.file);
  formData.append("receiverId", params.receiverId);
  formData.append("isGroup", String(params.isGroup));
  if (params.text) formData.append("text", params.text);

  const response = await apiFetch(`${BASE}/chat/message/file`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to upload file");
  }

  return response.json();
};

// DELETE /api/chat/message/file/:messageId — separate from deleteMessageApi
// because the backend also has to remove the object from Supabase storage.
export const deleteFileMessageApi = async (
  messageId: string,
): Promise<void> => {
  const response = await apiFetch(`${BASE}/chat/message/file/${messageId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to delete file message");
  }
};
