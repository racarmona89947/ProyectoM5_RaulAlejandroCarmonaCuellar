import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import { firebaseApp, isFirebaseConfigured } from '../lib/firebase'
import type { Category } from '../types/domain'

function requireDatabase() {
  if (!isFirebaseConfigured || !firebaseApp) throw new Error('Firebase no esta configurado.')
  return getFirestore(firebaseApp)
}

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export async function getCategories() {
  const snapshot = await Promise.race([
    getDocs(query(collection(requireDatabase(), 'categories'), orderBy('name'))),
    new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error('CATEGORIES_TIMEOUT')), 2500)),
  ])
  return snapshot.docs.map((categoryDocument) => ({ id: categoryDocument.id, ...categoryDocument.data() })) as Category[]
}

export async function createCategory(name: string) {
  const normalizedName = name.trim()
  if (!normalizedName) throw new Error('Category name is required')
  return addDoc(collection(requireDatabase(), 'categories'), { name: normalizedName, slug: toSlug(normalizedName), active: true, createdAt: serverTimestamp() })
}

export async function updateCategory(categoryId: string, name: string, active: boolean) {
  const normalizedName = name.trim()
  if (!normalizedName) throw new Error('Category name is required')
  await updateDoc(doc(requireDatabase(), 'categories', categoryId), { name: normalizedName, slug: toSlug(normalizedName), active })
}

export async function deleteCategory(categoryId: string) {
  await deleteDoc(doc(requireDatabase(), 'categories', categoryId))
}