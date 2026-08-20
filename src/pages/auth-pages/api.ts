import { API_DETAILS } from "../../api/API_DETAILS";
import { apiFetch } from "../../../utils/apiFetch";
import type { RegisterData, LoginData } from "./types";

const BASE_URL = API_DETAILS.host;

export const register = async (userData: RegisterData) => {
  const response = await apiFetch(`${BASE_URL}/user/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return response.json();
};

export const login = async (loginData: LoginData) => {
  const response = await apiFetch(`${BASE_URL}/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(loginData),
  });
  return response.json();
};
