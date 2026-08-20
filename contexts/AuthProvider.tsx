import { useState, useEffect, createContext, useContext } from "react";
import { API_DETAILS } from "../src/api/API_DETAILS";
import { apiFetch } from "../utils/apiFetch";
import {
  getStoredToken,
  setStoredToken,
  clearStoredToken,
} from "../utils/AuthToken";

const AuthContext = createContext({
  user: null,
  setUser: (_user: any, _token?: string) => {},
  loading: true,
  logout: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  const setUser = (userData: any, token?: string) => {
    if (token) setStoredToken(token);
    setUserState(userData);
  };

  const logout = () => {
    clearStoredToken();
    setUserState(null);
  };

  useEffect(() => {
    const token = getStoredToken();

    // No stored token at all — skip the network round-trip, we already
    // know there's no session to check.
    if (!token) {
      setLoading(false);
      return;
    }

    const url = `${API_DETAILS.host}/user/me`;
    setLoading(true);
    apiFetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("not authenticated");
        return res.json();
      })
      .then((data) => setUserState(data))
      .catch(() => {
        // Stale/invalid/expired token — clear it so we don't keep
        // retrying with something the server will never accept.
        clearStoredToken();
        setUserState(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
