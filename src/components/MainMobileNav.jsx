import { NavLink } from 'react-router-dom'
import { APP_NAV } from '../data/appNav'
import { MainNavIcon } from './MainNavIcon'
import './MainMobileNav.css'

/** Bottom bar on small viewports (dashboard column is hidden). */
export function MainMobileNav() {
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
              <MainNavIcon name={item.icon} className="main-mobile-nav__icon" />
              <span className="main-mobile-nav__label">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
