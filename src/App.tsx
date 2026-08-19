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
  // Check if screen is narrower than 768px (standard mobile/tablet breakpoint)
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
            // Desktop is row (sidebar on left), Mobile is column (header top, tabs bottom)
            flexDirection: isMobile ? "column" : "row",
            height: "100vh",
            overflow: "hidden",
          }}
        >
          {/* Render appropriate navigation based on screen size */}
          {isMobile ? <MobileHeader /> : <AppHeader />}

          {/* Main chat area */}
          <main style={{ flex: 1, overflowY: "auto", position: "relative" }}>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Chat />} />
              </Route>
            </Routes>
          </main>

          {/* Bottom navigation only shows on mobile */}
          {isMobile && <MobileTabs />}
        </div>
      </SocketProvider>
    </ConversationProvider>
  );
}

export default App;
