import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "../../contexts/auth/AuthContext";
import { CartProvider } from "../../contexts/cart/CartContext";
import { ThemeProvider } from "../../contexts/theme/ThemeContext";
import { ToastProvider } from "../../contexts/toast/ToastContext";
import { MarketplaceHeader } from "../../components/MarketplaceHeader";

describe("MarketplaceHeader", () => {
  it("opens categories and accepts a product search", () => {
    render(
      <ToastProvider>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <MemoryRouter>
                <MarketplaceHeader />
              </MemoryRouter>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </ToastProvider>,
    );

    const categoryButtons = screen.getAllByRole("button", {
      name: /categorías/i,
    });
    fireEvent.click(categoryButtons[0]);
    expect(categoryButtons[0]).toHaveAttribute("aria-expanded", "true");

    fireEvent.change(
      screen.getAllByRole("searchbox", { name: "Buscar productos" })[0],
      { target: { value: "auriculares" } },
    );
    expect(
      screen.getAllByRole("searchbox", { name: "Buscar productos" })[0],
    ).toHaveValue("auriculares");
  });
});
