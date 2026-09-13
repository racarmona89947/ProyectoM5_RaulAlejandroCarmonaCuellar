import { createContext } from 'react'
import type { CartAction, CartState } from './cartReducer'

export interface CartContextValue extends CartState {
  total: number
  count: number
  dispatch: React.Dispatch<CartAction>
}

export const CartContext = createContext<CartContextValue | undefined>(undefined)