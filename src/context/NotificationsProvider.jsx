import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import { NotificationsContext } from './notificationsContext'
import {
  markAllNotificationsRead,
  markNotificationRead,
  subscribeNotifications,
} from '../services/notificationsFirestore'

/** @typedef {import('../services/notificationsFirestore').FollowNotificationRow} FollowNotificationRow */

export function NotificationsProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState(/** @type {FollowNotificationRow[]} */ ([]))
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user?.uid) {
      queueMicrotask(() => {
        setItems([])
        setUnreadCount(0)
      })
      return undefined
    }
    return subscribeNotifications(user.uid, ({ items: next, unreadCount: count }) => {
      setItems(next)
      setUnreadCount(count)
    })
  }, [user?.uid])

  const markRead = useCallback(
    async (notificationDocId) => {
      if (!user?.uid || !notificationDocId) return
      await markNotificationRead(user.uid, notificationDocId)
    },
    [user],
  )

  const markAllRead = useCallback(async () => {
    if (!user?.uid || !items.length) return
    await markAllNotificationsRead(user.uid, items)
  }, [user, items])

  const value = useMemo(
    () => ({
      items,
      unreadCount,
      markRead,
      markAllRead,
    }),
    [items, unreadCount, markRead, markAllRead],
  )

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  )
}
