import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { AuthProvider } from "../contexts/AuthProvider.tsx";
import { SocketProvider } from "../contexts/SocketProvider.tsx";
import { MessageProvider } from "../contexts/MessageProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <SocketProvider>
      <MessageProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </MessageProvider>
    </SocketProvider>
  </AuthProvider>,
);
