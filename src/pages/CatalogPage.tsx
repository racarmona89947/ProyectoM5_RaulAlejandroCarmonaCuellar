import { ProductCard } from "../components/ProductCard";
import { MarketplaceHeader } from "../components/MarketplaceHeader";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useProducts } from "../features/products/useProducts";

export function CatalogPage() {
  const [searchParams] = useSearchParams();
  const [, setSearchParams] = useSearchParams();
  const [minimumPrice, setMinimumPrice] = useState(0);
  const [maximumPrice, setMaximumPrice] = useState(0);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const requestedCategory =
    (searchParams.get("category") ?? "all").replace(/\/+$/, "") || "all";
  const {
    categories,
    category,
    error,
    filteredProducts: catalogProducts,
    isLoading,
    retry,
    setCategory,
  } = useProducts(searchParams.get("q") ?? "", requestedCategory);

  const filteredProducts = catalogProducts.filter((product) => {
    const matchesMinimum = minimumPrice <= 0 || product.price >= minimumPrice;
    const matchesMaximum = maximumPrice <= 0 || product.price <= maximumPrice;
    const matchesAvailability = !onlyAvailable || product.stock > 0;
    return matchesMinimum && matchesMaximum && matchesAvailability;
  });

  function handleCategoryChange(nextCategory: string) {
    const nextParams = new URLSearchParams(searchParams);
    if (nextCategory === "all") nextParams.delete("category");
    else nextParams.set("category", nextCategory);
    setSearchParams(nextParams);
    setCategory(nextCategory);
  }

  return (
    <main className="min-h-screen bg-[var(--page)] text-[var(--text)]">
      <MarketplaceHeader />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 md:flex-row md:py-10">
        {/* Sidebar Filters */}
        <aside className="w-full shrink-0 md:w-64">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
            <h2 className="mb-4 font-[Space_Grotesk] text-lg font-bold text-[var(--text)]">
              Categorías
            </h2>
            <ul className="space-y-2">
              {categories.map((option) => (
                <li key={option}>
                  <button
                    className={`w-full text-left text-sm transition-colors ${
                      category === option
                        ? "font-bold text-[var(--royal-violet)]"
                        : "text-[var(--text-muted)] hover:text-[var(--royal-violet)]"
                    }`}
                    onClick={() => handleCategoryChange(option)}
                  >
                    {option === "all" ? "Todas las categorías" : option}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-[var(--border)] pt-5">
              <h3 className="font-[Space_Grotesk] text-base font-bold">Precio</h3>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <input aria-label="Precio mínimo" className="min-w-0 rounded-lg border border-[var(--border)] bg-transparent px-2 py-2 text-sm" min="0" onChange={(event) => setMinimumPrice(Number(event.target.value))} placeholder="Mínimo" type="number" value={minimumPrice || ""} />
                <input aria-label="Precio máximo" className="min-w-0 rounded-lg border border-[var(--border)] bg-transparent px-2 py-2 text-sm" min="0" onChange={(event) => setMaximumPrice(Number(event.target.value))} placeholder="Máximo" type="number" value={maximumPrice || ""} />
              </div>
              <label className="mt-4 flex items-center gap-2 text-sm text-[var(--text-muted)]"><input checked={onlyAvailable} onChange={(event) => setOnlyAvailable(event.target.checked)} type="checkbox" /> Solo disponibles</label>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="min-w-0 flex-1">
          <div className="mb-6 flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-[Space_Grotesk] text-3xl font-bold text-[var(--text)]">
                {searchParams.get("q")
                  ? `Resultados para "${searchParams.get("q")}"`
                  : "Todos los productos"}
              </h1>
              <p className="text-sm text-[var(--text-muted)]">
                Resultados ({filteredProducts.length})
              </p>
            </div>

            {/* Sorting (Mockup para visual) */}
            <div className="flex items-center gap-2 rounded-xl bg-[var(--surface)] px-3 py-2 ring-1 ring-[var(--border)]">
              <span className="text-sm text-[var(--text-muted)]">
                Ordenar por:
              </span>
              <select className="rounded border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-sm font-medium">
                <option>Recomendados</option>
                <option>Menor precio</option>
                <option>Mayor precio</option>
              </select>
            </div>
          </div>

          {isLoading && (
            <p className="py-16 text-center text-[var(--text-muted)]">
              Cargando productos...
            </p>
          )}

          {error && (
            <div
              className="my-8 rounded-xl bg-red-50 p-4 text-center text-[var(--danger)]"
              role="alert"
            >
              <p>{error}</p>
              <button
                className="mt-3 rounded-lg border border-[var(--danger)] px-4 py-2 text-sm font-semibold"
                onClick={retry}
                type="button"
              >
                Reintentar
              </button>
            </div>
          )}

          {!isLoading && !error && filteredProducts.length === 0 && (
            <p className="py-16 text-center text-[var(--text-muted)]">
              No encontramos productos con esos criterios.
            </p>
          )}

          {!isLoading && !error && filteredProducts.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
