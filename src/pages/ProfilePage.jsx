import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProjects } from '../context/ProjectsContext'
import { ProjectCard911198 } from '../components/ProjectCard911198'
import { ProjectCardsSkeletonGrid } from '../components/skeletons/ProjectCardsSkeletonGrid'
import { subscribeFollowers } from '../services/followersFirestore'
import { isProjectOwnedByUser, totalAuraForUser } from '../utils/aura'
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

function handleFromUser(user, profile) {
  const raw =
    (typeof profile?.username === 'string' && profile.username.trim()) ||
    user?.email?.split('@')[0] ||
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

function IconPencil({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={18} height={18} fill="none" aria-hidden>
      <path
        d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
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

function IconTabBookmark({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={18} height={18} fill="none" aria-hidden>
      <path
        d="M6 4h12v16l-6-4-6 4V4Z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const TABS = /** @type {const} */ ([
  { id: 'post', label: 'Post', Icon: IconTabGrid },
  { id: 'rated', label: 'Most Rated', Icon: IconTabHeart },
  { id: 'bookmarks', label: 'Bookmarks', Icon: IconTabBookmark },
])

export function ProfilePage() {
  const { user, profile, firebaseReady } = useAuth()
  const { projects, projectsLoading, projectsError } = useProjects()
  const [followers, setFollowers] = useState([])
  const [activeTab, setActiveTab] = useState('post')

  useEffect(() => {
    if (!user?.uid) {
      queueMicrotask(() => setFollowers([]))
      return undefined
    }
    return subscribeFollowers(user.uid, setFollowers)
  }, [user?.uid])

  const aura = useMemo(
    () => totalAuraForUser(projects, user ?? {}),
    [projects, user],
  )

  const myProjects = useMemo(() => {
    if (!user) return []
    return projects.filter((p) => isProjectOwnedByUser(p, user))
  }, [projects, user])

  const savedProjects = useMemo(
    () => projects.filter((p) => p.savedByUser),
    [projects],
  )

  const postOrdered = useMemo(
    () => [...myProjects].sort((a, b) => parseCreatedMs(b) - parseCreatedMs(a)),
    [myProjects],
  )

  const ratedOrdered = useMemo(
    () => [...myProjects].sort((a, b) => (Number(b.likes) || 0) - (Number(a.likes) || 0)),
    [myProjects],
  )

  const gridProjects = useMemo(() => {
    if (activeTab === 'post') return postOrdered
    if (activeTab === 'rated') return ratedOrdered
    return savedProjects
  }, [activeTab, postOrdered, ratedOrdered, savedProjects])

  if (!firebaseReady) {
    return (
      <main className="profile-page profile-page--simple" id="app-main" aria-label="Profile">
        <h1 className="profile-page__fallback-title">Profile</h1>
        <p className="profile-page__muted">Firebase isn’t configured.</p>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="profile-page profile-page--simple" id="app-main" aria-label="Profile">
        <h1 className="profile-page__fallback-title">Profile</h1>
        <p className="profile-page__muted">
          <Link to="/login">Sign in</Link> to see your posts, bookmarks, followers, and aura.
        </p>
      </main>
    )
  }

  const displayName =
    (typeof profile?.displayName === 'string' && profile.displayName.trim()) ||
    user.displayName?.trim() ||
    user.email?.split('@')[0] ||
    'User'

  const handle = `@${handleFromUser(user, profile)}`
  const photoSrc = user.photoURL || DEFAULT_AVATAR
  const followerLabel = `${formatCompactCount(followers.length)} Followers`
  const auraLabel = `${formatCompactCount(aura)} Aura`
  const showProjectsSkeleton =
    projectsLoading && projects.length === 0 && !projectsError

  let emptyCopy =
    'No projects yet. Upload from the + button or the Upload tab.'
  if (activeTab === 'rated') {
    emptyCopy = 'No rated posts yet — add a project first.'
  }
  if (activeTab === 'bookmarks') {
    emptyCopy = 'Nothing bookmarked yet. Save projects from the explore feed.'
  }

  return (
    <main className="profile-page" id="app-main" aria-label="Your profile">
      <div className="profile-page__shell">
        <header className="profile-page__header">
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
              <div className="profile-page__metrics">
                <span className="profile-page__metric">{followerLabel}</span>
                <span className="profile-page__metric profile-page__metric--aura" title="Total likes on your projects">
                  <IconFlame className="profile-page__metric-flame" />
                  {auraLabel}
                </span>
              </div>
            </div>
            <Link
              to="/settings"
              className="profile-page__edit"
              aria-label="Edit profile"
            >
              <IconPencil className="profile-page__edit-icon" />
            </Link>
          </div>
        </header>

        <div
          className="profile-page__tabs"
          role="tablist"
          aria-label="Profile content"
        >
          {TABS.map(({ id, label, Icon }) => {
            const selected = activeTab === id
            return (
              <button
                key={id}
                type="button"
                role="tab"
                id={`profile-tab-${id}`}
                aria-selected={selected}
                aria-controls="profile-tab-panel"
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

        {projectsError ? (
          <p className="profile-page__alert" role="alert">
            {projectsError}. Start the API with{' '}
            <code className="app__inline-code">npm run dev</code>.
          </p>
        ) : null}

        <div
          id="profile-tab-panel"
          role="tabpanel"
          aria-labelledby={`profile-tab-${activeTab}`}
        >
          {showProjectsSkeleton ? (
            <ProjectCardsSkeletonGrid count={6} className="profile-page__project-cards" />
          ) : (
            <div className="project-cards profile-page__project-cards">
              {gridProjects.length === 0 ? (
                <p className="profile-page__empty profile-page__empty--full">{emptyCopy}</p>
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
