import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MarketplaceHeader } from '../components/MarketplaceHeader'
import { useAuth } from '../features/auth/useAuth'
import { useCart } from '../features/cart/useCart'
import { useFavorites } from '../features/favorites/useFavorites'
import { useToast } from '../features/toast/useToast'
import { getProduct } from '../services/productService'
import type { Product } from '../types/domain'

export function ProductDetailPage() {
  const { productId } = useParams()
  const { firebaseUser } = useAuth()
  const { dispatch } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { showToast } = useToast()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!productId) return
    let isActive = true
    getProduct(productId).then((nextProduct) => { if (isActive) setProduct(nextProduct) }).catch(() => { if (isActive) setError('No pudimos cargar este producto.') }).finally(() => { if (isActive) setIsLoading(false) })
    return () => { isActive = false }
  }, [productId])

  if (isLoading) return <main className="min-h-screen bg-[var(--page)]"><MarketplaceHeader /><p className="p-12 text-center text-[var(--text-muted)]">Cargando producto...</p></main>
  if (error) return <main className="min-h-screen bg-[var(--page)]"><MarketplaceHeader /><p className="p-12 text-center text-[var(--danger)]" role="alert">{error}</p></main>
  if (!product) return <main className="min-h-screen bg-[var(--page)]"><MarketplaceHeader /><p className="p-12 text-center text-[var(--text-muted)]">Producto no encontrado.</p></main>

  const loadedProduct = product
  const favorite = isFavorite(loadedProduct.id)
  const discount = loadedProduct.previousPrice ? Math.round((1 - loadedProduct.price / loadedProduct.previousPrice) * 100) : null
  const outOfStock = loadedProduct.stock <= 0
  function addToCart() { dispatch({ type: 'ADD_ITEM', payload: { productId: loadedProduct.id, name: loadedProduct.name, price: loadedProduct.price, image: loadedProduct.images[0] ?? '', quantity: 1 } }); showToast(`${loadedProduct.name} se añadió al carrito.`, 'success') }
  function toggleProductFavorite() { toggleFavorite(loadedProduct.id); showToast(favorite ? 'Producto eliminado de favoritos.' : 'Producto guardado en favoritos.', 'success') }

  return <main className="min-h-screen bg-[var(--page)] text-[var(--text)]"><MarketplaceHeader /><div className="mx-auto max-w-6xl px-4 py-8 sm:px-6"><Link className="font-semibold text-[var(--royal-violet)]" to="/catalog">← Volver al catálogo</Link><section className="mt-8 grid overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm lg:grid-cols-[1.05fr_0.95fr]"><div className="flex min-h-[360px] items-center justify-center bg-[var(--surface-muted)] p-8 sm:min-h-[520px] sm:p-12"><img alt={product.name} className="max-h-[480px] w-full object-contain" src={product.images[0] ?? '/product-placeholder.svg'} /></div><div className="flex flex-col p-6 sm:p-10"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--indigo-bloom)]">{product.brand}</p><p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">{product.category}</p></div>{firebaseUser && <button aria-label={favorite ? `Quitar ${product.name} de favoritos` : `Agregar ${product.name} a favoritos`} aria-pressed={favorite} className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${favorite ? 'border-pink-200 bg-pink-50 text-pink-600' : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--royal-violet)]'}`} onClick={toggleProductFavorite} type="button">{favorite ? '♥' : '♡'}</button>}</div><h1 className="mt-5 font-[Space_Grotesk] text-4xl font-bold leading-tight">{product.name}</h1><p className="mt-6 leading-7 text-[var(--text-muted)]">{product.description}</p><div className="mt-8 border-y border-[var(--border)] py-6"><div className="flex items-end gap-3"><p className="text-4xl font-bold text-[var(--royal-violet)]">${product.price.toLocaleString('es-AR')}</p>{discount && <span className="mb-1 rounded bg-pink-100 px-2 py-1 text-xs font-bold text-pink-700">-{discount}%</span>}</div>{product.previousPrice && <p className="mt-1 text-sm text-[var(--text-muted)] line-through">${product.previousPrice.toLocaleString('es-AR')}</p>}<p className={`mt-4 text-sm font-semibold ${outOfStock ? 'text-[var(--danger)]' : 'text-teal-600'}`}>{outOfStock ? 'Agotado' : `${product.stock} unidades disponibles`}</p></div>{firebaseUser && <button className="mt-8 rounded-xl bg-[var(--royal-violet)] px-5 py-3 font-semibold text-white transition hover:bg-[var(--indigo-bloom)] disabled:cursor-not-allowed disabled:opacity-50" disabled={outOfStock} onClick={addToCart} type="button">{outOfStock ? 'Sin stock' : 'Añadir al carrito'}</button>}</div></section></div></main>
}