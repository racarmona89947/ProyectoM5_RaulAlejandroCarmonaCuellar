import { Link } from "react-router-dom";
import { MarketplaceHeader } from "../components/MarketplaceHeader";

export function NotFoundPage() {
  return (
    <main className="min-h-screen bg-[var(--page)] text-[var(--text)]">
      <MarketplaceHeader />
      <section className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--indigo-bloom)]">
          Error 404
        </p>
        <h1 className="mt-4 font-[Space_Grotesk] text-4xl font-bold">
          Esta página no existe
        </h1>
        <p className="mt-4 max-w-lg text-[var(--text-muted)]">
          La dirección que abriste no corresponde a una sección disponible de
          NexoMarket.
        </p>
        <Link
          className="mt-8 rounded-xl bg-[var(--royal-violet)] px-5 py-3 font-semibold text-white"
          to="/"
        >
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}
