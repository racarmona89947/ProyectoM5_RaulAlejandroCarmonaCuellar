import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import App from "../../App";
import { AuthProvider } from "../../contexts/auth/AuthContext";
import { CartProvider } from "../../contexts/cart/CartContext";
import { ThemeProvider } from "../../contexts/theme/ThemeContext";
import { ToastProvider } from "../../contexts/toast/ToastContext";

describe("App", () => {
  it("renders the initial application shell", () => {
    render(
      <ToastProvider>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <MemoryRouter>
                <App />
              </MemoryRouter>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </ToastProvider>,
    );

    expect(
      screen.getByRole("heading", {
        name: "Descubre productos para cada parte de tu día.",
      }),
    ).toBeInTheDocument();
  });
});
