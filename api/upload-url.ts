import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
const maxFileSize = 5 * 1024 * 1024
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

function getS3Client() {
  const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } = process.env
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION) {
    throw new Error('Missing S3 server configuration')
  }

  return new S3Client({
    region: AWS_REGION,
    credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY },
  })
}

function getFirebaseAdminAuth() {
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env
  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    throw new Error('Missing Firebase server configuration')
  }

  const app = getApps()[0] ?? initializeApp({
    credential: cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  })
  return getAuth(app)
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' })

  const authorization = request.headers.authorization
  if (!authorization?.startsWith('Bearer ')) return response.status(401).json({ error: 'Authentication required' })

  try {
    const decodedToken = await getFirebaseAdminAuth().verifyIdToken(authorization.slice(7))
    const profile = await getFirestore().doc(`users/${decodedToken.uid}`).get()
    if (profile.data()?.role !== 'admin') return response.status(403).json({ error: 'Admin role required' })
  } catch {
    return response.status(401).json({ error: 'Invalid authentication token' })
  }

  const bucket = process.env.AWS_S3_BUCKET
  const { fileName, contentType, fileSize } = request.body as { fileName?: string; contentType?: string; fileSize?: number }
  if (!bucket || !fileName || !contentType || !fileSize || !allowedTypes.has(contentType) || fileSize > maxFileSize) {
    return response.status(400).json({ error: 'Invalid image metadata' })
  }

  try {
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase()
    const objectKey = `products/${crypto.randomUUID()}-${safeName}`
    const command = new PutObjectCommand({ Bucket: bucket, Key: objectKey, ContentType: contentType, ContentLength: fileSize })
    const uploadUrl = await getSignedUrl(getS3Client(), command, { expiresIn: 300 })
    const publicUrl = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${objectKey}`
    return response.status(200).json({ uploadUrl, objectKey, publicUrl })
  } catch {
    return response.status(500).json({ error: 'Could not create upload URL' })
  }
}