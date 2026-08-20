import "./App.css";
import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Auth from "./pages/auth-pages/Auth";
import { SocketProvider } from "../contexts/SocketProvider.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import Chat from "./pages/chat-page/Chat.tsx";
import AppHeader from "./components/app_header/AppHeader.tsx";
import MobileHeader from "./components/mobile/MobileHeader.tsx";
import MobileTabs from "./components/mobile/MobileTabs.tsx";
import { ConversationProvider } from "../contexts/ConversationContext.tsx";

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <ConversationProvider>
      <SocketProvider>
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            height: "100dvh",
            overflow: "hidden",
          }}
        >
          {isMobile ? <MobileHeader /> : <AppHeader />}

          {/* Main chat area */}
          <main style={{ flex: 1, overflowY: "hidden", position: "relative" }}>
            {" "}
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Chat />} />
              </Route>
            </Routes>
          </main>

          {isMobile && <MobileTabs />}
        </div>
      </SocketProvider>
    </ConversationProvider>
  );
}

export default App;
