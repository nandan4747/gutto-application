import { useEffect } from "react";
import { useConnectedPeople } from "../../../../contexts/RelationProvider";
import { usePseudoConnection } from "../../../../contexts/PseudoConnectionContext";

/**
 * Resolves a user id to their {username, fullname} via, in order:
 * the shared "known people" cache (friends/group members), then the
 * one-off profile-lookup cache, and fetches from the backend only if
 * neither has it. Returns undefined while resolving.
 */
export function useResolvedUser(id: string | undefined | null) {
  const { getConnection } = useConnectedPeople();
  const { getCachedUser, fetchUser } = usePseudoConnection();

  const user = id ? (getConnection(id) ?? getCachedUser(id)) : undefined;

  useEffect(() => {
    if (id && !user) {
      fetchUser(id);
    }
  }, [id, user, fetchUser]);

  return user;
}
