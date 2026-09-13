import { Link, useNavigate } from 'react-router-dom'
import { MarketplaceHeader } from '../components/MarketplaceHeader'
import { useAuth } from '../features/auth/useAuth'
import { logoutUser } from '../services/authService'

export function AccountPage() {
  const navigate = useNavigate()
  const { firebaseUser, profile } = useAuth()

  async function handleLogout() {
    await logoutUser()
    navigate('/', { replace: true })
  }

  return <main className="min-h-screen bg-[var(--page)]"><MarketplaceHeader /><section className="mx-auto max-w-5xl px-4 py-10 sm:px-6"><div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm"><div className="bg-gradient-to-r from-[var(--royal-violet)] to-[var(--fresh-sky)] px-6 py-10 text-white sm:px-10"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">Tu espacio NexoMarket</p><h1 className="mt-3 font-[Space_Grotesk] text-4xl font-bold">Hola, {profile?.displayName ?? firebaseUser?.displayName ?? 'cliente'}.</h1><p className="mt-3 max-w-xl text-white/80">Gestiona tus compras, preferencias y próximos descubrimientos.</p></div><div className="grid gap-5 p-6 sm:grid-cols-3 sm:p-10"><div className="rounded-2xl bg-[var(--surface-muted)] p-5 sm:col-span-2"><p className="text-sm text-[var(--text-muted)]">Correo</p><p className="mt-2 font-semibold text-[var(--text)]">{firebaseUser?.email}</p><p className="mt-6 text-sm text-[var(--text-muted)]">Tipo de cuenta</p><p className="mt-2 font-semibold capitalize text-[var(--royal-violet)]">{profile?.role ?? 'customer'}</p></div><div className="rounded-2xl border border-[var(--border)] p-5"><p className="text-sm text-[var(--text-muted)]">Tus compras</p><Link className="mt-3 inline-block font-semibold text-[var(--royal-violet)]" to="/orders">Ver órdenes →</Link></div></div><div className="flex flex-wrap gap-3 px-6 pb-8 sm:px-10"><Link className="rounded-xl bg-[var(--royal-violet)] px-5 py-3 font-semibold text-white" to="/catalog">Explorar productos</Link>{profile?.role === 'admin' && <Link className="rounded-xl border border-[var(--border)] px-5 py-3 font-semibold text-[var(--text)]" to="/admin">Panel admin</Link>}<button className="rounded-xl border border-[var(--border)] px-5 py-3 font-semibold text-[var(--text)]" onClick={() => void handleLogout()} type="button">Cerrar sesion</button></div></div></section></main>
}