import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthContext, type AuthContextValue } from '../../contexts/auth/authContextStore'
import { AdminRoute, ProtectedRoute } from '../../routes/RouteGuards'

const baseAuth: AuthContextValue = {
  firebaseUser: null,
  profile: null,
  isLoading: false,
  isConfigured: true,
}

function renderGuard(element: React.ReactNode, auth: AuthContextValue, path = '/private') {
  return render(<AuthContext.Provider value={auth}><MemoryRouter initialEntries={[path]}><Routes><Route element={element} path="/private"><Route element={<p>Private page</p>} index /></Route><Route element={<p>Login page</p>} path="/login" /><Route element={<p>Home page</p>} path="/" /></Routes></MemoryRouter></AuthContext.Provider>)
}

describe('route guards', () => {
  it('redirects anonymous users to login', () => {
    renderGuard(<ProtectedRoute />, baseAuth)
    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  it('renders a protected route for authenticated users', () => {
    renderGuard(<ProtectedRoute />, { ...baseAuth, firebaseUser: { uid: 'user-1' } as AuthContextValue['firebaseUser'] })
    expect(screen.getByText('Private page')).toBeInTheDocument()
  })

  it('redirects non-admin users to home', () => {
    renderGuard(<AdminRoute />, { ...baseAuth, firebaseUser: { uid: 'user-1' } as AuthContextValue['firebaseUser'], profile: { role: 'customer' } as AuthContextValue['profile'] })
    expect(screen.getByText('Home page')).toBeInTheDocument()
  })
})
