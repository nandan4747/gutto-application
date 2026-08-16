import { createContext, useState, useContext, useCallback } from "react";

export interface Connection {
    _id: string;
    username: string;
    fullname: string;
    accountType: string;
}

interface ConnectedPeopleContextType {
    connections: Map<string, Connection>;
    setConnections: (connections: Map<string, Connection>) => void;
    // Adds/updates people without wiping out what's already cached — this
    // is what lets GroupChatPanel add group members on top of whatever
    // FriendsPanel already loaded, without duplicating anyone (keyed by
    // _id, so a person who's both a friend AND a group member just
    // overwrites their own entry with the same data instead of adding
    // a second copy).
    mergeConnections: (people: Connection[]) => void;
    // O(1) lookup by id — this is the whole point of using a Map instead
    // of a Set. GroupChatBubble calls this once per message to resolve
    // senderId -> display name.
    getConnection: (id: string) => Connection | undefined;
}

const ConnectedPeopleContext = createContext<
    ConnectedPeopleContextType | undefined
>(undefined);

const ConnectedPeopleProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [connections, setConnections] = useState<Map<string, Connection>>(
        new Map(),
    );

    const mergeConnections = useCallback((people: Connection[]) => {
        setConnections((prev) => {
            const next = new Map(prev);
            for (const person of people) {
                next.set(person._id, person);
            }
            return next;
        });
    }, []);

    const getConnection = useCallback(
        (id: string) => connections.get(id),
        [connections],
    );

    return (
        <ConnectedPeopleContext.Provider
            value={{ connections, setConnections, mergeConnections, getConnection }}
        >
            {children}
        </ConnectedPeopleContext.Provider>
    );
};

const useConnectedPeople = () => {
    const context = useContext(ConnectedPeopleContext);
    if (!context) {
        throw new Error(
            "useConnectedPeople must be used within a ConnectedPeopleProvider",
        );
    }
    return context;
};

export { ConnectedPeopleProvider, useConnectedPeople };