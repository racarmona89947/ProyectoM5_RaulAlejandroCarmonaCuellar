import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from '../../features/auth/AuthContext'
import { CartProvider } from '../../features/cart/CartContext'
import { ThemeProvider } from '../../features/theme/ThemeContext'
import { ToastProvider } from '../../features/toast/ToastContext'
import { MarketplaceHeader } from '../../components/MarketplaceHeader'

describe('MarketplaceHeader', () => {
  it('opens categories and accepts a product search', () => {
    render(<ToastProvider><ThemeProvider><AuthProvider><CartProvider><MemoryRouter><MarketplaceHeader /></MemoryRouter></CartProvider></AuthProvider></ThemeProvider></ToastProvider>)

    fireEvent.click(screen.getByRole('button', { name: /categorías/i }))
    expect(screen.getByRole('button', { name: /categorías/i })).toHaveAttribute('aria-expanded', 'true')

    fireEvent.change(screen.getAllByRole('searchbox', { name: 'Buscar productos' })[0], { target: { value: 'auriculares' } })
    expect(screen.getAllByRole('searchbox', { name: 'Buscar productos' })[0]).toHaveValue('auriculares')
  })
})
