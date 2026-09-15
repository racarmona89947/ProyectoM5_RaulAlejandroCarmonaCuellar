import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/auth/useAuth";
import { MarketplaceHeader } from "../components/MarketplaceHeader";

export function ProtectedRoute() {
  const { firebaseUser, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <p className="p-8 text-center text-[var(--text-muted)]">
        Verificando sesion...
      </p>
    );
  }

  return firebaseUser ? (
    <Outlet />
  ) : (
    <Navigate replace state={{ from: location }} to="/login" />
  );
}

export function AdminRoute() {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <p className="p-8 text-center text-[var(--text-muted)]">
        Cargando permisos...
      </p>
    );
  }

  return profile?.role === "admin" ? (
    <>
      <MarketplaceHeader />
      <nav className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3">
        <div className="mx-auto flex max-w-7xl gap-4 text-sm font-semibold">
          <Link className="text-[var(--royal-violet)]" to="/admin">
            Catálogo
          </Link>
          <Link className="text-[var(--royal-violet)]" to="/admin/orders">
            Órdenes
          </Link>
          <Link className="text-[var(--royal-violet)]" to="/admin/categories">
            Categorías
          </Link>
        </div>
      </nav>
      <Outlet />
    </>
  ) : (
    <Navigate replace to="/" />
  );
}
