import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { useProjects } from '../context/ProjectsContext'
import { ProjectCard911198 } from '../components/ProjectCard911198'
import { ProjectCardsSkeletonGrid } from '../components/skeletons/ProjectCardsSkeletonGrid'
import { db } from '../firebase'
import {
  followUser,
  subscribeFollowers,
  unfollowUser,
} from '../services/followersFirestore'
import { getUserDocument } from '../services/userProfileFirestore'
import {
  filterProjectsByOwner,
  totalAuraForUser,
} from '../utils/aura'
import './ProfilePage.css'

const DEFAULT_AVATAR = '/figma/profile-chip/avatar-default.png'

function formatCompactCount(n) {
  const x = Number(n) || 0
  if (x >= 1_000_000) {
    const v = x / 1_000_000
    return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, '')}M`
  }
  if (x >= 1000) {
    const v = x / 1000
    return `${v >= 10 ? v.toFixed(0) : v.toFixed(1).replace(/\.0$/, '')}k`
  }
  return String(x)
}

function handleFromFirestore(profile) {
  const raw =
    (typeof profile?.username === 'string' && profile.username.trim()) ||
    (typeof profile?.email === 'string' && profile.email.split('@')[0]) ||
    'user'
  const slug = String(raw)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
  return slug || 'user'
}

function parseCreatedMs(p) {
  const raw = p?.createdAt
  if (!raw) return 0
  const t = new Date(raw).getTime()
  return Number.isFinite(t) ? t : 0
}

function IconVerified({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" width={20} height={20} aria-hidden>
      <circle cx="10" cy="10" r="10" fill="#2563eb" />
      <path
        d="M6 10.2 8.4 12.6 14 7"
        fill="none"
        stroke="#fff"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconFlame({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={18} height={18} fill="none" aria-hidden>
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

function IconTabGrid({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={18} height={18} fill="none" aria-hidden>
      <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" stroke="currentColor" strokeWidth="1.35" />
    </svg>
  )
}

function IconTabHeart({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={18} height={18} fill="none" aria-hidden>
      <path
        d="M12 21s-7-4.35-7-10a4.5 4.5 0 0 1 8.18-2.52L12 9l1.82-1.52A4.5 4.5 0 0 1 19 11c0 5.65-7 10-7 10Z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function FollowProfileButton({ targetUid, viewer }) {
  const [following, setFollowing] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!db || !targetUid || !viewer?.uid || viewer.uid === targetUid) {
      queueMicrotask(() => setFollowing(false))
      return undefined
    }
    const ref = doc(db, 'users', targetUid, 'followers', viewer.uid)
    return onSnapshot(ref, (snap) => setFollowing(snap.exists()))
  }, [targetUid, viewer?.uid])

  if (!viewer?.uid || viewer.uid === targetUid || !db) return null

  async function toggle() {
    setBusy(true)
    try {
      if (following) await unfollowUser(viewer.uid, targetUid)
      else await followUser(viewer, targetUid)
    } catch (e) {
      console.warn('[FollowProfileButton]', e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      className="profile-page__follow-user"
      disabled={busy}
      onClick={() => void toggle()}
    >
      {following ? 'Following' : 'Follow'}
    </button>
  )
}

const PUBLIC_TABS = /** @type {const} */ ([
  { id: 'post', label: 'Post', Icon: IconTabGrid },
  { id: 'rated', label: 'Most Rated', Icon: IconTabHeart },
])

export function PublicProfilePage() {
  const { uid: uidParam } = useParams()
  const uid = typeof uidParam === 'string' ? uidParam.trim() : ''
  const { user: viewer, firebaseReady } = useAuth()
  const { projects, projectsLoading, projectsError } = useProjects()
  const [followers, setFollowers] = useState([])
  const [activeTab, setActiveTab] = useState('post')
  const [profileDoc, setProfileDoc] = useState(/** @type {Record<string, unknown> | null} */ (null))
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileMissing, setProfileMissing] = useState(false)

  useEffect(() => {
    if (!uid || !firebaseReady || !db) {
      queueMicrotask(() => {
        setProfileLoading(false)
        setProfileMissing(!uid)
      })
      return undefined
    }
    let cancelled = false
    void (async () => {
      setProfileLoading(true)
      setProfileMissing(false)
      try {
        const data = await getUserDocument(uid)
        if (cancelled) return
        setProfileDoc(data)
        setProfileMissing(!data)
      } catch (err) {
        console.warn('[PublicProfilePage]', err)
        if (!cancelled) {
          setProfileDoc(null)
          setProfileMissing(true)
        }
      } finally {
        if (!cancelled) setProfileLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [uid, firebaseReady])

  useEffect(() => {
    if (!uid) {
      queueMicrotask(() => setFollowers([]))
      return undefined
    }
    return subscribeFollowers(uid, setFollowers)
  }, [uid])

  const photoURL =
    typeof profileDoc?.photoURL === 'string' ? profileDoc.photoURL : ''
  const photoSrc = photoURL || DEFAULT_AVATAR

  const ownedProjects = useMemo(
    () => filterProjectsByOwner(projects, { uid, photoURL }),
    [projects, uid, photoURL],
  )

  const postOrdered = useMemo(
    () => [...ownedProjects].sort((a, b) => parseCreatedMs(b) - parseCreatedMs(a)),
    [ownedProjects],
  )

  const ratedOrdered = useMemo(
    () =>
      [...ownedProjects].sort(
        (a, b) => (Number(b.likes) || 0) - (Number(a.likes) || 0),
      ),
    [ownedProjects],
  )

  const gridProjects = useMemo(() => {
    if (activeTab === 'post') return postOrdered
    return ratedOrdered
  }, [activeTab, postOrdered, ratedOrdered])

  const aura = useMemo(
    () => totalAuraForUser(projects, { uid, photoURL }),
    [projects, uid, photoURL],
  )

  const showProjectsSkeleton =
    projectsLoading && projects.length === 0 && !projectsError

  if (!firebaseReady || !db) {
    return (
      <main className="profile-page profile-page--simple" id="app-main">
        <h1 className="profile-page__fallback-title">Profile</h1>
        <p className="profile-page__muted">Firebase isn’t configured.</p>
      </main>
    )
  }

  if (!viewer) {
    return (
      <main className="profile-page profile-page--simple" id="app-main">
        <h1 className="profile-page__fallback-title">Member profile</h1>
        <p className="profile-page__muted">
          <Link to="/login">Sign in</Link> to view other members’ profiles.
        </p>
      </main>
    )
  }

  if (viewer.uid === uid) {
    return <Navigate to="/profile" replace />
  }

  if (!uid) {
    return (
      <main className="profile-page profile-page--simple" id="app-main">
        <h1 className="profile-page__fallback-title">Profile</h1>
        <p className="profile-page__muted">Invalid profile link.</p>
      </main>
    )
  }

  if (!profileLoading && profileMissing) {
    return (
      <main className="profile-page profile-page--simple" id="app-main">
        <h1 className="profile-page__fallback-title">Profile</h1>
        <p className="profile-page__muted">
          No Firestore profile for this member yet (they may not have signed in
          since search indexing was added).
        </p>
        <p className="profile-page__muted">
          <Link to="/">Back to Explore</Link>
        </p>
      </main>
    )
  }

  const displayName =
    (typeof profileDoc?.displayName === 'string' && profileDoc.displayName.trim()) ||
    (typeof profileDoc?.email === 'string' && profileDoc.email.split('@')[0]) ||
    'Member'

  const handle = `@${handleFromFirestore(profileDoc ?? {})}`
  const subtitle =
    typeof profileDoc?.country === 'string' && profileDoc.country.trim()
      ? profileDoc.country.trim()
      : ''

  const followerLabel = `${formatCompactCount(followers.length)} Followers`
  const auraLabel = `${formatCompactCount(aura)} Aura`

  let emptyCopy = 'No public posts yet.'
  if (activeTab === 'rated') {
    emptyCopy = 'No rated posts yet.'
  }

  return (
    <main
      className="profile-page"
      id="app-main"
      aria-label={`${displayName} profile`}
      aria-busy={showProjectsSkeleton || profileLoading}
    >
      <div className="profile-page__shell">
        <p className="profile-page__back-hint">
          <Link to="/profile">← Your profile</Link>
        </p>

        <header className="profile-page__header">
          {profileLoading ? (
            <div
              className="profile-page__header-inner profile-page__header-inner--loading"
              aria-hidden
            >
              <span className="profile-page__avatar-skeleton skeleton-block" />
              <div className="profile-page__header-main">
                <span className="profile-page__title-skeleton skeleton-block" />
                <span className="profile-page__handle-skeleton skeleton-block" />
                <div className="profile-page__metrics profile-page__metrics--skeleton">
                  <span className="profile-page__metric-skel profile-page__metric-skel--followers skeleton-block" />
                  <span className="profile-page__metric-skel profile-page__metric-skel--aura skeleton-block" />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div
                className="profile-page__header-bg"
                style={{ backgroundImage: `url(${photoSrc})` }}
                aria-hidden
              />
              <div className="profile-page__header-inner">
                <img
                  className="profile-page__avatar-lg"
                  src={photoSrc}
                  alt=""
                  width={88}
                  height={88}
                  referrerPolicy="no-referrer"
                />
                <div className="profile-page__header-main">
                  <div className="profile-page__name-row">
                    <h1 className="profile-page__display-name">{displayName}</h1>
                    <IconVerified className="profile-page__verified" aria-hidden />
                  </div>
                  <p className="profile-page__handle">{handle}</p>
                  {subtitle && (
                    <p className="profile-page__public-sub">{subtitle}</p>
                  )}
                  {showProjectsSkeleton ? (
                    <div
                      className="profile-page__metrics profile-page__metrics--skeleton"
                      aria-hidden
                    >
                      <span className="profile-page__metric-skel profile-page__metric-skel--followers skeleton-block" />
                      <span className="profile-page__metric-skel profile-page__metric-skel--aura skeleton-block" />
                    </div>
                  ) : (
                    <div className="profile-page__metrics">
                      <span className="profile-page__metric">{followerLabel}</span>
                      <span
                        className="profile-page__metric profile-page__metric--aura"
                        title="Total likes on their projects"
                      >
                        <IconFlame className="profile-page__metric-flame" />
                        {auraLabel}
                      </span>
                    </div>
                  )}
                </div>
                <div className="profile-page__header-actions">
                  <FollowProfileButton targetUid={uid} viewer={viewer} />
                </div>
              </div>
            </>
          )}
        </header>

        {showProjectsSkeleton ? (
          <div className="profile-page__tabs-skeleton" aria-hidden>
            <span className="profile-page__tab-skel skeleton-block" />
            <span className="profile-page__tab-skel skeleton-block" />
          </div>
        ) : (
          <div
            className="profile-page__tabs"
            role="tablist"
            aria-label="Member posts"
          >
            {PUBLIC_TABS.map(({ id, label, Icon }) => {
              const selected = activeTab === id
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  id={`public-profile-tab-${id}`}
                  aria-selected={selected}
                  aria-controls="public-profile-panel"
                  className={[
                    'profile-page__tab',
                    selected ? 'profile-page__tab--active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => setActiveTab(id)}
                >
                  <Icon className="profile-page__tab-icon" />
                  <span>{label}</span>
                </button>
              )
            })}
          </div>
        )}

        {projectsError ? (
          <p className="profile-page__alert" role="alert">
            {projectsError}. Start the API with{' '}
            <code className="app__inline-code">npm run dev</code>.
          </p>
        ) : null}

        <div
          id="public-profile-panel"
          role="tabpanel"
          {...(showProjectsSkeleton && !profileLoading
            ? { 'aria-label': 'Loading projects' }
            : { 'aria-labelledby': `public-profile-tab-${activeTab}` })}
        >
          {showProjectsSkeleton ? (
            <ProjectCardsSkeletonGrid count={6} className="profile-page__project-cards" />
          ) : (
            <div className="project-cards profile-page__project-cards">
              {gridProjects.length === 0 ? (
                <p className="profile-page__empty profile-page__empty--full">
                  {emptyCopy}
                </p>
              ) : (
                gridProjects.map((project) => (
                  <div key={project.id} className="project-cards__slot">
                    <ProjectCard911198 project={project} />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
