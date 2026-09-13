import { collection, doc, getDoc, getDocs, getFirestore, orderBy, query } from 'firebase/firestore'
import { firebaseApp, isFirebaseConfigured } from '../lib/firebase'
import type { Product } from '../types/domain'

function requireDatabase() {
  if (!isFirebaseConfigured || !firebaseApp) {
    throw new Error('Firebase no esta configurado.')
  }

  return getFirestore(firebaseApp)
}

export async function getProducts() {
  const database = requireDatabase()
  const productsQuery = query(collection(database, 'products'), orderBy('createdAt', 'desc'))
  const snapshot = await Promise.race([
    getDocs(productsQuery),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('PRODUCTS_REQUEST_TIMEOUT')), 8000)
    }),
  ])

  return snapshot.docs.map((productDocument) => ({
    id: productDocument.id,
    ...productDocument.data(),
  })) as Product[]
}

export async function getProduct(productId: string) {
  const database = requireDatabase()
  const productSnapshot = await Promise.race([
    getDoc(doc(database, 'products', productId)),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('PRODUCT_TIMEOUT')), 2500)),
  ])

  if (!productSnapshot.exists()) {
    return null
  }

  return { id: productSnapshot.id, ...productSnapshot.data() } as Product
}