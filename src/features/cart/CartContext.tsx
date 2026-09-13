import { useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'
import { CartContext } from './cartContextStore'
import { getCartCount, getCartTotal, initialCartState, cartReducer } from './cartReducer'
import { AuthContext } from '../auth/authContextStore'
import { canUseCloudUserData, getCloudCart, saveCloudCart } from '../../services/userDataService'

const CART_STORAGE_KEY = 'nexomarket-cart'

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const auth = useContext(AuthContext)
  const firebaseUser = auth?.firebaseUser ?? null
  const isLoading = auth?.isLoading ?? false
  const [state, dispatch] = useReducer(cartReducer, initialCartState)
  const hydratedKey = useRef<string | null>(null)

  const storageKey = firebaseUser ? `${CART_STORAGE_KEY}-${firebaseUser.uid}` : null

  useEffect(() => {
    if (isLoading) return
    hydratedKey.current = null
    dispatch({ type: 'CLEAR_CART' })
    if (!storageKey) return
    const userStorageKey = storageKey
    let isActive = true
    async function loadCart() {
      let items = [] as typeof initialCartState.items
      try {
        const cloudItems = canUseCloudUserData && firebaseUser ? await getCloudCart(firebaseUser.uid) : null
        if (cloudItems) items = cloudItems
        else {
          const savedCart = localStorage.getItem(userStorageKey)
          const parsedCart = savedCart ? JSON.parse(savedCart) as typeof initialCartState : initialCartState
          items = parsedCart.items ?? []
        }
      } catch {
        localStorage.removeItem(userStorageKey)
      }
      if (!isActive) return
      items.forEach((item) => dispatch({ type: 'ADD_ITEM', payload: item }))
      hydratedKey.current = userStorageKey
    }
    void loadCart()
    return () => { isActive = false }
  }, [firebaseUser, isLoading, storageKey])

  useEffect(() => {
    if (!storageKey || hydratedKey.current !== storageKey) return
    localStorage.setItem(storageKey, JSON.stringify(state))
    if (canUseCloudUserData && firebaseUser) void saveCloudCart(firebaseUser.uid, state.items).catch(() => undefined)
  }, [firebaseUser, state, storageKey])

  const value = useMemo(() => ({
    ...state,
    total: getCartTotal(state.items),
    count: getCartCount(state.items),
    dispatch,
  }), [state])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}