import { Link } from 'react-router-dom'
import './UserProfileChip.css'

const DEFAULT_AVATAR = '/figma/profile-chip/avatar-default.png'

/**
 * Figma node 57:2897 — DevFlow profile capsule (pixel dimensions from design).
 *
 * @param {{
 *   user: import('firebase/auth').User
 *   profile: Record<string, unknown> | null
 * }} props
 */
export function UserProfileChip({ user, profile }) {
  const displayName =
    user.displayName?.trim() ||
    user.email?.split('@')[0] ||
    'User'

  const location =
    (typeof profile?.country === 'string' && profile.country.trim()) ||
    (typeof profile?.location === 'string' && profile.location.trim()) ||
    user.email ||
    ''

  const photoSrc = user.photoURL || DEFAULT_AVATAR

  return (
    <Link
      to="/profile"
      className="user-profile-chip user-profile-chip--link"
      data-node-id="57:2897"
      data-name="User profile"
    >
      <div className="user-profile-chip__avatar-wrap" data-node-id="57:2898">
        <img
          className="user-profile-chip__avatar"
          src={photoSrc}
          alt=""
          width={34}
          height={34}
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="user-profile-chip__text" data-node-id="57:2899">
        <p className="user-profile-chip__name" data-node-id="57:2900">
          {displayName}
        </p>
        <p className="user-profile-chip__meta" data-node-id="57:2901">
          {location}
        </p>
      </div>
    </Link>
  )
}
