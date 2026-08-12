import "./App.css";

import { Routes, Route } from "react-router-dom";
import Auth from "./pages/auth-pages/Auth";
import { SocketProvider } from "../contexts/SocketProvider.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import Chat from "./pages/chat-page/Chat.tsx";
function App() {
  return (
    <SocketProvider>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Chat />} />
        </Route>
      </Routes>
    </SocketProvider>
  );
}
export default App;
