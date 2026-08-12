import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthProvider";
import { useEffect } from "react";
import { useSocket } from "../../../contexts/SocketProvider";
export default function Chat() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();

  useEffect(() => {
    if (user === null) {
      navigate("/auth");
    }
  }, [user]);

  useEffect(() => {
    if (!socket) return; // not connected yet, nothing to attach to

    const handleNewMessage = (payload: any) => {
      console.log("new message:", payload);
      // update your messages state here
    };

    const handleNewGroupMessage = (payload: any) => {
      console.log("new group message:", payload);
    };

    const handleMessageSent = (payload: any) => {
      // reconcile optimistic message using payload.tempId
    };

    const handleAlert = (msg: string) => {
      console.log("alert:", msg);
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("newGroupMessage", handleNewGroupMessage);
    socket.on("messageSent", handleMessageSent);
    socket.on("alerts", handleAlert);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("newGroupMessage", handleNewGroupMessage);
      socket.off("messageSent", handleMessageSent);
      socket.off("alerts", handleAlert);
    };
  }, [socket]);

  return (
    <div>
      <h1>chatting page</h1>
    </div>
  );
}
