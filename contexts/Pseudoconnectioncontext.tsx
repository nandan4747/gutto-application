import {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getUserProfile } from "../src/api/globalApiFetch";
import type { Connection } from "./RelationProvider";

interface PseudoConnectionContextType {
  getCachedUser: (id: string) => Connection | undefined;

  fetchUser: (id: string) => Promise<Connection | null>;
}

const PseudoConnectionContext = createContext<
  PseudoConnectionContextType | undefined
>(undefined);

export function PseudoConnectionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [cache, setCache] = useState<Map<string, Connection>>(new Map());
  // Tracks requests currently in flight so concurrent callers for the
  // same id piggyback on one fetch instead of duplicating it.
  const pendingRef = useRef<Map<string, Promise<Connection | null>>>(new Map());

  const getCachedUser = useCallback((id: string) => cache.get(id), [cache]);

  const fetchUser = useCallback(
    async (id: string): Promise<Connection | null> => {
      const existing = cache.get(id);
      if (existing) return existing;

      const pending = pendingRef.current.get(id);
      if (pending) return pending;

      const promise = (async () => {
        try {
          const user = await getUserProfile(id);
          setCache((prev) => {
            const next = new Map(prev);
            next.set(id, user);
            return next;
          });
          return user as Connection;
        } catch (err) {
          console.error(`Failed to fetch profile for ${id}:`, err);
          return null;
        } finally {
          pendingRef.current.delete(id);
        }
      })();

      pendingRef.current.set(id, promise);
      return promise;
    },
    [cache],
  );

  return (
    <PseudoConnectionContext.Provider value={{ getCachedUser, fetchUser }}>
      {children}
    </PseudoConnectionContext.Provider>
  );
}

export function usePseudoConnection() {
  const ctx = useContext(PseudoConnectionContext);
  if (!ctx) {
    throw new Error(
      "usePseudoConnection must be used within a PseudoConnectionProvider",
    );
  }
  return ctx;
}
