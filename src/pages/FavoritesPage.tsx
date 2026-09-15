import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MarketplaceHeader } from "../components/MarketplaceHeader";
import { ProductCard } from "../components/ProductCard";
import { useFavorites } from "../contexts/favorites/useFavorites";
import { getProduct } from "../services/productService";
import type { Product } from "../types/domain";

export function FavoritesPage() {
  const { favoriteIds } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    Promise.all(
      favoriteIds.map((productId) => getProduct(productId).catch(() => null)),
    )
      .then((result) => {
        if (isActive)
          setProducts(
            result.filter((product): product is Product => product !== null),
          );
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, [favoriteIds]);

  return (
    <main className="min-h-screen bg-[var(--page)] text-[var(--text)]">
      <MarketplaceHeader />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border)] pb-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--indigo-bloom)]">
              Tu selección
            </p>
            <h1 className="mt-2 font-[Space_Grotesk] text-3xl font-bold">
              Productos favoritos
            </h1>
            <p className="mt-2 text-[var(--text-muted)]">
              Guarda tus próximos descubrimientos para volver a ellos.
            </p>
          </div>
          <span className="text-sm font-semibold text-[var(--text-muted)]">
            {favoriteIds.length} guardados
          </span>
        </div>
        {isLoading && (
          <p className="py-16 text-center text-[var(--text-muted)]">
            Cargando favoritos...
          </p>
        )}
        {!isLoading && products.length === 0 && (
          <div className="mx-auto max-w-xl py-20 text-center">
            <p className="text-5xl">♡</p>
            <h2 className="mt-5 font-[Space_Grotesk] text-2xl font-bold">
              Todavía no guardaste productos
            </h2>
            <p className="mt-3 text-[var(--text-muted)]">
              Pulsa el corazón de cualquier producto para crear tu colección
              personal.
            </p>
            <Link
              className="mt-8 inline-flex rounded-xl bg-[var(--royal-violet)] px-5 py-3 font-semibold text-white"
              to="/catalog"
            >
              Explorar productos
            </Link>
          </div>
        )}
        {!isLoading && products.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
