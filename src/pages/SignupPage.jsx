import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../firebase'
import { signInWithGoogle } from '../auth/googlePopup'
import { useAuth } from '../context/AuthContext'
import { formatAuthError } from '../utils/firebaseAuthErrors'
import { mergeUserProfileFields } from '../services/userProfileFirestore'
import { AuthShell } from '../components/auth/AuthShell'
import { AuthLineField } from '../components/auth/AuthLineField'
import { AuthInstantDivider } from '../components/auth/AuthInstantDivider'
import {
  IconEnvelope,
  IconLock,
  IconPin,
  IconUser,
  LogoApple,
  LogoGoogle,
} from '../components/auth/AuthIcons'
import { COUNTRY_OPTIONS } from '../data/countries'

export function SignupPage() {
  const navigate = useNavigate()
  const configured = isFirebaseConfigured() && !!auth
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true })
    }
  }, [user, loading, navigate])

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [country, setCountry] = useState('')
  const [location, setLocation] = useState('')
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
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      )
      const display = name.trim()
      if (display) {
        await updateProfile(cred.user, { displayName: display })
      }
      const loc = location.trim()
      const updates = { country: country.trim() }
      if (loc) updates.location = loc
      await mergeUserProfileFields(cred.user.uid, updates)
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
      title="Sign Up for Your Account"
      footer={
        <p className="auth-footer">
          Already have an account?{' '}
          <Link className="auth-footer__link" to="/login">
            Log in
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
            label="Full Name"
            id="signup-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Alex Morgan"
            icon={<IconUser className="auth-line-field__glyph" />}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={busy}
          />
          <AuthLineField
            label="Email"
            id="signup-email"
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
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            minLength={8}
            icon={<IconLock className="auth-line-field__glyph" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={busy}
          />
          <div className="auth-line-field">
            <label className="auth-line-field__label" htmlFor="signup-country">
              Country
            </label>
            <div className="auth-line-field__track">
              <select
                id="signup-country"
                name="country"
                className="auth-line-field__input"
                autoComplete="country-name"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
                disabled={busy}
              >
                <option value="" disabled>
                  Select country
                </option>
                {COUNTRY_OPTIONS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <span className="auth-line-field__icon" aria-hidden>
                <IconPin className="auth-line-field__glyph" />
              </span>
            </div>
          </div>
          <AuthLineField
            label="City, Region (optional)"
            id="signup-location"
            name="location"
            type="text"
            autoComplete="address-level2"
            placeholder="Jakarta, Indonesia"
            icon={<IconPin className="auth-line-field__glyph" />}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={busy}
          />
        </div>

        <div className="auth-form-options auth-form-options--signup">
          <label className="auth-remember">
            <input
              className="auth-remember__input"
              type="checkbox"
              name="terms"
              required
              disabled={busy}
            />
            I agree to the Terms &amp; Privacy
          </label>
        </div>

        <button type="submit" className="auth-submit-primary" disabled={busy || !configured}>
          {busy ? 'Creating account…' : 'Sign Up'}
        </button>

        <AuthInstantDivider label="Instant Sign Up" />

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
