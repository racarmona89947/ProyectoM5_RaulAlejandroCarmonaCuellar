import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { getFirestore } from 'firebase/firestore'
import { firebaseApp, firebaseAuth, isFirebaseConfigured } from '../lib/firebase'
import type { UserProfile } from '../types/domain'

const googleProvider = new GoogleAuthProvider()

function requireFirebase() {
  if (!isFirebaseConfigured || !firebaseApp || !firebaseAuth) {
    throw new Error('Firebase no esta configurado. Completa las variables VITE_FIREBASE_* en .env.')
  }

  return { auth: firebaseAuth, database: getFirestore(firebaseApp) }
}

function getDisplayName(user: User) {
  return user.displayName ?? user.email?.split('@')[0] ?? 'Cliente'
}

export async function createUserProfile(user: User, displayName?: string) {
  const { database } = requireFirebase()
  const profileReference = doc(database, 'users', user.uid)
  const existingProfile = await getDoc(profileReference)

  if (!existingProfile.exists()) {
    await setDoc(profileReference, {
      uid: user.uid,
      email: user.email ?? '',
      displayName: displayName ?? getDisplayName(user),
      role: 'customer',
      createdAt: serverTimestamp(),
    })
  }
}

export async function getUserProfile(uid: string) {
  const { database } = requireFirebase()
  const profileSnapshot = await getDoc(doc(database, 'users', uid))

  return profileSnapshot.exists() ? (profileSnapshot.data() as UserProfile) : null
}

export async function registerWithEmail(email: string, password: string, displayName: string) {
  const { auth } = requireFirebase()
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(credential.user, { displayName })
  await createUserProfile(credential.user, displayName)
  return credential.user
}

export async function loginWithEmail(email: string, password: string) {
  const { auth } = requireFirebase()
  const credential = await signInWithEmailAndPassword(auth, email, password)
  await createUserProfile(credential.user)
  return credential.user
}

export async function loginWithGoogle() {
  const { auth } = requireFirebase()
  const credential = await signInWithPopup(auth, googleProvider)
  await createUserProfile(credential.user)
  return credential.user
}

export async function logoutUser() {
  const { auth } = requireFirebase()
  await signOut(auth)
}