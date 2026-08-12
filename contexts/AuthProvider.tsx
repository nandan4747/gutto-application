import { useState, useEffect, createContext, useContext } from "react";
import { API_DETAILS } from "../src/api/API_DETAILS";

const AuthContext = createContext({
  user: null,
  setUser: (user: any) => {},
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = `${API_DETAILS.host}/user/me`;
    console.log("Checking authentication status at:", url);
    setLoading(true);
    fetch(url, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("not authenticated");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
