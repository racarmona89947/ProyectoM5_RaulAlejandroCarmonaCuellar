import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MarketplaceHeader } from "../components/MarketplaceHeader";
import { useAuth } from "../contexts/auth/useAuth";
import { getOrdersByUser } from "../services/orderService";
import { orderStatusLabels, type Order } from "../types/domain";

export function OrdersPage() {
  const { firebaseUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!firebaseUser) return;
    let isActive = true;
    getOrdersByUser(firebaseUser.uid)
      .then((nextOrders) => {
        if (isActive) setOrders(nextOrders);
      })
      .catch(() => {
        if (isActive) setError("No pudimos cargar tus órdenes.");
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, [firebaseUser]);
  return (
    <main className="min-h-screen bg-[var(--page)]">
      <MarketplaceHeader />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link
          className="font-semibold text-[var(--royal-violet)]"
          to="/account"
        >
          ← Volver a mi cuenta
        </Link>
        <h1 className="mt-8 font-[Space_Grotesk] text-3xl font-bold text-[var(--text)]">
          Historial de órdenes
        </h1>
        {isLoading && (
          <p className="mt-8 text-[var(--text-muted)]">Cargando órdenes...</p>
        )}
        {error && (
          <p
            className="mt-8 rounded-lg bg-red-50 p-3 text-[var(--danger)]"
            role="alert"
          >
            {error}
          </p>
        )}
        {!isLoading && !error && orders.length === 0 && (
          <p className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--text-muted)]">
            Todavía no tienes órdenes.
          </p>
        )}
        {!isLoading && !error && orders.length > 0 && (
          <div className="mt-8 space-y-3">
            {orders.map((order) => (
              <Link
                className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
                key={order.id}
                to={`/orders/${order.id}`}
              >
                <div>
                  <p className="font-semibold text-[var(--text)]">
                    Orden {order.id.slice(0, 8)}
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {order.items.length} productos
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[var(--royal-violet)]">
                    ${order.total.toLocaleString("es-AR")}
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {orderStatusLabels[order.status]}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
