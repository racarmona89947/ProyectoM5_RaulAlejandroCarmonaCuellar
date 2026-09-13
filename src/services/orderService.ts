import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  where,
} from 'firebase/firestore'
import { firebaseApp, firebaseAuth, isFirebaseConfigured } from '../lib/firebase'
import type { CartItem, Order } from '../types/domain'

function requireDatabase() {
  if (!isFirebaseConfigured || !firebaseApp) {
    throw new Error('Firebase no esta configurado.')
  }

  return getFirestore(firebaseApp)
}

export async function createOrder(userId: string, items: CartItem[]) {
  if (items.length === 0 || items.some((item) => !Number.isInteger(item.quantity) || item.quantity <= 0)) {
    throw new Error('INVALID_CART')
  }
  if (new Set(items.map((item) => item.productId)).size !== items.length) {
    throw new Error('DUPLICATE_CART_ITEMS')
  }

  const token = await firebaseAuth?.currentUser?.getIdToken()
  if (!token) throw new Error('Authentication required')
  const response = await fetch('/api/create-order', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, items: items.map(({ productId, quantity }) => ({ productId, quantity })) }),
  })
  if (!response.ok) {
    const result = await response.json().catch(() => ({})) as { error?: string }
    if (response.status === 409) throw new Error('INSUFFICIENT_STOCK')
    throw new Error(result.error ?? 'ORDER_CREATION_FAILED')
  }
  const result = await response.json() as { orderId: string }
  return result.orderId
}

export async function getOrdersByUser(userId: string) {
  const database = requireDatabase()
  const ordersQuery = query(collection(database, 'orders'), where('userId', '==', userId))
  const snapshot = await getDocs(ordersQuery)

  const orders = snapshot.docs.map((orderDocument) => ({
    id: orderDocument.id,
    ...orderDocument.data(),
  })) as Order[]

  return orders.sort((firstOrder, secondOrder) => getTimestampMillis(secondOrder.createdAt) - getTimestampMillis(firstOrder.createdAt))
}

function getTimestampMillis(value: Order['createdAt']) {
  return typeof value?.toMillis === 'function' ? value.toMillis() : 0
}

export async function getOrder(orderId: string) {
  const database = requireDatabase()
  const orderSnapshot = await getDoc(doc(database, 'orders', orderId))

  if (!orderSnapshot.exists()) return null

  return { id: orderSnapshot.id, ...orderSnapshot.data() } as Order
}