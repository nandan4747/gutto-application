import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { AuthProvider } from "../contexts/AuthProvider.tsx";
import { SocketProvider } from "../contexts/SocketProvider.tsx";
import { MessageProvider } from "../contexts/MessageProvider.tsx";
import { NavigationProvider } from "../contexts/Navigationprovider.tsx";
import { PseudoConnectionProvider } from "../contexts/PseudoConnectionContext.tsx";
import { ConnectedPeopleProvider } from "../contexts/RelationProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <SocketProvider>
      <MessageProvider>
        <NavigationProvider>
          <ConnectedPeopleProvider>
            <PseudoConnectionProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </PseudoConnectionProvider>
          </ConnectedPeopleProvider>
        </NavigationProvider>
      </MessageProvider>
    </SocketProvider>
  </AuthProvider>,
);
