const TOKEN_KEY = "gutto_auth_token";

export const getStoredToken = (): string | null =>
  localStorage.getItem(TOKEN_KEY);

export const setStoredToken = (token: string): void =>
  localStorage.setItem(TOKEN_KEY, token);

export const clearStoredToken = (): void => {
  // console.log("logging out");
  localStorage.removeItem(TOKEN_KEY);
  // console.log("cleared token");
};
