import "./App.css";
import { Routes, Route } from "react-router-dom";
import Auth from "./pages/auth-pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import Chat from "./pages/chat-page/Chat.tsx";
import AppHeader from "./components/app_header/AppHeader.tsx";
import { ConversationProvider } from "../contexts/ConversationContext.tsx";

function App() {
  return (
    <ConversationProvider>
      <div
        style={{
          display: "flex",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <AppHeader />

        {/* The main chat area takes up the remaining space */}
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Chat />} />
            </Route>
          </Routes>
        </main>
      </div>
    </ConversationProvider>
  );
}

export default App;
