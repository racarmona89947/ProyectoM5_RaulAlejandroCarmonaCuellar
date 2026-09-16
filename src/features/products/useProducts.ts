import { useEffect, useMemo, useState } from 'react'
import { getProducts } from '../../services/productService'
import { getCategories } from '../../services/categoryService'
import type { Category, Product } from '../../types/domain'

export function useProducts(initialSearch = '', initialCategory = 'all') {
  const [products, setProducts] = useState<Product[]>([])
  const [firestoreCategories, setFirestoreCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [category, setCategory] = useState(initialCategory)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    setSearchTerm(initialSearch)
    setCategory(initialCategory)
  }, [initialCategory, initialSearch])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearch(searchTerm.trim().toLowerCase()), 350)

    return () => window.clearTimeout(timeoutId)
  }, [searchTerm])

  useEffect(() => {
    let isActive = true

    async function loadProducts() {
      setIsLoading(true)
      setError('')

      const timeoutId = window.setTimeout(() => {
        if (isActive) {
          setIsLoading(false)
          setError('El catalogo esta tardando demasiado. Verifica la conexion con Firebase e intenta nuevamente.')
        }
      }, 2500)

      try {
        const [nextProducts, nextCategories] = await Promise.all([
          getProducts(),
          getCategories().catch(() => []),
        ])
        if (isActive) {
          setProducts(nextProducts)
          setFirestoreCategories(nextCategories.filter((categoryItem) => categoryItem.active))
        }
      } catch {
        if (isActive) setError('No pudimos cargar el catalogo. Intenta nuevamente.')
      } finally {
        window.clearTimeout(timeoutId)
        if (isActive) setIsLoading(false)
      }
    }

    void loadProducts()

    return () => {
      isActive = false
    }
  }, [reloadKey])

  const categories = useMemo(
    () => ['all', ...new Set(firestoreCategories.map((categoryItem) => categoryItem.name))],
    [firestoreCategories],
  )

  const filteredProducts = useMemo(
    () => products.filter((product) => {
      const matchesCategory = category === 'all' || product.category === category
      const matchesSearch = product.name.toLowerCase().includes(debouncedSearch)
      return matchesCategory && matchesSearch
    }),
    [category, debouncedSearch, products],
  )

  return {
    categories,
    category,
    filteredProducts,
    isLoading,
    error,
    searchTerm,
    setCategory,
    setSearchTerm,
    retry: () => setReloadKey((key) => key + 1),
  }
}