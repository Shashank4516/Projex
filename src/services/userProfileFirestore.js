import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

/**
 * Merge the signed-in user into `users/{uid}` (displayName, email, photoURL).
 * @param {import('firebase/auth').User} user
 */
export async function syncUserDocument(user) {
  if (!db) return
  const ref = doc(db, 'users', user.uid)
  await setDoc(
    ref,
    {
      email: user.email ?? '',
      displayName: user.displayName ?? '',
      photoURL: user.photoURL ?? '',
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

/**
 * @param {string} uid
 * @returns {Promise<Record<string, unknown> | null>}
 */
export async function getUserDocument(uid) {
  if (!db) return null
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  return snap.data()
}

/** @param {string} uid */
export async function mergeUserProfileFields(uid, data) {
  if (!db) return
  const ref = doc(db, 'users', uid)
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true })
}
