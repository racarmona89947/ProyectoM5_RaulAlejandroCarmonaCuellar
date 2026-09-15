import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./contexts/auth/AuthContext";
import { CartProvider } from "./contexts/cart/CartContext";
import { FavoritesProvider } from "./contexts/favorites/FavoritesContext";
import { ThemeProvider } from "./contexts/theme/ThemeContext";
import { ToastProvider } from "./contexts/toast/ToastContext";
import { AppRouter } from "./routes/AppRouter";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <BrowserRouter>
                <AppRouter />
              </BrowserRouter>
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
);
