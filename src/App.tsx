import { MarketplaceHeader } from './components/MarketplaceHeader'
import { SiteFooter } from './components/SiteFooter'

function App() {
  return (
    <main className="min-h-screen bg-[var(--page)] text-[var(--text)]">
      <MarketplaceHeader />

      <div className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--text-muted)] sm:px-6">
        <div className="mx-auto flex max-w-7xl justify-between gap-4 text-xs font-semibold">
          <span>Ingresa tu ubicación</span>
          <span className="hidden sm:block">Vende en NexoMarket | Ayuda ⌄</span>
        </div>
      </div>

      <section className="relative isolate overflow-hidden border-b border-[var(--border)]">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_20%,rgba(78,168,222,0.18),transparent_35%),radial-gradient(circle_at_15%_80%,rgba(116,0,184,0.12),transparent_32%)]" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
          <div className="animate-[fade-up_600ms_ease-out_both]">
            <p className="mb-5 font-semibold uppercase tracking-[0.22em] text-[var(--indigo-bloom)]">Todo para tu ritmo</p>
            <h1 className="max-w-3xl font-[Space_Grotesk] text-4xl font-bold leading-[1.05] text-[var(--text)] sm:text-6xl">
            Descubre productos para cada parte de tu día.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--text-muted)]">
            Tecnología, hogar, oficina, accesorios y más en un marketplace pensado para explorar, comparar y comprar con confianza.
            </p>
            <a className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[var(--royal-violet)] px-6 py-3 font-semibold text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:bg-[var(--indigo-bloom)]" href="/catalog">
              Explorar productos <span aria-hidden="true">→</span>
            </a>
          </div>
          <div className="animate-[fade-up_700ms_120ms_ease-out_both] rounded-[2rem] bg-gradient-to-br from-[var(--indigo-bloom)] via-[var(--slate-blue)] to-[var(--sky-surge)] p-8 text-white shadow-2xl shadow-indigo-200/40 sm:p-10">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--pearl-aqua)]">Colección destacada</p>
            </div>
            <h2 className="mt-20 font-[Space_Grotesk] text-3xl font-bold sm:text-4xl">Tecnología que se siente tuya.</h2>
            <p className="mt-3 max-w-sm text-white/80">Descubre novedades seleccionadas para cada forma de vivir.</p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}

export default App
