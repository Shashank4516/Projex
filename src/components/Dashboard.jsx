import { signOut } from 'firebase/auth'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { SidebarProfileCard } from './SidebarProfileCard'
import { useProjects } from '../context/ProjectsContext'
import { auth } from '../firebase'
import { FILTER_NAV } from '../data/filterNav'
import './Dashboard.css'

function LogoutIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={18} height={18} fill="none" aria-hidden>
      <path
        d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Dashboard() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { activeFilter, setActiveFilter, projects } = useProjects()

  async function handleLogout() {
    if (auth) {
      try {
        await signOut(auth)
      } catch (e) {
        console.error(e)
      }
    }
    navigate('/login', { replace: true })
  }

  function handleSelect(row) {
    if (row.id === 'all') {
      setActiveFilter(null)
    } else {
      setActiveFilter(row.label)
    }
    if (pathname !== '/') {
      navigate('/')
    }
  }

  function countForRow(row) {
    if (row.id === 'all') return projects.length
    const key = row.label.toLowerCase()
    return projects.filter(
      (p) =>
        Array.isArray(p.tags) &&
        p.tags.some(
          (t) =>
            t !== null &&
            typeof t === 'object' &&
            t.label?.toLowerCase() === key,
        ),
    ).length
  }

  return (
    <aside
      className="dashboard"
      data-node-id="108:444"
      data-name="Dashboard"
    >
      <div className="dashboard__inner">
        <div className="dashboard__top">
          <div className="dashboard__profile-slot">
            <SidebarProfileCard />
          </div>

          <nav
            className="dashboard__nav"
            aria-label="Frameworks and languages"
          >
            <ul className="dashboard__list">
              {FILTER_NAV.map((row) => {
                const isActive =
                  row.id === 'all' ? activeFilter === null : activeFilter === row.label
                const count = countForRow(row)
                return (
                  <li key={row.id} className="dashboard__li">
                    <button
                      type="button"
                      className={[
                        'dashboard__item',
                        isActive ? 'dashboard__item--active' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => handleSelect(row)}
                      aria-pressed={isActive}
                    >
                      <span className="dashboard__item-icon-wrap">
                        {row.src ? (
                          <img
                            className={[
                              'dashboard__item-icon',
                              row.go ? 'dashboard__item-icon--go' : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            src={row.src}
                            alt=""
                          />
                        ) : (
                          <span className="dashboard__item-icon dashboard__item-icon--all" aria-hidden="true">
                            ✦
                          </span>
                        )}
                      </span>
                      <span className="dashboard__item-label">
                        {row.label}
                      </span>
                      {count > 0 && (
                        <span className="dashboard__item-count">{count}</span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>

        <nav className="dashboard__footer" aria-label="Account">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              [
                'dashboard__footer-link',
                isActive ? 'dashboard__footer-link--active' : '',
              ]
                .filter(Boolean)
                .join(' ')
            }
          >
            <span className="dashboard__footer-icon dashboard__footer-icon--emoji" aria-hidden>
              👤
            </span>
            <span className="dashboard__footer-label">Profile</span>
          </NavLink>
          <NavLink
            to="/leaderboard"
            className={({ isActive }) =>
              [
                'dashboard__footer-link',
                isActive ? 'dashboard__footer-link--active' : '',
              ]
                .filter(Boolean)
                .join(' ')
            }
          >
            <span className="dashboard__footer-icon dashboard__footer-icon--emoji" aria-hidden>
              🔥
            </span>
            <span className="dashboard__footer-label">Leaderboard</span>
          </NavLink>
          <button
            type="button"
            className="dashboard__footer-btn"
            onClick={() => void handleLogout()}
          >
            <span className="dashboard__footer-icon" aria-hidden>
              <LogoutIcon className="dashboard__footer-svg" />
            </span>
            <span className="dashboard__footer-label">Logout</span>
          </button>
        </nav>
      </div>
    </aside>
  )
}
