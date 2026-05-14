import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../firebase'
import { signInWithGoogle } from '../auth/googlePopup'
import { formatAuthError } from '../utils/firebaseAuthErrors'
import { AuthShell } from '../components/auth/AuthShell'
import { AuthLineField } from '../components/auth/AuthLineField'
import { AuthInstantDivider } from '../components/auth/AuthInstantDivider'
import { IconEnvelope, IconLock, LogoApple, LogoGoogle } from '../components/auth/AuthIcons'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const navigate = useNavigate()
  const configured = isFirebaseConfigured() && !!auth
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true })
    }
  }, [user, loading, navigate])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setNotice(null)
    if (!auth || !configured) {
      setError('Firebase isn’t configured. Add .env.local from .env.example.')
      return
    }
    setBusy(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(formatAuthError(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleGoogle() {
    setError(null)
    setNotice(null)
    if (!auth || !configured) {
      setError('Firebase isn’t configured. Add .env.local from .env.example.')
      return
    }
    setBusy(true)
    try {
      // signInWithPopup resolves directly with the user — navigate immediately.
      await signInWithGoogle(auth)
      navigate('/', { replace: true })
    } catch (err) {
      setError(formatAuthError(err))
    } finally {
      setBusy(false)
    }
  }

  function handleAppleComingSoon() {
    setError(null)
    setNotice('Sign in with Apple isn’t set up yet. Use Google or email instead.')
  }

  return (
    <AuthShell
      title="Log In to Your Account"
      footer={
        <p className="auth-footer">
          Don&apos;t have an account?{' '}
          <Link className="auth-footer__link" to="/signup">
            Sign up
          </Link>
        </p>
      }
    >
      {!configured && import.meta.env.DEV ? (
        <p className="auth-alert auth-alert--muted" role="status">
          Copy <code>.env.example</code> to <code>.env.local</code> and add your Firebase web app keys,
          then restart the dev server.
        </p>
      ) : null}
      {notice ? (
        <p className="auth-alert auth-alert--muted" role="status">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="auth-alert" role="alert">
          {error}
        </p>
      ) : null}
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-fields">
          <AuthLineField
            label="Email"
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            icon={<IconEnvelope className="auth-line-field__glyph" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={busy}
          />
          <AuthLineField
            label="Password"
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder=""
            icon={<IconLock className="auth-line-field__glyph" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={busy}
          />
        </div>

        <div className="auth-form-options">
          <label className="auth-remember">
            <input
              className="auth-remember__input"
              type="checkbox"
              name="remember"
              disabled={busy}
            />
            Remember Me
          </label>
          <button type="button" className="auth-forgot">
            Forgot Password
          </button>
        </div>

        <button type="submit" className="auth-submit-primary" disabled={busy || !configured}>
          {busy ? 'Signing in…' : 'Login'}
        </button>

        <AuthInstantDivider label="Instant Login" />

        <div className="auth-social-stack">
          <button
            type="button"
            className="auth-social-btn"
            onClick={handleGoogle}
            disabled={busy || !configured}
          >
            <span className="auth-social-btn__icon">
              <LogoGoogle />
            </span>
            Continue with Google
          </button>
          <button
            type="button"
            className="auth-social-btn"
            onClick={handleAppleComingSoon}
            disabled={busy}
          >
            <span className="auth-social-btn__icon">
              <LogoApple />
            </span>
            Continue with Apple
          </button>
        </div>
      </form>
    </AuthShell>
  )
}
