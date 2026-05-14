import { createContext } from 'react'

/** @typedef {import('../services/notificationsFirestore').FollowNotificationRow} FollowNotificationRow */

export const NotificationsContext = createContext(
  /** @type {{
   *   items: FollowNotificationRow[]
   *   unreadCount: number
   *   markRead: (notificationDocId: string) => Promise<void>
   *   markAllRead: () => Promise<void>
   * }} */ ({
    items: [],
    unreadCount: 0,
    markRead: async () => {},
    markAllRead: async () => {},
  }),
)
