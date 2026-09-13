import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../../App'
import { AuthProvider } from '../../features/auth/AuthContext'
import { CartProvider } from '../../features/cart/CartContext'
import { ThemeProvider } from '../../features/theme/ThemeContext'
import { ToastProvider } from '../../features/toast/ToastContext'

describe('App', () => {
  it('renders the initial application shell', () => {
    render(<ToastProvider><ThemeProvider><AuthProvider><CartProvider><MemoryRouter><App /></MemoryRouter></CartProvider></AuthProvider></ThemeProvider></ToastProvider>)

    expect(screen.getByRole('heading', { name: 'Descubre productos para cada parte de tu día.' })).toBeInTheDocument()
  })
})
