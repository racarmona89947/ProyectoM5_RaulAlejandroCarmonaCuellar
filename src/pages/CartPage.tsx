import { Link } from "react-router-dom";
import { MarketplaceHeader } from "../components/MarketplaceHeader";
import { useCart } from "../contexts/cart/useCart";
import { useToast } from "../contexts/toast/useToast";

export function CartPage() {
  const { count, dispatch, items, total } = useCart();
  const { showToast } = useToast();

  function decrease(productId: string, name: string, quantity: number) {
    dispatch({
      type: "UPDATE_QUANTITY",
      payload: { productId, quantity: quantity - 1 },
    });
    showToast(
      quantity === 1
        ? `${name} eliminado del carrito.`
        : `Cantidad de ${name} actualizada.`,
      "info",
    );
  }

  function increase(productId: string, name: string, quantity: number) {
    dispatch({
      type: "UPDATE_QUANTITY",
      payload: { productId, quantity: quantity + 1 },
    });
    showToast(`Cantidad de ${name} actualizada.`, "info");
  }

  function remove(productId: string, name: string) {
    dispatch({ type: "REMOVE_ITEM", payload: { productId } });
    showToast(`${name} eliminado del carrito.`, "info");
  }

  if (items.length === 0)
    return (
      <main className="min-h-screen bg-[var(--page)]">
        <MarketplaceHeader />
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-6 py-14 text-center">
            <h1 className="font-[Space_Grotesk] text-3xl font-bold text-[var(--text)]">
              Tu carrito esta vacio
            </h1>
            <p className="mt-3 text-[var(--text-muted)]">
              Explora todas nuestras categorías y encuentra algo para ti.
            </p>
            <Link
              className="mt-8 inline-block rounded-xl bg-[var(--royal-violet)] px-5 py-3 font-semibold text-white"
              to="/catalog"
            >
              Ver productos
            </Link>
          </div>
        </section>
      </main>
    );

  return (
    <main className="min-h-screen bg-[var(--page)]">
      <MarketplaceHeader />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Link
          className="font-semibold text-[var(--royal-violet)]"
          to="/catalog"
        >
          ← Seguir comprando
        </Link>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Resumen
                </p>
                <h1 className="font-[Space_Grotesk] text-3xl font-bold text-[var(--text)]">
                  Tu carrito
                </h1>
              </div>
              <span className="text-sm text-[var(--text-muted)]">
                {count} productos
              </span>
            </div>
            {items.map((item) => (
              <article
                className="flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
                key={item.productId}
              >
                <img
                  alt=""
                  className="h-24 w-24 rounded-xl object-cover"
                  src={item.image || "/product-placeholder.svg"}
                />
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-[var(--text)]">
                    {item.name}
                  </h2>
                  <p className="mt-1 text-[var(--royal-violet)]">
                    ${item.price.toLocaleString("es-AR")}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      aria-label={`Reducir cantidad de ${item.name}`}
                      className="h-8 w-8 rounded-lg border border-[var(--border)]"
                      onClick={() =>
                        decrease(item.productId, item.name, item.quantity)
                      }
                      type="button"
                    >
                      -
                    </button>
                    <span className="min-w-6 text-center">{item.quantity}</span>
                    <button
                      aria-label={`Aumentar cantidad de ${item.name}`}
                      className="h-8 w-8 rounded-lg border border-[var(--border)]"
                      onClick={() =>
                        increase(item.productId, item.name, item.quantity)
                      }
                      type="button"
                    >
                      +
                    </button>
                    <button
                      className="ml-3 text-sm text-[var(--danger)]"
                      onClick={() => remove(item.productId, item.name)}
                      type="button"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
          <aside className="h-fit rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="font-[Space_Grotesk] text-xl font-bold text-[var(--text)]">
              Total
            </h2>
            <p className="mt-4 text-3xl font-bold text-[var(--royal-violet)]">
              ${total.toLocaleString("es-AR")}
            </p>
            <Link
              className="mt-6 block w-full rounded-xl bg-[var(--royal-violet)] px-4 py-3 text-center font-semibold text-white"
              to="/checkout"
            >
              Continuar al checkout
            </Link>
            <button
              className="mt-3 w-full rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold"
              onClick={() => dispatch({ type: "CLEAR_CART" })}
              type="button"
            >
              Vaciar carrito
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}
