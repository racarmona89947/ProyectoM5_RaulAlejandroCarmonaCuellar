import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import { useCart } from '../features/cart/useCart'
import { useTheme } from '../features/theme/useTheme'
import { getCategories } from '../services/categoryService'
import { getProducts } from '../services/productService'
import type { Product } from '../types/domain'
import { LoginModal } from './LoginModal'
import { RegisterModal } from './RegisterModal'

export function MarketplaceHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const { firebaseUser } = useAuth()
  const { count, items, total } = useCart()
  const { theme, toggleTheme } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [openPanel, setOpenPanel] = useState<'categories' | 'cart' | 'favorites' | null>(null)
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null)

  useEffect(() => {
    const state = location.state as { openLogin?: boolean; openRegister?: boolean } | null
    if (state?.openLogin || state?.openRegister) {
      const timeoutId = window.setTimeout(() => setAuthModal(state.openRegister ? 'register' : 'login'), 0)
      navigate(location.pathname, { replace: true, state: null })
      return () => window.clearTimeout(timeoutId)
    }
  }, [location.pathname, location.state, navigate])

  useEffect(() => {
    let isActive = true
    const timeoutId = window.setTimeout(() => {
      void getCategories().then((result) => {
        if (isActive) setCategories(result.filter((category) => category.active).map((category) => category.name))
      }).catch(() => undefined)
    }, 0)
    return () => { isActive = false; window.clearTimeout(timeoutId) }
  }, [])

  useEffect(() => {
    let isActive = true
    void getProducts().then((result) => {
      if (isActive) setProducts(result)
    }).catch(() => undefined)
    return () => { isActive = false }
  }, [])

  const normalizedSearch = searchTerm.trim().toLowerCase()
  const suggestions = normalizedSearch.length > 0
    ? products.filter((product) => [product.name, product.brand, product.category, product.description].some((value) => value.toLowerCase().includes(normalizedSearch))).slice(0, 5)
    : []

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = searchTerm.trim()
    navigate(query ? `/catalog?q=${encodeURIComponent(query)}` : '/catalog')
    setOpenPanel(null)
  }

  function togglePanel(panel: 'categories' | 'cart' | 'favorites') {
    setOpenPanel((current) => current === panel ? null : panel)
  }

  return <>
    <header className="relative z-40 border-b border-white/15 bg-[var(--royal-violet)] text-white shadow-lg shadow-purple-950/10">
      <div className="relative mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
        {/* Logo */}
        <Link className="shrink-0 font-[Space_Grotesk] text-2xl font-bold tracking-tight text-white hover:opacity-90" to="/">NexoMarket</Link>

        {/* Categorias Button & Search Bar (Grouped for desktop) */}
        <div className="hidden flex-1 items-center gap-3 lg:flex">
          <div className="relative">
            <button aria-expanded={openPanel === 'categories'} aria-haspopup="menu" className="flex h-10 items-center gap-2 rounded-xl border border-white/35 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/60 hover:bg-white/15" onClick={() => togglePanel('categories')} type="button">
              Categorías <span aria-hidden="true" className={`text-xs transition-transform ${openPanel === 'categories' ? 'rotate-180' : ''}`}>⌄</span>
            </button>
            {openPanel === 'categories' && <CategoryPanel categories={categories} onClose={() => setOpenPanel(null)} />}
          </div>

          <div className="relative flex-1"><form className="flex h-10 items-center rounded-xl bg-white px-4 shadow-inner ring-1 ring-black/5" onSubmit={handleSearch}>
            <label className="sr-only" htmlFor="global-search">Buscar productos</label>
            <input className="w-full bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-gray-400" id="global-search" onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar en NexoMarket" type="search" value={searchTerm} />
            <button aria-label="Buscar" className="flex h-full items-center justify-center pl-3 pr-1 text-gray-500 hover:text-[var(--royal-violet)]" type="submit">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
            </button>
          </form><SearchSuggestions products={suggestions} onSelect={(productId) => { setSearchTerm(''); navigate(`/products/${productId}`) }} /></div>
        </div>

        {/* Right side actions */}
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-5">
          {/* Theme toggle */}
          <button aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'} className="hidden items-center justify-center rounded-full p-2 text-white hover:bg-white/10 sm:flex" onClick={toggleTheme} type="button">
            {theme === 'light' ? <span className="text-lg">☾</span> : <span className="text-lg">☀</span>}
          </button>

          {/* Auth / Profile */}
          <div className="hidden flex-col items-start justify-center md:flex">
            {firebaseUser ? (
              <Link className="group flex flex-col items-start leading-tight" to="/account">
                <span className="text-xs text-white/80">Hola,</span>
                <span className="text-sm font-bold text-white group-hover:underline">Mi cuenta ⌄</span>
              </Link>
            ) : (
              <button className="group flex flex-col items-start leading-tight" onClick={() => setAuthModal('login')} type="button">
                <span className="text-xs text-white/80">Hola,</span>
                <span className="text-sm font-bold text-white group-hover:underline">Inicia sesión ⌄</span>
              </button>
            )}
          </div>

          <div className="flex items-center md:hidden">
            {firebaseUser ? <Link aria-label="Mi cuenta" className="rounded-lg px-2 py-1 text-xs font-bold text-white hover:bg-white/10" to="/account">Cuenta</Link> : <button className="rounded-lg px-2 py-1 text-xs font-bold text-white hover:bg-white/10" onClick={() => setAuthModal('login')} type="button">Ingresar</button>}
          </div>

          {firebaseUser && <>
          {/* Favorites */}
          <button aria-expanded={openPanel === 'favorites'} aria-label="Ver favoritos" className="relative flex items-center justify-center rounded-full p-2 text-white transition-transform hover:scale-110 hover:bg-white/10" onClick={() => togglePanel('favorites')} type="button">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
          </button>

          {/* Cart */}
          <button aria-expanded={openPanel === 'cart'} aria-label={`Ver carrito, ${count} productos`} className="relative flex items-center justify-center rounded-full p-2 text-white transition-transform hover:scale-110 hover:bg-white/10" onClick={() => togglePanel('cart')} type="button">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
            {count > 0 && <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--pearl-aqua)] px-1.5 text-xs font-bold text-[var(--text)] shadow-sm">{count}</span>}
          </button>
          </>}
        </div>
      </div>

      {/* Mobile Search Bar (shows on small screens below the header) */}
      <div className="bg-[var(--royal-violet)] px-4 pb-3 lg:hidden">
        <div className="relative"><div className="mb-2 flex justify-end"><button aria-expanded={openPanel === 'categories'} aria-haspopup="menu" className="rounded-lg border border-white/35 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white" onClick={() => togglePanel('categories')} type="button">Categorías <span aria-hidden="true">⌄</span></button></div>{openPanel === 'categories' && <CategoryPanel categories={categories} mobile onClose={() => setOpenPanel(null)} />}<form className="flex h-10 items-center rounded-xl bg-white px-4 shadow-inner" onSubmit={handleSearch}>
          <label className="sr-only" htmlFor="mobile-search">Buscar productos</label>
          <input className="w-full bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-gray-400" id="mobile-search" onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar en NexoMarket" type="search" value={searchTerm} />
            <button className="flex h-full items-center justify-center pl-2 text-gray-500" type="submit">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
            </button>
          </form><SearchSuggestions products={suggestions} onSelect={(productId) => { setSearchTerm(''); navigate(`/products/${productId}`) }} /></div>
      </div>
      {firebaseUser && openPanel === 'cart' && <div className="absolute right-4 top-full z-30 w-[min(22rem,calc(100vw-2rem))] rounded-b-2xl border border-t-0 border-[var(--border)] bg-[var(--surface)] p-4 text-[var(--text)] shadow-xl"><h2 className="font-[Space_Grotesk] text-lg font-bold">Tu carrito</h2>{items.length === 0 ? <p className="py-5 text-sm text-[var(--text-muted)]">Todavía no agregaste productos.</p> : <div className="mt-3 space-y-3">{items.slice(0, 3).map((item) => <div className="flex items-center justify-between gap-3 text-sm" key={item.productId}><span className="truncate">{item.name} x {item.quantity}</span><strong>${(item.price * item.quantity).toLocaleString('es-AR')}</strong></div>)}<p className="border-t border-[var(--border)] pt-3 text-right font-bold">Total: ${total.toLocaleString('es-AR')}</p></div>}<Link className="mt-4 block rounded-xl bg-[var(--royal-violet)] px-4 py-3 text-center text-sm font-semibold text-white" onClick={() => setOpenPanel(null)} to="/cart">Ver carrito completo</Link></div>}
      {firebaseUser && openPanel === 'favorites' && <div className="absolute right-16 top-full z-30 w-64 rounded-b-2xl border border-t-0 border-[var(--border)] bg-[var(--surface)] p-4 text-[var(--text)] shadow-xl"><h2 className="font-[Space_Grotesk] text-lg font-bold">Favoritos</h2><p className="py-5 text-sm text-[var(--text-muted)]">Guarda productos para encontrarlos después.</p><Link className="block rounded-xl border border-[var(--border)] px-4 py-3 text-center text-sm font-semibold" onClick={() => setOpenPanel(null)} to="/favorites">Ver favoritos</Link></div>}
    </header>
    {authModal === 'login' && <LoginModal onClose={() => setAuthModal(null)} onOpenRegister={() => setAuthModal('register')} />}
    {authModal === 'register' && <RegisterModal onClose={() => setAuthModal(null)} onOpenLogin={() => setAuthModal('login')} />}
  </>
}

function CategoryPanel({ categories, mobile = false, onClose }: { categories: string[]; mobile?: boolean; onClose: () => void }) {
  return <div className={mobile ? 'relative z-50 mb-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--text)] shadow-2xl shadow-black/20' : 'absolute left-0 top-[calc(100%+0.75rem)] z-50 w-64 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--text)] shadow-2xl shadow-black/20'} role="menu">
    <div className="border-b border-[var(--border)] px-3 pb-2 pt-1">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">Explora por categoría</p>
    </div>
    {categories.length > 0 ? categories.map((category) => <Link className="mt-1 flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition hover:bg-[var(--surface-muted)] hover:text-[var(--royal-violet)]" key={category} onClick={onClose} role="menuitem" to={`/catalog?category=${encodeURIComponent(category)}`}><span>{category}</span><span aria-hidden="true">→</span></Link>) : <p className="px-3 py-4 text-sm text-[var(--text-muted)]">Aún no hay categorías.</p>}
  </div>
}

function SearchSuggestions({ products, onSelect }: { products: Product[]; onSelect: (productId: string) => void }) {
  if (products.length === 0) return null

  return <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--text)] shadow-2xl shadow-black/20">{products.map((product) => <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-[var(--surface-muted)]" key={product.id} onClick={() => onSelect(product.id)} type="button"><img alt="" className="h-10 w-10 rounded-lg bg-[var(--surface-muted)] object-contain" src={product.images[0] ?? '/product-placeholder.svg'} /><span className="min-w-0"><strong className="block truncate text-sm">{product.name}</strong><span className="block truncate text-xs text-[var(--text-muted)]">{product.brand} · {product.category}</span></span><span className="ml-auto text-sm font-bold text-[var(--royal-violet)]">${product.price.toLocaleString('es-AR')}</span></button>)}</div>
}