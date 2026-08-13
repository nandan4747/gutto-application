import "./App.css";
import { Routes, Route } from "react-router-dom";
import Auth from "./pages/auth-pages/Auth";
import { SocketProvider } from "../contexts/SocketProvider.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import Chat from "./pages/chat-page/Chat.tsx";
import AppHeader from "./components/app_header/AppHeader.tsx";

function App() {
  return (
    <SocketProvider>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <AppHeader />

        {/* The main chat area takes up the remaining space */}
        <main style={{ flex: 1, overflow: "hidden" }}>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Chat />} />
            </Route>
          </Routes>
        </main>
      </div>
    </SocketProvider>
  );
}

export default App;
