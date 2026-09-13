import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import type { VercelRequest, VercelResponse } from '@vercel/node'

interface RequestItem {
  productId?: string
  quantity?: number
}

function getFirebaseApp() {
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env
  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    throw new Error('Missing Firebase server configuration')
  }

  return getApps()[0] ?? initializeApp({
    credential: cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  })
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' })

  const authorization = request.headers.authorization
  if (!authorization?.startsWith('Bearer ')) return response.status(401).json({ error: 'Authentication required' })

  try {
    const app = getFirebaseApp()
    const user = await getAuth(app).verifyIdToken(authorization.slice(7))
    const requestItems = request.body?.items as RequestItem[] | undefined
    if (!Array.isArray(requestItems) || requestItems.length === 0) return response.status(400).json({ error: 'Invalid cart' })

    const items = requestItems.map((item) => ({ productId: item.productId ?? '', quantity: item.quantity ?? 0 }))
    if (items.some((item) => !item.productId || !Number.isInteger(item.quantity) || item.quantity <= 0)) {
      return response.status(400).json({ error: 'Invalid cart' })
    }
    if (new Set(items.map((item) => item.productId)).size !== items.length) return response.status(400).json({ error: 'Duplicate products' })

    const database = getFirestore(app)
    const orderReference = database.collection('orders').doc()
    await database.runTransaction(async (transaction) => {
      const productReferences = items.map((item) => database.collection('products').doc(item.productId))
      const productSnapshots = await Promise.all(productReferences.map((reference) => transaction.get(reference)))
      const verifiedItems = items.map((item, index) => {
        const snapshot = productSnapshots[index]
        if (!snapshot.exists) throw new Error('PRODUCT_NOT_FOUND')
        const product = snapshot.data()
        const stock = Number(product?.stock)
        if (!Number.isInteger(stock) || stock < item.quantity) throw new Error(`INSUFFICIENT_STOCK:${product?.name ?? item.productId}`)
        return { productId: item.productId, name: String(product?.name ?? ''), price: Number(product?.price), image: String(product?.images?.[0] ?? ''), quantity: item.quantity }
      })
      const total = verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

      productSnapshots.forEach((snapshot, index) => {
        const product = snapshot.data()
        const item = verifiedItems[index]
        if (!product || !item) throw new Error('INVALID_PRODUCT')
        transaction.update(productReferences[index], { stock: Number(product.stock) - item.quantity, updatedAt: FieldValue.serverTimestamp() })
      })
      transaction.set(orderReference, { userId: user.uid, items: verifiedItems, total, status: 'pending', createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() })
    })

    return response.status(201).json({ orderId: orderReference.id })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('INSUFFICIENT_STOCK')) return response.status(409).json({ error: 'Insufficient stock' })
    if (error instanceof Error && error.message === 'PRODUCT_NOT_FOUND') return response.status(404).json({ error: 'Product not found' })
    return response.status(500).json({ error: 'Could not create order' })
  }
}
