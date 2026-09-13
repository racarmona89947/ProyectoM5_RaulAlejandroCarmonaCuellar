import { Link } from 'react-router-dom'
import { CategoryManager } from '../components/CategoryManager'

export function AdminCategoriesPage() {
  return <main className="min-h-screen bg-[var(--page)] px-4 py-10 sm:px-6"><div className="mx-auto max-w-3xl"><Link className="font-semibold text-[var(--royal-violet)]" to="/admin">← Panel admin</Link><h1 className="mt-8 font-[Space_Grotesk] text-3xl font-bold text-[var(--text)]">Gestion de categorias</h1><p className="mt-2 text-[var(--text-muted)]">Crea y activa las categorias que apareceran en el catalogo.</p><div className="mt-8"><CategoryManager /></div></div></main>
}