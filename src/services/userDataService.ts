import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore'
import { firebaseApp, isFirebaseConfigured } from '../lib/firebase'
import type { CartItem } from '../types/domain'

export const canUseCloudUserData = isFirebaseConfigured && Boolean(firebaseApp)

function requireDatabase() {
  if (!firebaseApp || !isFirebaseConfigured) throw new Error('Firebase no esta configurado.')
  return getFirestore(firebaseApp)
}

export async function getCloudCart(userId: string) {
  const snapshot = await getDoc(doc(requireDatabase(), 'carts', userId))
  const items = snapshot.data()?.items
  return Array.isArray(items) ? items as CartItem[] : null
}

export async function saveCloudCart(userId: string, items: CartItem[]) {
  await setDoc(doc(requireDatabase(), 'carts', userId), { userId, items, updatedAt: new Date() }, { merge: true })
}

export async function getCloudFavorites(userId: string) {
  const snapshot = await getDoc(doc(requireDatabase(), 'favorites', userId))
  const favoriteIds = snapshot.data()?.productIds
  return Array.isArray(favoriteIds) ? favoriteIds.filter((id): id is string => typeof id === 'string') : null
}

export async function saveCloudFavorites(userId: string, favoriteIds: string[]) {
  await setDoc(doc(requireDatabase(), 'favorites', userId), { userId, productIds: favoriteIds, updatedAt: new Date() }, { merge: true })
}
