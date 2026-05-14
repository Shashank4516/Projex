import { collection, getDocs, limit, query, where } from 'firebase/firestore'
import { db } from '../firebase'

const RESULT_LIMIT = 12

/**
 * Prefix search on Firestore `users` — matches display name or @username (email local-part).
 * Requires docs to have `displayNameLower` / `usernameLower` (written by {@link syncUserDocument}).
 *
 * @param {string} prefix raw query (trimmed / lowercased inside)
 * @returns {Promise<{ uid: string, displayName: string, photoURL: string, email: string }[]>}
 */
export async function searchUsers(prefix) {
  if (!db) return []
  const raw = String(prefix ?? '').trim().toLowerCase()
  if (raw.length < 2) return []

  const coll = collection(db, 'users')
  const qName = query(
    coll,
    where('displayNameLower', '>=', raw),
    where('displayNameLower', '<=', `${raw}\uf8ff`),
    limit(RESULT_LIMIT),
  )
  const qUser = query(
    coll,
    where('usernameLower', '>=', raw),
    where('usernameLower', '<=', `${raw}\uf8ff`),
    limit(RESULT_LIMIT),
  )

  try {
    const [snapName, snapUser] = await Promise.all([
      getDocs(qName),
      getDocs(qUser),
    ])

    /** @type {Map<string, { uid: string, displayName: string, photoURL: string, email: string }>} */
    const merged = new Map()

    function ingest(docSnap) {
      const data = docSnap.data()
      merged.set(docSnap.id, {
        uid: docSnap.id,
        displayName: typeof data.displayName === 'string' ? data.displayName : '',
        photoURL: typeof data.photoURL === 'string' ? data.photoURL : '',
        email: typeof data.email === 'string' ? data.email : '',
      })
    }

    snapName.docs.forEach(ingest)
    snapUser.docs.forEach(ingest)

    return [...merged.values()]
  } catch (err) {
    console.warn('[searchUsers] query failed', err)
    return []
  }
}
