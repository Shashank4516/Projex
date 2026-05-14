import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

function usernameLowerFromEmail(email) {
  const local = typeof email === 'string' ? email.split('@')[0] : ''
  return String(local).toLowerCase().replace(/[^a-z0-9_]/g, '')
}

/**
 * Merge the signed-in user into `users/{uid}` (displayName, email, photoURL).
 * Adds lowercase fields for prefix search (navbar user search).
 * @param {import('firebase/auth').User} user
 */
export async function syncUserDocument(user) {
  if (!db) return
  const ref = doc(db, 'users', user.uid)
  const displayName = (user.displayName ?? '').trim()
  await setDoc(
    ref,
    {
      email: user.email ?? '',
      displayName,
      photoURL: user.photoURL ?? '',
      displayNameLower: displayName.toLowerCase(),
      usernameLower: usernameLowerFromEmail(user.email ?? ''),
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
  const payload = { ...data }
  if (typeof data.displayName === 'string') {
    payload.displayNameLower = data.displayName.trim().toLowerCase()
  }
  if (typeof data.username === 'string' && data.username.trim()) {
    payload.usernameLower = data.username
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
  }
  await setDoc(ref, { ...payload, updatedAt: serverTimestamp() }, { merge: true })
}
