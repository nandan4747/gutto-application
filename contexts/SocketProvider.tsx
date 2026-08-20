import { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "./AuthProvider";
import { io, Socket } from "socket.io-client";
import { BASE_URL } from "../src/api/API_DETAILS";
import { getStoredToken } from "../utils/AuthToken";

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!user) {
      setSocket(null);
      return;
    }

    const token = getStoredToken();
    if (!token) {
      setSocket(null);
      return;
    }

    const s = io(BASE_URL, {
      auth: { token },
    });

    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
