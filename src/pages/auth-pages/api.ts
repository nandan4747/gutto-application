import { API_DETAILS } from "../../api/API_DETAILS";
import type { RegisterData, LoginData } from "./types";

const BASE_URL = API_DETAILS.host;

export const register = async (userData: RegisterData) => {
  const response = await fetch(`${BASE_URL}/user/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
    credentials: "include",
  });
  return response.json();
};

export const login = async (loginData: LoginData) => {
  const response = await fetch(`${BASE_URL}/user/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
    credentials: "include",
  });
  return response.json();
};
