import { createContext } from 'react'

export interface FavoritesContextValue {
  favoriteIds: string[]
  isFavorite: (productId: string) => boolean
  toggleFavorite: (productId: string) => void
}

export const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined)