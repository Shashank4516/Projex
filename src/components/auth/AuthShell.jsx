import { Link } from 'react-router-dom'
import './AuthShell.css'

const imgIcon = '/figma/navbar/mark.svg'
const imgEverplan = '/figma/navbar/wordmark.svg'

export function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="auth-shell">
      <header className="auth-shell__header">
        <Link to="/" className="auth-shell__brand" aria-label="Everplan home">
          <img
            className="auth-shell__brand-logo"
            src={imgIcon}
            alt=""
            width={25}
            height={25}
          />
          <img
            className="auth-shell__brand-logo"
            src={imgEverplan}
            alt="Everplan"
            width={84}
            height={25}
          />
        </Link>
        <Link to="/" className="auth-shell__back">
          Back to app
        </Link>
      </header>
      <main className="auth-shell__main">
        <div className="auth-panel">
          <h1 className="auth-heading">{title}</h1>
          {subtitle ? (
            <p className="auth-subheading">{subtitle}</p>
          ) : null}
          {children}
          {footer}
        </div>
      </main>
    </div>
  )
}
