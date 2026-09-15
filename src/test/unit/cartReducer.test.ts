import { describe, expect, it } from 'vitest'
import { cartReducer, getCartCount, getCartTotal, initialCartState } from '../../features/cart/cartReducer'

const item = { productId: 'p-1', name: 'Auriculares', price: 100, image: '', quantity: 1 }

describe('cartReducer', () => {
  it('adds an item and increments an existing item', () => {
    const withItem = cartReducer(initialCartState, { type: 'ADD_ITEM', payload: item })
    const updated = cartReducer(withItem, { type: 'ADD_ITEM', payload: { ...item, quantity: 2 } })

    expect(updated.items).toEqual([{ ...item, quantity: 3 }])
  })

  it('updates quantity and removes when it reaches zero', () => {
    const state = { items: [item] }
    const updated = cartReducer(state, { type: 'UPDATE_QUANTITY', payload: { productId: 'p-1', quantity: 3 } })
    const removed = cartReducer(updated, { type: 'UPDATE_QUANTITY', payload: { productId: 'p-1', quantity: 0 } })

    expect(updated.items[0].quantity).toBe(3)
    expect(removed.items).toEqual([])
  })

  it('calculates total from price and quantity', () => {
    expect(getCartTotal([{ ...item, quantity: 3 }])).toBe(300)
  })

  it('counts all quantities and preserves unknown actions', () => {
    const state = { items: [{ ...item, quantity: 2 }, { ...item, productId: 'p-2', quantity: 4 }] }

    expect(getCartCount(state.items)).toBe(6)
    expect(cartReducer(state, { type: 'UNKNOWN' } as never)).toBe(state)
  })
})
