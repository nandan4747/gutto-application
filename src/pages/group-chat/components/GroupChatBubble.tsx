import { useAuth } from "../../../../contexts/AuthProvider";
import { useConnectedPeople } from "../../../../contexts/RelationProvider";
import type { StoredMessage } from "../../../../contexts/MessageProvider";
import { colorScheme } from "../../../theme/colorScheme";

interface Props {
    message: StoredMessage;
}

export default function GroupChatBubble({ message }: Props) {
    const { user } = useAuth();
    const { getConnection } = useConnectedPeople();
    const currentUserId = (user as any)?.id ?? (user as any)?._id;

    // Safely extract the ID whether it's a populated object OR a raw string
    const rawSenderId = (message.senderId as any)?._id ?? (message.senderId as any)?.id ?? message.senderId;

    const isOwn = String(rawSenderId) === String(currentUserId);
    console.log(`is own ${isOwn}`);

    // O(1) lookup thanks to the Map — this is the payoff of the
    // Set-to-Map change. Falls back gracefully if the sender somehow
    // isn't in the cache (e.g. they left the group after sending).
    //console.log(`message details : ${JSON.stringify(message)}`);
    console.log(`message.senderId : ${String(rawSenderId)}`)
    const sender = getConnection(String(rawSenderId));
    //console.log(`connection details in bubble : ${sender?.fullname || "fishy"}`);
    const senderName = sender?.fullname ?? sender?.username ?? "Unknown";

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isOwn ? "flex-end" : "flex-start",
                marginBottom: 8,
            }}
        >
            {!isOwn && (
                <div
                    style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: colorScheme.textSecondary,
                        marginBottom: 2,
                        marginLeft: 12,


                    }}
                >
                    {senderName}
                </div>
            )}
            <div
                style={{
                    maxWidth: "60%",
                    padding: "8px 12px",
                    borderRadius: 12,
                    background: isOwn ? colorScheme.primary : colorScheme.backgroundSecondary,
                    color: colorScheme.text,
                    opacity: message.status === "sending" ? 0.6 : 1,
                }}
            >
                <div>{message.text}</div>
                {isOwn && (
                    <div style={{ fontSize: 10, marginTop: 4, opacity: 0.8 }}>
                        {message.status === "sending" && "Sending..."}
                        {message.status === "failed" && "Failed to send"}
                        {message.status === "sent" &&
                            new Date(message.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                    </div>
                )}
            </div>
        </div>
    );
}