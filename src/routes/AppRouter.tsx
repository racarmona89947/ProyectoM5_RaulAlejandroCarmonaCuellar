import { Navigate, Route, Routes } from "react-router-dom";
import App from "../App";
import { AccountPage } from "../pages/AccountPage";
import { CatalogPage } from "../pages/CatalogPage";
import { ProductDetailPage } from "../pages/ProductDetailPage";
import { CartPage } from "../pages/CartPage";
import { AdminRoute, ProtectedRoute } from "./RouteGuards";
import { CheckoutPage } from "../pages/CheckoutPage";
import { OrderDetailPage } from "../pages/OrderDetailPage";
import { OrdersPage } from "../pages/OrdersPage";
import { AdminPage } from "../pages/AdminPage";
import { FavoritesPage } from "../pages/FavoritesPage";
import { AdminCategoriesPage } from "../pages/AdminCategoriesPage";
import { NotFoundPage } from "../pages/NotFoundPage";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<App />} path="/" />
      <Route element={<CatalogPage />} path="/catalog" />
      <Route element={<ProductDetailPage />} path="/products/:productId" />
      <Route element={<ProtectedRoute />}>
        <Route element={<CartPage />} path="/cart" />
        <Route element={<FavoritesPage />} path="/favorites" />
      </Route>
      <Route
        element={<Navigate replace state={{ openLogin: true }} to="/" />}
        path="/login"
      />
      <Route
        element={<Navigate replace state={{ openRegister: true }} to="/" />}
        path="/register"
      />
      <Route element={<ProtectedRoute />}>
        <Route element={<AccountPage />} path="/account" />
        <Route element={<OrdersPage />} path="/orders" />
        <Route element={<CheckoutPage />} path="/checkout" />
        <Route element={<OrderDetailPage />} path="/orders/:orderId" />
        <Route element={<AdminRoute />}>
          <Route element={<AdminPage />} path="/admin" />
          <Route element={<AdminPage />} path="/admin/orders" />
          <Route element={<AdminCategoriesPage />} path="/admin/categories" />
        </Route>
      </Route>
      <Route element={<NotFoundPage />} path="*" />
    </Routes>
  );
}
