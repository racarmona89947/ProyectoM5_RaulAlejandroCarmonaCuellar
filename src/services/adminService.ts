import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { firebaseApp, firebaseAuth, isFirebaseConfigured } from '../lib/firebase'
import type { Order, OrderStatus, Product } from '../types/domain'

function requireDatabase() {
  if (!isFirebaseConfigured || !firebaseApp) throw new Error('Firebase no esta configurado.')
  return getFirestore(firebaseApp)
}

export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>

export async function uploadProductImage(file: File) {
  const token = await firebaseAuth?.currentUser?.getIdToken()
  if (!token) throw new Error('Authentication required')

  const metadataResponse = await fetch('/api/upload-url', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName: file.name, contentType: file.type, fileSize: file.size }),
  })
  if (!metadataResponse.ok) throw new Error('Could not request upload URL')
  const { uploadUrl, publicUrl } = await metadataResponse.json() as { uploadUrl: string; publicUrl: string }
  const uploadResponse = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })
  if (!uploadResponse.ok) throw new Error('Could not upload image')
  return publicUrl
}

export async function getAllProducts() {
  const database = requireDatabase()
  const snapshot = await getDocs(query(collection(database, 'products'), orderBy('createdAt', 'desc')))
  return snapshot.docs.map((productDocument) => ({ id: productDocument.id, ...productDocument.data() })) as Product[]
}

export async function createProduct(product: ProductInput) {
  const database = requireDatabase()
  const reference = await addDoc(collection(database, 'products'), {
    ...product,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return reference.id
}

export async function updateProduct(productId: string, product: Partial<ProductInput>) {
  const database = requireDatabase()
  await updateDoc(doc(database, 'products', productId), { ...product, updatedAt: serverTimestamp() })
}

export async function deleteProduct(productId: string) {
  const database = requireDatabase()
  await deleteDoc(doc(database, 'products', productId))
}

export async function getAllOrders() {
  const database = requireDatabase()
  const snapshot = await getDocs(query(collection(database, 'orders'), orderBy('createdAt', 'desc')))
  return snapshot.docs.map((orderDocument) => ({ id: orderDocument.id, ...orderDocument.data() })) as Order[]
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const database = requireDatabase()
  await updateDoc(doc(database, 'orders', orderId), { status, updatedAt: serverTimestamp() })
}