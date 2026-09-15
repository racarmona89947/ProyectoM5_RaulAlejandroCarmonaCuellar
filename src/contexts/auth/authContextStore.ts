import { createContext } from 'react'
import type { User } from 'firebase/auth'
import type { UserProfile } from '../../types/domain'

export interface AuthContextValue {
  firebaseUser: User | null
  profile: UserProfile | null
  isLoading: boolean
  isConfigured: boolean
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)