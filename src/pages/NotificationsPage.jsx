import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../hooks/useNotifications'
import './NotificationsPage.css'

const DEFAULT_AVATAR = '/figma/card-91-1198/avatar.png'

function formatWhen(ts) {
  if (!ts?.toDate) return ''
  const d = ts.toDate()
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function NotificationsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { items, unreadCount, markRead, markAllRead } = useNotifications()

  if (!user) {
    return (
      <main className="notifications-page" id="app-main" aria-label="Notifications">
        <h1 className="notifications-page__title">Notifications</h1>
        <p className="notifications-page__empty-text">
          <Link className="notifications-page__link" to="/login">
            Sign in
          </Link>{' '}
          to see when people follow you.
        </p>
      </main>
    )
  }

  return (
    <main className="notifications-page" id="app-main" aria-label="Notifications">
      <header className="notifications-page__header">
        <h1 className="notifications-page__title">Notifications</h1>
        {unreadCount > 0 ? (
          <button
            type="button"
            className="notifications-page__mark-all"
            onClick={() => void markAllRead()}
          >
            Mark all read
          </button>
        ) : null}
      </header>

      {items.length === 0 ? (
        <p className="notifications-page__empty-text">No notifications yet.</p>
      ) : (
        <ul className="notifications-page__list">
          {items.map((row) => {
            const name =
              row.displayName?.trim() ||
              `Member`
            const unread = !row.read
            return (
              <li key={row.id}>
                <button
                  type="button"
                  className={[
                    'notifications-page__row',
                    unread ? 'notifications-page__row--unread' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => {
                    void markRead(row.id)
                    navigate(`/user/${encodeURIComponent(row.fromUid)}`)
                  }}
                >
                  <img
                    className="notifications-page__avatar"
                    src={row.photoURL || DEFAULT_AVATAR}
                    alt=""
                    width={44}
                    height={44}
                    referrerPolicy="no-referrer"
                  />
                  <span className="notifications-page__body">
                    <span className="notifications-page__line">
                      <strong className="notifications-page__name">{name}</strong>
                      <span className="notifications-page__action"> started following you</span>
                    </span>
                    <span className="notifications-page__meta">{formatWhen(row.createdAt)}</span>
                  </span>
                  {unread ? (
                    <span className="notifications-page__dot" aria-hidden />
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
