import { useEffect, useState } from 'react'
import { createCategory, deleteCategory, getCategories, updateCategory } from '../services/categoryService'
import type { Category } from '../types/domain'

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  async function loadCategories() {
    try { setCategories(await getCategories()) } catch { setError('No pudimos cargar las categorias.') }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => { void loadCategories() }, 0)
    return () => window.clearTimeout(timeoutId)
  }, [])

  async function handleCreate() {
    try { await createCategory(name); setName(''); await loadCategories() } catch { setError('No pudimos crear la categoria.') }
  }

  async function handleToggle(category: Category) {
    try { await updateCategory(category.id, category.name, !category.active); await loadCategories() } catch { setError('No pudimos actualizar la categoria.') }
  }

  async function handleDelete(categoryId: string) {
    try { await deleteCategory(categoryId); setCategories((current) => current.filter((category) => category.id !== categoryId)) } catch { setError('No pudimos eliminar la categoria.') }
  }

  return <section className="h-fit rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><h2 className="font-[Space_Grotesk] text-xl font-bold text-[var(--text)]">Categorias</h2><div className="mt-4 flex gap-2"><input className="min-w-0 flex-1 rounded-lg border border-[var(--border)] px-3 py-2" onChange={(event) => setName(event.target.value)} placeholder="Nueva categoria" value={name} /><button className="rounded-lg bg-[var(--royal-violet)] px-3 py-2 text-sm font-semibold text-white" onClick={() => void handleCreate()} type="button">Crear</button></div>{error && <p className="mt-3 text-sm text-[var(--danger)]" role="alert">{error}</p>}<div className="mt-4 space-y-2">{categories.map((category) => <div className="flex items-center justify-between gap-2 rounded-lg bg-[var(--surface-muted)] px-3 py-2" key={category.id}><span className="text-sm text-[var(--text)]">{category.name}</span><div className="flex gap-2"><button className="text-xs font-semibold text-[var(--royal-violet)]" onClick={() => void handleToggle(category)} type="button">{category.active ? 'Desactivar' : 'Activar'}</button><button className="text-xs font-semibold text-[var(--danger)]" onClick={() => void handleDelete(category.id)} type="button">Eliminar</button></div></div>)}</div></section>
}