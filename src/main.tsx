import "same-runtime";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { SearchProvider } from "./context/SearchContext";
import { WebSocketProvider } from "./context/WebSocketContext";
import { ToastProvider } from "./components/Toast";
import "./index.css";
import App from "./App.tsx";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find root element");
}

createRoot(rootElement).render(
  <BrowserRouter>
    <AuthProvider>
      <ToastProvider>
        <WebSocketProvider>
          <SearchProvider>
            <FavoritesProvider>
              <App />
            </FavoritesProvider>
          </SearchProvider>
        </WebSocketProvider>
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
);
