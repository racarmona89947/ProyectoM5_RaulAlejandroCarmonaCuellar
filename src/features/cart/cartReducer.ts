import type { CartItem } from '../../types/domain'

export interface CartState {
  items: CartItem[]
}

export type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { productId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }

export const initialCartState: CartState = { items: [] }

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find((item) => item.productId === action.payload.productId)

      if (existingItem) {
        return {
          items: state.items.map((item) => item.productId === action.payload.productId
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item),
        }
      }

      return { items: [...state.items, action.payload] }
    }
    case 'REMOVE_ITEM':
      return { items: state.items.filter((item) => item.productId !== action.payload.productId) }
    case 'UPDATE_QUANTITY':
      return {
        items: action.payload.quantity <= 0
          ? state.items.filter((item) => item.productId !== action.payload.productId)
          : state.items.map((item) => item.productId === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item),
      }
    case 'CLEAR_CART':
      return initialCartState
    default:
      return state
  }
}

export function getCartTotal(items: CartItem[]) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0)
}

export function getCartCount(items: CartItem[]) {
  return items.reduce((count, item) => count + item.quantity, 0)
}