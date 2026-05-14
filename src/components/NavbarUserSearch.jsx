import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isFirebaseConfigured } from '../firebase'
import { searchUsers } from '../services/searchUsersFirestore'
import './NavbarUserSearch.css'

const imgSearchSm = '/figma/navbar/search.svg'
const DEFAULT_AVATAR = '/figma/profile-chip/avatar-default.png'
const DEBOUNCE_MS = 300

export function NavbarUserSearch() {
  const navigate = useNavigate()
  const { user, firebaseReady } = useAuth()
  const wrapRef = useRef(null)
  const seqRef = useRef(0)

  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(
    /** @type {{ uid: string, displayName: string, photoURL: string, email: string }[]} */ ([]),
  )
  const [hint, setHint] = useState(/** @type {string | null} */ (null))

  useEffect(() => {
    if (!open) return undefined
    function onDocMouseDown(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [open])

  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) {
      queueMicrotask(() => {
        setResults([])
        setLoading(false)
        setHint(null)
      })
      return undefined
    }

    if (!firebaseReady || !isFirebaseConfigured()) {
      queueMicrotask(() => {
        setHint('Firebase isn’t configured.')
        setResults([])
        setLoading(false)
      })
      return undefined
    }

    if (!user) {
      queueMicrotask(() => {
        setHint('Sign in to search members.')
        setResults([])
        setLoading(false)
      })
      return undefined
    }

    const seq = ++seqRef.current
    queueMicrotask(() => {
      setHint(null)
      setLoading(true)
    })

    const timer = window.setTimeout(async () => {
      try {
        const rows = await searchUsers(term)
        if (seq !== seqRef.current) return
        setResults(rows)
      } catch (e) {
        console.warn('[NavbarUserSearch]', e)
        if (seq !== seqRef.current) return
        setResults([])
        setHint('Could not search. Check Firestore rules allow signed-in reads on users.')
      } finally {
        if (seq === seqRef.current) setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [q, user, firebaseReady])

  function pickRow(uid) {
    navigate(`/user/${encodeURIComponent(uid)}`)
    setQ('')
    setOpen(false)
    setResults([])
    setHint(null)
  }

  const showDropdown =
    open && (q.trim().length >= 2 || Boolean(hint))

  return (
    <div className="navbar-user-search navbar__search-wrap" ref={wrapRef}>
      <div className="navbar__search-inner navbar-user-search__inner">
        <span className="navbar__search-ico" aria-hidden>
          <img src={imgSearchSm} alt="" width={14} height={14} />
        </span>
        <input
          type="search"
          className="navbar__search-input navbar-user-search__input"
          placeholder={
            user ? 'Search people by name or @username…' : 'Sign in to search people'
          }
          name="userSearch"
          autoComplete="off"
          aria-label="Search members"
          aria-expanded={showDropdown}
          aria-controls="navbar-user-search-results"
          aria-autocomplete="list"
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setOpen(false)
              e.currentTarget.blur()
            }
          }}
        />
      </div>

      {showDropdown ? (
        <div
          id="navbar-user-search-results"
          className="navbar-user-search__dropdown"
          role="listbox"
          aria-label="Search results"
        >
          {hint ? (
            <p className="navbar-user-search__hint">{hint}</p>
          ) : null}

          {!hint && loading ? (
            <p className="navbar-user-search__status" role="status">
              Searching…
            </p>
          ) : null}

          {!hint && !loading && results.length === 0 ? (
            <p className="navbar-user-search__empty">No members match.</p>
          ) : null}

          {!hint &&
            !loading &&
            results.map((r) => (
              <button
                key={r.uid}
                type="button"
                role="option"
                className="navbar-user-search__row"
                onClick={() => pickRow(r.uid)}
              >
                <img
                  className="navbar-user-search__avatar"
                  src={r.photoURL || DEFAULT_AVATAR}
                  alt=""
                  width={32}
                  height={32}
                  referrerPolicy="no-referrer"
                />
                <span className="navbar-user-search__meta">
                  <span className="navbar-user-search__name">
                    {r.displayName?.trim() ||
                      r.email?.split('@')[0] ||
                      'Member'}
                  </span>
                  {r.email ? (
                    <span className="navbar-user-search__email">{r.email}</span>
                  ) : null}
                </span>
              </button>
            ))}
        </div>
      ) : null}
    </div>
  )
}
