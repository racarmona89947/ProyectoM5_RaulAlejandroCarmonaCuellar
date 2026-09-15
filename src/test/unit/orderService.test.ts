import { describe, expect, it } from 'vitest'
import { createOrder } from '../../services/orderService'

const item = { productId: 'p-1', name: 'Producto', price: 100, image: '', quantity: 1 }

describe('orderService validation', () => {
  it('rejects an empty cart before contacting Firebase', async () => {
    await expect(createOrder('user-1', [])).rejects.toThrow('INVALID_CART')
  })

  it('rejects non-positive quantities', async () => {
    await expect(createOrder('user-1', [{ ...item, quantity: 0 }])).rejects.toThrow('INVALID_CART')
  })

  it('rejects duplicate product ids', async () => {
    await expect(createOrder('user-1', [item, { ...item, quantity: 2 }])).rejects.toThrow('DUPLICATE_CART_ITEMS')
  })
})
