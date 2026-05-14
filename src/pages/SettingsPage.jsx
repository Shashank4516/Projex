import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProjects } from '../context/ProjectsContext'
import { mergeUserProfileFields } from '../services/userProfileFirestore'
import { COUNTRY_OPTIONS } from '../data/countries'

export function SettingsPage() {
  const { user, profile, refreshProfile, firebaseReady } = useAuth()
  const { syncMyProjectsCountry } = useProjects()
  const [country, setCountry] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const c = profile?.country
    queueMicrotask(() => setCountry(typeof c === 'string' && c ? c : ''))
  }, [profile?.country])

  async function handleSave(e) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    if (!user) return
    const c = country.trim()
    if (!c) {
      setError('Choose a country.')
      return
    }
    setBusy(true)
    try {
      await mergeUserProfileFields(user.uid, { country: c })
      await refreshProfile()
      await syncMyProjectsCountry(c)
      setMessage('Country saved. Leaderboard will show it for your projects.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.')
    } finally {
      setBusy(false)
    }
  }

  if (!firebaseReady) {
    return (
      <main className="app__main app__simple" id="app-main" aria-label="Settings">
        <h1 className="app__simple-title">Settings</h1>
        <p className="app__simple-text">Firebase isn’t configured.</p>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="app__main app__simple" id="app-main" aria-label="Settings">
        <h1 className="app__simple-title">Settings</h1>
        <p className="app__simple-text">
          Sign in to choose your country for the leaderboard.{' '}
          <Link to="/login">Log in</Link>
        </p>
      </main>
    )
  }

  return (
    <main className="app__main app__simple" id="app-main" aria-label="Settings">
      <h1 className="app__simple-title">Settings</h1>
      <p className="app__simple-text">
        Your country is stored on your profile and shown on the leaderboard (like the Figma “Country” column).
      </p>
      <form className="settings-country-form" onSubmit={handleSave}>
        <label className="settings-country-form__label" htmlFor="settings-country">
          Country
        </label>
        <select
          id="settings-country"
          className="settings-country-form__select"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          required
          disabled={busy}
        >
          <option value="">Select country</option>
          {COUNTRY_OPTIONS.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <button type="submit" className="app__simple-btn" disabled={busy}>
          {busy ? 'Saving…' : 'Save country'}
        </button>
      </form>
      {message ? (
        <p className="app__simple-text" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="app__simple-error" role="alert">
          {error}
        </p>
      ) : null}
    </main>
  )
}
