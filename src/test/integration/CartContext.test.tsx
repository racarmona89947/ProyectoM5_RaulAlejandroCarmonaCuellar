import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { CartProvider } from '../../features/cart/CartContext'
import { useCart } from '../../features/cart/useCart'

function CartProbe() {
  const { count, dispatch, total } = useCart()
  return <div><button onClick={() => dispatch({ type: 'ADD_ITEM', payload: { productId: 'p1', name: 'Teclado', price: 50, image: '', quantity: 1 } })} type="button">Agregar</button><button onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { productId: 'p1', quantity: 2 } })} type="button">Actualizar cantidad</button><button onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: { productId: 'p1' } })} type="button">Eliminar</button><span>{count}</span><span>{total}</span></div>
}

describe('CartContext', () => {
  it('adds, updates and removes an item through the user flow', async () => {
    const user = userEvent.setup()
    render(<CartProvider><CartProbe /></CartProvider>)

    await user.click(screen.getByRole('button', { name: 'Agregar' }))
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Actualizar cantidad' }))
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Eliminar' }))
    expect(screen.getAllByText('0')).toHaveLength(2)
  })
})
