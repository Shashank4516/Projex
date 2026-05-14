import { NavLink } from 'react-router-dom'
import { APP_NAV } from '../data/appNav'
import { useNotifications } from '../hooks/useNotifications'
import { useAuth } from '../context/AuthContext'
import { MainNavIcon } from './MainNavIcon'
import './MainMobileNav.css'

/** Bottom bar on small viewports (dashboard column is hidden). */
export function MainMobileNav() {
  const { user } = useAuth()
  const { unreadCount } = useNotifications()

  return (
    <nav className="main-mobile-nav" aria-label="Main navigation">
      <ul className="main-mobile-nav__list">
        {APP_NAV.map((item) => (
          <li key={item.to} className="main-mobile-nav__item">
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                ['main-mobile-nav__link', isActive ? 'main-mobile-nav__link--active' : ''].filter(Boolean).join(' ')
              }
            >
              <span className="main-mobile-nav__icon-slot">
                <MainNavIcon name={item.icon} className="main-mobile-nav__icon" />
                {user && item.to === '/notifications' && unreadCount > 0 ? (
                  <span className="main-mobile-nav__badge">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                ) : null}
              </span>
              <span className="main-mobile-nav__label">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
