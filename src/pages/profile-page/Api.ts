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

// PUT /api/user/fullname  { fullname }
export const updateFullname = async (fullname: string) => {
  const res = await apiFetch(`${BASE}/fullname`, {
    method: "PUT",

    body: JSON.stringify({ fullname }),
  });
  return handle(res);
};

// PUT /api/user/password  { oldPassword, newPassword }
export const changePassword = async (
  oldPassword: string,
  newPassword: string,
) => {
  const res = await apiFetch(`${BASE}/password`, {
    method: "PUT",
    body: JSON.stringify({ oldPassword, newPassword }),
  });
  return handle(res);
};

// PUT /api/user/account-type/toggle
// Response: { success, message, accountType: "private" | "public" }
export const toggleAccountType = async () => {
  const res = await apiFetch(`${BASE}/account-type/toggle`, {
    method: "PUT",
  });
  return handle(res);
};
export async function logout(): Promise<void> {
  const res = await apiFetch(`${BASE}/logout`, {
    method: "POST",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? "Failed to log out.");
  }
}
