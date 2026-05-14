import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './SidebarProfileCard.css'

const DEFAULT_AVATAR = '/figma/profile-chip/avatar-default.png'

/**
 * Figma node 59:158 — Dashboard sidebar profile card.
 * w=220px h=60px, rounded-15px, border rgba(116,116,116,.1), shadow xs.
 */
export function SidebarProfileCard() {
  const { user, profile } = useAuth()
  if (!user) return null

  const displayName =
    user.displayName?.trim() || user.email?.split('@')[0] || 'User'

  const subtitle =
    (typeof profile?.country === 'string' && profile.country.trim()) ||
    (typeof profile?.location === 'string' && profile.location.trim()) ||
    user.email ||
    ''

  const photoSrc = user.photoURL || DEFAULT_AVATAR

  return (
    <Link
      to="/profile"
      className="spcard-link"
      aria-label="Your profile"
      data-node-id="59:150"
    >
    <div className="spcard">
      <div className="spcard__inner" data-node-id="59:151">
        <div className="spcard__avatar-shell" data-node-id="59:152">
          <img
            className="spcard__avatar"
            src={photoSrc}
            alt=""
            width={30}
            height={30}
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="spcard__text" data-node-id="59:154">
          <p className="spcard__name" data-node-id="59:155">
            {displayName}
          </p>
          <p className="spcard__sub" data-node-id="59:156">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
    </Link>
  )
}
