import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './features/auth/AuthContext'
import { CartProvider } from './features/cart/CartContext'
import { FavoritesProvider } from './features/favorites/FavoritesContext'
import { ThemeProvider } from './features/theme/ThemeContext'
import { ToastProvider } from './features/toast/ToastContext'
import { AppRouter } from './routes/AppRouter'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <BrowserRouter>
                <AppRouter />
              </BrowserRouter>
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
)
