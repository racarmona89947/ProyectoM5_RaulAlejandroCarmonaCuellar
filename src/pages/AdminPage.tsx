import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { createProduct, deleteProduct, getAllOrders, getAllProducts, updateOrderStatus, updateProduct, uploadProductImage, type ProductInput } from '../services/adminService'
import { getCategories } from '../services/categoryService'
import { orderStatusLabels, type Order, type OrderStatus, type Product } from '../types/domain'

const emptyProduct: ProductInput = { name: '', brand: '', description: '', category: '', price: 0, stock: 0, images: [], featured: false }
const orderStatuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'completed', 'cancelled']

export function AdminPage() {
  const isOrdersView = useLocation().pathname === '/admin/orders'
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [form, setForm] = useState<ProductInput>(emptyProduct)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | OrderStatus>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  async function loadAdminData() {
    setIsLoading(true)
    setError('')
    try {
      const [nextProducts, nextOrders, nextCategories] = await Promise.all([getAllProducts(), getAllOrders(), getCategories()])
      setProducts(nextProducts)
      setOrders(nextOrders)
      setCategories(nextCategories.map((category) => category.name))
    } catch {
      setError('No pudimos cargar los datos del panel. Verifica las reglas de Firestore.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => { void loadAdminData() }, 0)
    return () => window.clearTimeout(timeoutId)
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    try {
      const imageUrl = selectedFile ? await uploadProductImage(selectedFile) : form.images[0]
      const productToSave = { ...form, images: imageUrl ? [imageUrl] : [] }
      if (editingId) await updateProduct(editingId, productToSave)
      else await createProduct(productToSave)
      setForm(emptyProduct)
      setSelectedFile(null)
      setEditingId(null)
      await loadAdminData()
    } catch (saveError) {
      setError(saveError instanceof Error && saveError.message === 'Could not upload image' ? 'No pudimos subir la imagen a S3.' : 'No pudimos guardar el producto.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(productId: string) {
    if (!window.confirm('¿Eliminar este producto?')) return
    try {
      await deleteProduct(productId)
      setProducts((current) => current.filter((product) => product.id !== productId))
    } catch {
      setError('No pudimos eliminar el producto.')
    }
  }

  async function handleOrderStatus(orderId: string, status: OrderStatus) {
    try {
      await updateOrderStatus(orderId, status)
      setOrders((current) => current.map((order) => order.id === orderId ? { ...order, status } : order))
    } catch {
      setError('No pudimos actualizar el estado de la orden.')
    }
  }

  const visibleOrders = filter === 'all' ? orders : orders.filter((order) => order.status === filter)

  return <main className="min-h-screen bg-[var(--page)] px-4 py-8 text-[var(--text)] sm:px-6"><div className="mx-auto max-w-7xl">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><Link className="font-semibold text-[var(--royal-violet)]" to="/account">← Mi cuenta</Link><p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--indigo-bloom)]">Administración</p><h1 className="mt-1 font-[Space_Grotesk] text-3xl font-bold">{isOrdersView ? 'Órdenes' : 'Catálogo de productos'}</h1><p className="mt-2 text-[var(--text-muted)]">{isOrdersView ? 'Revisa y actualiza el estado de las compras.' : 'Crea, edita y organiza los productos de tu marketplace.'}</p></div><button className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold transition hover:border-[var(--royal-violet)]" onClick={() => void loadAdminData()} type="button">Actualizar datos</button></div>
    {error && <p className="mt-6 rounded-lg bg-red-50 p-3 text-[var(--danger)]" role="alert">{error}</p>}
    {isOrdersView ? <OrdersSection filter={filter} isLoading={isLoading} orders={visibleOrders} onFilterChange={setFilter} onStatusChange={(orderId, status) => void handleOrderStatus(orderId, status)} /> : <ProductsSection categories={categories} editingId={editingId} form={form} isLoading={isLoading} isSaving={isSaving} products={products} selectedFile={selectedFile} onCancel={() => { setEditingId(null); setForm(emptyProduct); setSelectedFile(null) }} onDelete={(productId) => void handleDelete(productId)} onEdit={(product) => { setEditingId(product.id); setSelectedFile(null); setForm({ name: product.name, brand: product.brand, description: product.description, category: product.category, price: product.price, stock: product.stock, images: product.images, featured: product.featured }) }} onFileChange={setSelectedFile} onFormChange={setForm} onSubmit={handleSubmit} />}
  </div></main>
}

interface ProductsSectionProps { categories: string[]; editingId: string | null; form: ProductInput; isLoading: boolean; isSaving: boolean; products: Product[]; selectedFile: File | null; onCancel: () => void; onDelete: (productId: string) => void; onEdit: (product: Product) => void; onFileChange: (file: File | null) => void; onFormChange: (form: ProductInput) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }

function ProductsSection({ categories, editingId, form, isLoading, isSaving, products, selectedFile, onCancel, onDelete, onEdit, onFileChange, onFormChange, onSubmit }: ProductsSectionProps) {
  return <div className="mt-8 grid gap-8 xl:grid-cols-[380px_1fr]">
    <section className="h-fit rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm"><h2 className="font-[Space_Grotesk] text-xl font-bold">{editingId ? 'Editar producto' : 'Nuevo producto'}</h2><form className="mt-5 space-y-4" onSubmit={onSubmit}><input className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2" onChange={(event) => onFormChange({ ...form, name: event.target.value })} placeholder="Nombre" required value={form.name} /><input className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2" onChange={(event) => onFormChange({ ...form, brand: event.target.value })} placeholder="Marca" required value={form.brand} /><select className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2" onChange={(event) => onFormChange({ ...form, category: event.target.value })} required value={form.category}><option value="" disabled>Selecciona una categoría</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select><textarea className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2" onChange={(event) => onFormChange({ ...form, description: event.target.value })} placeholder="Descripción" required value={form.description} /><div className="grid grid-cols-2 gap-3"><input className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2" min="0" onChange={(event) => onFormChange({ ...form, price: Number(event.target.value) })} placeholder="Precio" required type="number" value={form.price || ''} /><input className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2" min="0" onChange={(event) => onFormChange({ ...form, stock: Number(event.target.value) })} placeholder="Stock" required type="number" value={form.stock || ''} /></div><input accept="image/jpeg,image/png,image/webp" className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2" onChange={(event) => onFileChange(event.target.files?.[0] ?? null)} type="file" />{selectedFile && <p className="text-xs text-[var(--text-muted)]">Imagen seleccionada: {selectedFile.name}</p>}<input className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2" onChange={(event) => onFormChange({ ...form, images: event.target.value ? [event.target.value] : [] })} placeholder="O pega una URL de imagen" type="url" value={form.images[0] ?? ''} /><label className="flex items-center gap-2 text-sm"><input checked={form.featured} onChange={(event) => onFormChange({ ...form, featured: event.target.checked })} type="checkbox" /> Producto destacado</label><button className="w-full rounded-lg bg-[var(--royal-violet)] px-4 py-3 font-semibold text-white disabled:opacity-60" disabled={isSaving} type="submit">{isSaving ? selectedFile ? 'Subiendo imagen y guardando...' : 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear producto'}</button>{editingId && <button className="w-full rounded-lg border border-[var(--border)] px-4 py-3 font-semibold" onClick={onCancel} type="button">Cancelar edición</button>}</form></section>
    <section><h2 className="font-[Space_Grotesk] text-xl font-bold">Productos ({products.length})</h2>{isLoading ? <p className="mt-4 text-[var(--text-muted)]">Cargando productos...</p> : <div className="mt-4 grid gap-3 sm:grid-cols-2">{products.map((product) => <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm" key={product.id}><h3 className="font-semibold">{product.name}</h3><p className="mt-1 text-sm text-[var(--text-muted)]">{product.category} · ${product.price.toLocaleString('es-AR')}</p><div className="mt-4 flex gap-3"><button className="text-sm font-semibold text-[var(--royal-violet)]" onClick={() => onEdit(product)} type="button">Editar</button><button className="text-sm font-semibold text-[var(--danger)]" onClick={() => onDelete(product.id)} type="button">Eliminar</button></div></article>)}</div>}</section>
  </div>
}

interface OrdersSectionProps { filter: 'all' | OrderStatus; isLoading: boolean; orders: Order[]; onFilterChange: (filter: 'all' | OrderStatus) => void; onStatusChange: (orderId: string, status: OrderStatus) => void }

function OrdersSection({ filter, isLoading, orders, onFilterChange, onStatusChange }: OrdersSectionProps) {
  return <section className="mt-8"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-[var(--text-muted)]">Gestiona el flujo de compras desde un solo lugar.</p><h2 className="mt-1 font-[Space_Grotesk] text-xl font-bold">Órdenes ({orders.length})</h2></div><select className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2" onChange={(event) => onFilterChange(event.target.value as 'all' | OrderStatus)} value={filter}><option value="all">Todos los estados</option>{orderStatuses.map((status) => <option key={status} value={status}>{orderStatusLabels[status]}</option>)}</select></div>{isLoading ? <p className="mt-6 text-[var(--text-muted)]">Cargando órdenes...</p> : <div className="mt-5 space-y-3">{orders.map((order) => <article className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm" key={order.id}><div><p className="font-semibold">Orden {order.id.slice(0, 8)}</p><p className="mt-1 text-sm text-[var(--text-muted)]">{order.userId} · ${order.total.toLocaleString('es-AR')}</p><p className="mt-1 text-xs text-[var(--text-muted)]">{order.items.length} productos</p></div><select className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2" onChange={(event) => onStatusChange(order.id, event.target.value as OrderStatus)} value={order.status}>{orderStatuses.map((status) => <option key={status} value={status}>{orderStatusLabels[status]}</option>)}</select></article>)}{orders.length === 0 && <p className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center text-[var(--text-muted)]">No hay órdenes para este filtro.</p>}</div>}</section>
}