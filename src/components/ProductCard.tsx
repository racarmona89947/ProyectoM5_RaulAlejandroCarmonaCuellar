import { Link } from "react-router-dom";
import { useAuth } from "../contexts/auth/useAuth";
import { useCart } from "../contexts/cart/useCart";
import { useFavorites } from "../contexts/favorites/useFavorites";
import { useToast } from "../contexts/toast/useToast";
import type { Product } from "../types/domain";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { firebaseUser } = useAuth();
  const { dispatch } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  const favorite = isFavorite(product.id);
  const discount = product.previousPrice
    ? Math.round((1 - product.price / product.previousPrice) * 100)
    : null;
  const outOfStock = product.stock <= 0;

  function addToCart() {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] ?? "",
        quantity: 1,
      },
    });
    showToast(`${product.name} se añadió al carrito.`, "success");
  }

  function toggleProductFavorite() {
    toggleFavorite(product.id);
    showToast(
      favorite
        ? "Producto eliminado de favoritos."
        : "Producto guardado en favoritos.",
      "success",
    );
  }

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-[var(--text-muted)]">
          {product.category}
        </span>
        {firebaseUser && (
          <button
            aria-label={
              favorite
                ? `Quitar ${product.name} de favoritos`
                : `Agregar ${product.name} a favoritos`
            }
            aria-pressed={favorite}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition ${favorite ? "bg-pink-50 text-pink-600" : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--royal-violet)]"}`}
            onClick={toggleProductFavorite}
            type="button"
          >
            {favorite ? "♥" : "♡"}
          </button>
        )}
      </div>
      <Link className="flex flex-1 flex-col" to={`/products/${product.id}`}>
        <div className="relative mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-[var(--surface-muted)]">
          <img
            alt={product.name}
            className="max-h-full max-w-full object-contain transition duration-300 group-hover:scale-105"
            src={product.images[0] ?? "/product-placeholder.svg"}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
            {product.brand}
          </p>
          <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-[var(--text)]">
            {product.name}
          </h3>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--text-muted)]">
            {product.description}
          </p>
          <div className="mt-auto pt-4">
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-[var(--royal-violet)]">
                ${product.price.toLocaleString("es-AR")}
              </p>
              {discount && (
                <span className="rounded bg-pink-100 px-1.5 py-0.5 text-[10px] font-bold text-pink-700">
                  -{discount}%
                </span>
              )}
            </div>
            {product.previousPrice && (
              <p className="text-xs text-[var(--text-muted)] line-through">
                ${product.previousPrice.toLocaleString("es-AR")}
              </p>
            )}
          </div>
        </div>
      </Link>
      <p
        className={`mt-3 text-xs font-semibold ${outOfStock ? "text-[var(--danger)]" : "text-teal-600"}`}
      >
        {outOfStock ? "Agotado" : `${product.stock} unidades disponibles`}
      </p>
      {firebaseUser && (
        <button
          className="mt-3 w-full rounded-xl bg-[var(--royal-violet)] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--indigo-bloom)] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={outOfStock}
          onClick={addToCart}
          type="button"
        >
          {outOfStock ? "Sin stock" : "Añadir al carrito"}
        </button>
      )}
    </article>
  );
}
