import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'

/**
 * @typedef {'follow'} NotificationType
 */

/**
 * @typedef {{
 *   id: string
 *   type: NotificationType
 *   fromUid: string
 *   displayName: string
 *   photoURL: string
 *   read: boolean
 *   createdAt: import('firebase/firestore').Timestamp | null
 * }} FollowNotificationRow
 */

function mapNotificationDoc(d) {
  const data = d.data()
  const read = Boolean(data.read)
  return {
    id: d.id,
    type: data.type === 'follow' ? 'follow' : 'follow',
    fromUid: typeof data.fromUid === 'string' ? data.fromUid : d.id,
    displayName: typeof data.displayName === 'string' ? data.displayName : '',
    photoURL: typeof data.photoURL === 'string' ? data.photoURL : '',
    read,
    createdAt: data.createdAt ?? null,
  }
}

/**
 * Upsert a follow notification for `targetUid` (doc id = follower's uid).
 * @param {string} targetUid
 * @param {import('firebase/auth').User} follower
 */
export async function upsertFollowNotification(targetUid, follower) {
  if (!db || !targetUid || !follower?.uid || follower.uid === targetUid) return
  const ref = doc(db, 'users', targetUid, 'notifications', follower.uid)
  await setDoc(
    ref,
    {
      type: 'follow',
      fromUid: follower.uid,
      displayName: follower.displayName ?? '',
      photoURL: follower.photoURL ?? '',
      createdAt: serverTimestamp(),
      read: false,
    },
    { merge: true },
  )
}

/**
 * Remove the follow notification when someone unfollows (optional cleanup).
 */
export async function deleteFollowNotification(targetUid, followerUid) {
  if (!db || !targetUid || !followerUid || followerUid === targetUid) return
  try {
    await deleteDoc(doc(db, 'users', targetUid, 'notifications', followerUid))
  } catch (e) {
    console.warn('[notifications] delete follow notification failed', e)
  }
}

/**
 * @param {string} ownerUid signed-in user who receives notifications
 * @param {(payload: { items: FollowNotificationRow[], unreadCount: number }) => void} onNext
 */
export function subscribeNotifications(ownerUid, onNext) {
  if (!db || !ownerUid) {
    queueMicrotask(() => onNext({ items: [], unreadCount: 0 }))
    return () => {}
  }
  const col = collection(db, 'users', ownerUid, 'notifications')
  return onSnapshot(
    col,
    (snap) => {
      const items = snap.docs.map(mapNotificationDoc).sort((a, b) => {
        const ta = a.createdAt?.toMillis?.() ?? 0
        const tb = b.createdAt?.toMillis?.() ?? 0
        return tb - ta
      })
      const unreadCount = items.filter((i) => !i.read).length
      onNext({ items, unreadCount })
    },
    (err) => {
      console.warn('[notifications] subscribe failed', err)
      onNext({ items: [], unreadCount: 0 })
    },
  )
}

/**
 * @param {string} ownerUid
 * @param {string} notificationDocId follower uid for follow notifications
 */
export async function markNotificationRead(ownerUid, notificationDocId) {
  if (!db || !ownerUid || !notificationDocId) return
  const ref = doc(db, 'users', ownerUid, 'notifications', notificationDocId)
  await setDoc(ref, { read: true }, { merge: true })
}

/**
 * @param {string} ownerUid
 * @param {FollowNotificationRow[]} items
 */
export async function markAllNotificationsRead(ownerUid, items) {
  if (!db || !ownerUid || !items.length) return
  const unread = items.filter((i) => !i.read)
  if (!unread.length) return
  const batch = writeBatch(db)
  for (const row of unread) {
    batch.set(
      doc(db, 'users', ownerUid, 'notifications', row.id),
      { read: true },
      { merge: true },
    )
  }
  await batch.commit()
}
