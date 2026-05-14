import { useContext } from 'react'
import { NotificationsContext } from '../context/notificationsContext'

export function useNotifications() {
  return useContext(NotificationsContext)
}
