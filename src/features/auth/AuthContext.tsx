import { onAuthStateChanged, type User } from 'firebase/auth'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { AuthContext } from './authContextStore'
import { firebaseAuth, isFirebaseConfigured } from '../../lib/firebase'
import { getUserProfile } from '../../services/authService'
import type { UserProfile } from '../../types/domain'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(isFirebaseConfigured)

  useEffect(() => {
    if (!firebaseAuth) {
      return
    }

    return onAuthStateChanged(firebaseAuth, async (user) => {
      setFirebaseUser(user)
      setProfile(null)

      if (user) {
        try {
          setProfile(await getUserProfile(user.uid))
        } catch {
          setProfile(null)
        } finally {
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    })
  }, [])

  const value = useMemo(
    () => ({ firebaseUser, profile, isLoading, isConfigured: isFirebaseConfigured }),
    [firebaseUser, isLoading, profile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}