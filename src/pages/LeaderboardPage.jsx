import { useEffect, useMemo, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { useProjects } from '../context/ProjectsContext'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase'
import { followUser, unfollowUser } from '../services/followersFirestore'
import { totalAuraForUser } from '../utils/aura'
import { buildLeaderboardRows } from '../utils/leaderboard'
import { LeaderboardTableSkeleton } from '../components/skeletons/LeaderboardTableSkeleton'
import './LeaderboardPage.css'

const POLL_MS = 2500

function greetingPrefix() {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'Good Morning'
  if (h >= 12 && h < 18) return 'Good Afternoon'
  return 'Good Evening'
}

function firstNameFromUser(user, profile) {
  const raw = profile?.displayName || user?.displayName || user?.email || 'there'
  const s = String(raw).trim()
  const space = s.indexOf(' ')
  return space > 0 ? s.slice(0, space) : s.split('@')[0] || 'there'
}

function IconSchedule({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={16} height={16} fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="#9ca3af" strokeWidth="1.25" />
      <path d="M12 7v6l4 2" stroke="#9ca3af" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}

function IconFolder({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={16} height={16} fill="none" aria-hidden>
      <path
        d="M4 8a2 2 0 0 1 2-2h3l2 2h5a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z"
        stroke="#9ca3af"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconFlame({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={16} height={16} fill="none" aria-hidden>
      <path
        d="M12 22c-3.5 0-6-2.5-6-6 0-2.5 1.5-4.5 2-5.5.2 1 0 2 .5 2.5C9 9 9.5 6 12 4c.8 2.5 1.2 5 1.2 5s.8-1.5.8-3c2 2.5 4 4.5 4 7.5 0 3.5-2.5 6-6 6Z"
        fill="#ff8a00"
      />
      <path
        d="M12 18.5c-1.2 0-2-1-2-2.2 0-.9.6-1.6.6-1.6s-.2 1 .6 1.6c.5.4 1-.3 1-.3s.6.8.6 1.6c0 1.2-.8 2.2-1.8 2.2Z"
        fill="#ffb547"
      />
    </svg>
  )
}

function IconMore({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={18} height={18} fill="none" aria-hidden>
      <circle cx="6" cy="12" r="1.5" fill="#9ca3af" />
      <circle cx="12" cy="12" r="1.5" fill="#9ca3af" />
      <circle cx="18" cy="12" r="1.5" fill="#9ca3af" />
    </svg>
  )
}

function IconSearch({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={16} height={16} fill="none" aria-hidden>
      <circle cx="11" cy="11" r="6.5" stroke="#84818a" strokeWidth="1.5" />
      <path d="M16 16l4 4" stroke="#84818a" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function LeaderboardFollowCell({ row, viewer }) {
  const [following, setFollowing] = useState(false)
  const [busy, setBusy] = useState(false)
  const targetUid = row.ownerUid

  useEffect(() => {
    if (!db || !targetUid || !viewer?.uid) {
      queueMicrotask(() => setFollowing(false))
      return undefined
    }
    const ref = doc(db, 'users', targetUid, 'followers', viewer.uid)
    return onSnapshot(ref, (snap) => setFollowing(snap.exists()))
  }, [targetUid, viewer?.uid])

  if (!targetUid || !viewer?.uid || row.isCurrentUser) return null

  async function toggle() {
    setBusy(true)
    try {
      if (following) await unfollowUser(viewer.uid, targetUid)
      else await followUser(viewer, targetUid)
    } catch (e) {
      console.warn('[leaderboard] follow toggle failed', e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      className="lb-table__follow"
      disabled={busy || !db}
      onClick={() => void toggle()}
    >
      {following ? 'Following' : 'Follow'}
    </button>
  )
}

export function LeaderboardPage() {
  const { projects, projectsLoading, projectsError, refreshProjects } = useProjects()
  const { user, profile } = useAuth()
  const currentUserCountry =
    typeof profile?.country === 'string' && profile.country.trim()
      ? profile.country.trim()
      : null
  const [range, setRange] = useState('month')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') void refreshProjects()
    }, POLL_MS)
    return () => window.clearInterval(id)
  }, [refreshProjects])

  const displayName = useMemo(
    () => firstNameFromUser(user, profile),
    [user, profile],
  )

  const rows = useMemo(
    () =>
      buildLeaderboardRows({
        projects,
        range,
        search,
        currentUserPhotoURL: user?.photoURL ?? null,
        currentUserDisplayName: profile?.displayName || user?.displayName || null,
        currentUserCountry,
        currentUserUid: user?.uid ?? null,
      }),
    [
      projects,
      range,
      search,
      user?.photoURL,
      user?.uid,
      profile?.displayName,
      currentUserCountry,
      user?.displayName,
    ],
  )

  const meAura = useMemo(() => totalAuraForUser(projects, user ?? {}), [projects, user])
  const showTableSkeleton = projectsLoading && projects.length === 0

  return (
    <main className="lb-page" id="app-main" aria-label="Leaderboard" data-node-id="101:3161">
      <header className="lb-page__hero">
        <h1 className="lb-page__greeting" data-node-id="101:4433">
          {greetingPrefix()}, {displayName}
        </h1>
        <div className="lb-page__me" data-node-id="101:4435" data-name="Profile">
          <img
            className="lb-page__me-avatar"
            src={user?.photoURL || '/figma/card-91-1198/avatar.png'}
            alt=""
            width={32}
            height={32}
          />
          <span className="lb-page__me-divider" aria-hidden="true" />
          <span className="lb-page__me-name" data-node-id="101:4444">
            {user ? 'Me' : 'Guest'}
          </span>
          <span className="lb-page__me-aura" data-node-id="101:4438">
            <IconFlame className="lb-page__me-aura-icon" />
            <span>{meAura}</span>
          </span>
        </div>
      </header>

      <section className="lb-card" data-node-id="101:4076" data-name="Card">
        <div className="lb-card__toolbar">
          <label className="lb-card__search" htmlFor="lb-search">
            <span className="lb-card__search-ico" aria-hidden>
              <IconSearch className="lb-card__search-svg" />
            </span>
            <input
              id="lb-search"
              type="search"
              className="lb-card__search-input"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
            />
          </label>
          <div className="lb-card__tabs" role="tablist" aria-label="Time range">
            <button
              type="button"
              role="tab"
              aria-selected={range === 'all'}
              className={['lb-card__tab', range === 'all' ? 'lb-card__tab--active' : ''].filter(Boolean).join(' ')}
              onClick={() => setRange('all')}
            >
              All time
            </button>
            <span className="lb-card__tab-line" aria-hidden />
            <button
              type="button"
              role="tab"
              aria-selected={range === 'month'}
              className={['lb-card__tab', range === 'month' ? 'lb-card__tab--active' : ''].filter(Boolean).join(' ')}
              onClick={() => setRange('month')}
            >
              This month
            </button>
            <span className="lb-card__tab-line" aria-hidden />
            <button
              type="button"
              role="tab"
              aria-selected={range === 'week'}
              className={['lb-card__tab', range === 'week' ? 'lb-card__tab--active' : ''].filter(Boolean).join(' ')}
              onClick={() => setRange('week')}
            >
              This week
            </button>
          </div>
        </div>

        <div className="lb-card__title-row">
          <h2 className="lb-card__title" data-node-id="101:4431">
            General Leaderboard
          </h2>
          <p className="lb-card__live" role="status">
            <span className="lb-card__live-dot" aria-hidden />
            Live rankings
          </p>
        </div>

        {projectsError ? (
          <p className="lb-page__alert" role="alert">
            {projectsError}. Start the API with{' '}
            <code className="app__inline-code">npm run dev</code>.
          </p>
        ) : null}

        <div className="lb-table-wrap">
          <div className="lb-table">
            <div className="lb-table__head" data-node-id="101:4079">
              <span>#</span>
              <span>Name</span>
              <span>Country</span>
              <span>Learning time</span>
              <span>Project Deployed</span>
              <span>Total Aura</span>
              <span className="lb-table__head-actions" aria-hidden>
                {' '}
              </span>
            </div>
            <div
              className="lb-table__body"
              {...(showTableSkeleton
                ? {
                    role: 'status',
                    'aria-live': 'polite',
                    'aria-busy': true,
                    'aria-label': 'Loading leaderboard',
                  }
                : {})}
            >
              {showTableSkeleton ? (
                <LeaderboardTableSkeleton rows={8} />
              ) : rows.length === 0 ? (
                <div className="lb-table__empty">No entries for this filter yet.</div>
              ) : (
                rows.map((row) => (
                  <div
                    key={row.key}
                    className={['lb-table__row', row.isCurrentUser ? 'lb-table__row--me' : ''].filter(Boolean).join(' ')}
                  >
                    <span className="lb-table__cell lb-table__cell--rank">{row.rank}</span>
                    <span className="lb-table__cell lb-table__cell--name">
                      <span className="lb-table__avatar-wrap">
                        {row.rank <= 3 ? (
                          <span className={['lb-table__medal', `lb-table__medal--${row.rank}`].join(' ')} aria-hidden>
                            {row.rank}
                          </span>
                        ) : null}
                        <img className="lb-table__avatar" src={row.photo} alt="" width={32} height={32} />
                      </span>
                      <span className="lb-table__name-text">{row.displayName}</span>
                    </span>
                    <span className="lb-table__cell lb-table__cell--muted">{row.country}</span>
                    <span className="lb-table__cell lb-table__cell--muted lb-table__cell--with-icon">
                      <IconSchedule className="lb-table__inline-ico" />
                      {row.learningHours} hours
                    </span>
                    <span className="lb-table__cell lb-table__cell--muted lb-table__cell--with-icon">
                      <IconFolder className="lb-table__inline-ico" />
                      {row.projectCount} Projects
                    </span>
                    <span className="lb-table__cell lb-table__cell--aura lb-table__cell--with-icon">
                      <IconFlame className="lb-table__inline-ico lb-table__inline-ico--flame" />
                      {row.totalAura}
                    </span>
                    <span className="lb-table__cell lb-table__cell--actions">
                      <LeaderboardFollowCell row={row} viewer={user} />
                      <button type="button" className="lb-table__more" aria-label="Row actions">
                        <IconMore className="lb-table__more-svg" />
                      </button>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
