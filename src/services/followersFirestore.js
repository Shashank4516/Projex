import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db } from '../firebase'
import { deleteFollowNotification, upsertFollowNotification } from './notificationsFirestore'

/**
 * @param {string} targetUid User who receives the follower
 * @param {(rows: { id: string, displayName?: string, photoURL?: string }[]) => void} onNext
 * @returns {() => void}
 */
export function subscribeFollowers(targetUid, onNext) {
  if (!db || !targetUid) {
    onNext([])
    return () => {}
  }
  const col = collection(db, 'users', targetUid, 'followers')
  return onSnapshot(
    col,
    (snap) => {
      const rows = snap.docs.map((d) => {
        const data = d.data()
        return {
          id: d.id,
          displayName: typeof data.displayName === 'string' ? data.displayName : '',
          photoURL: typeof data.photoURL === 'string' ? data.photoURL : '',
        }
      })
      onNext(rows)
    },
    (err) => {
      console.warn('[followers] subscribe failed', err)
      onNext([])
    },
  )
}

/**
 * @param {import('firebase/auth').User} me
 * @param {string} targetUid
 */
export async function followUser(me, targetUid) {
  if (!db || !me?.uid || !targetUid || me.uid === targetUid) return
  const ref = doc(db, 'users', targetUid, 'followers', me.uid)
  await setDoc(ref, {
    displayName: me.displayName ?? '',
    photoURL: me.photoURL ?? '',
    createdAt: serverTimestamp(),
  })
  await upsertFollowNotification(targetUid, me)
}

/**
 * @param {string} followerUid
 * @param {string} targetUid
 */
export async function unfollowUser(followerUid, targetUid) {
  if (!db || !followerUid || !targetUid || followerUid === targetUid) return
  await deleteDoc(doc(db, 'users', targetUid, 'followers', followerUid))
  await deleteFollowNotification(targetUid, followerUid)
}
