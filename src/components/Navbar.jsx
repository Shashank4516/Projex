import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProjects } from '../context/ProjectsContext'
import { UserProfileChip } from './UserProfileChip'
import './Navbar.css'

/**
 * DevFlow / Everplan navbar — built from Figma node 106:443 (Figma MCP get_design_context).
 * Asset URLs are time-limited Figma exports; replace with local /public assets for production.
 */
const imgSearchSm = '/figma/navbar/search.svg'
const imgIcon = '/figma/navbar/mark.svg'
const imgEverplan = '/figma/navbar/wordmark.svg'
const imgChevronLeftDouble = '/figma/navbar/chevrons.svg'

export function Navbar() {
  const { setModalOpen } = useProjects()
  const { user, profile, loading } = useAuth()

  return (
    <header className="navbar" data-node-id="106:443" data-name="Navbar">
      <div className="navbar__logo-panel" data-name="Logo">
        <div className="navbar__logo-row">
          <div className="navbar__logo" data-name="Logo">
            <img
              className="navbar__logo-icon"
              src={imgIcon}
              alt=""
              width={25}
              height={25}
            />
            <img
              className="navbar__logo-word"
              src={imgEverplan}
              alt="Everplan"
              width={84}
              height={25}
            />
          </div>
          <button
            type="button"
            className="navbar__collapse"
            data-name="chevron-left-double"
            aria-label="Collapse sidebar"
          >
            <img
              src={imgChevronLeftDouble}
              alt=""
              width={24}
              height={24}
            />
          </button>
        </div>
      </div>

      <div className="navbar__surface" data-name="Navigation Bar">
        <div className="navbar__search-wrap" data-name="Search Bar">
          <div className="navbar__search-inner">
            <span className="navbar__search-ico" data-name="search-sm">
              <img src={imgSearchSm} alt="" width={14} height={14} />
            </span>
            <input
              type="search"
              className="navbar__search-input"
              placeholder="Search"
              name="q"
              autoComplete="off"
              aria-label="Search"
            />
          </div>
        </div>

        <div className="navbar__end">
          <div className="navbar__icon-actions" data-name="Menu Bar" role="toolbar">
            <button
              type="button"
              className="navbar__icon-btn"
              aria-label="Notifications"
            >
              <IconBell className="navbar__icon-svg" />
            </button>
            <button
              type="button"
              className="navbar__icon-btn"
              aria-label="Add project"
              onClick={() => setModalOpen(true)}
            >
              <IconPlus className="navbar__icon-svg" />
            </button>
          </div>
          {loading ? (
            <div
              className="navbar-profile-skeleton"
              aria-busy="true"
              aria-label="Loading profile"
            >
              <span className="navbar-profile-skeleton__avatar skeleton-block" />
              <span className="navbar-profile-skeleton__text">
                <span className="navbar-profile-skeleton__line navbar-profile-skeleton__line--primary skeleton-block" />
                <span className="navbar-profile-skeleton__line navbar-profile-skeleton__line--secondary skeleton-block" />
              </span>
            </div>
          ) : user ? (
            <UserProfileChip user={user} profile={profile} />
          ) : (
            <Link className="navbar__login" data-name="Button Stroke" to="/login">
              <span className="navbar__login-label">Login/Sign in</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

/** Thin-stroke outline icons to match the design reference (no fills, no raster blur). */
function IconBell({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill="none"
      aria-hidden
    >
      <path
        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.73 21a2 2 0 0 1-3.46 0"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconPlus({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill="none"
      aria-hidden
    >
      <path
        d="M12 5.5v13M5.5 12h13"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  )
}
