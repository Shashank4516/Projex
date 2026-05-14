/* Hook + provider grouped for demo state; suppress react-refresh export rule */
/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { apiUrl } from '../lib/apiBase'
import { useAuth } from './AuthContext'

const ASSET = {
  preview: '/figma/card-91-1198/preview.png',
  bgVector: '/figma/card-91-1198/bg-vector.svg',
  avatar: '/figma/card-91-1198/avatar.png',
}

const ProjectsContext = createContext(null)

async function patchProject(id, body) {
  const res = await fetch(apiUrl(`/api/projects/${encodeURIComponent(id)}`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || res.statusText)
  }
  return res.json()
}

async function fetchProjectsJson() {
  const res = await fetch(apiUrl('/api/projects'))
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || res.statusText)
  }
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

export function ProjectsProvider({ children }) {
  const { user, profile } = useAuth()
  const [projects, setProjects] = useState([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [projectsError, setProjectsError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState(null)

  const refreshProjects = useCallback(async () => {
    setProjectsError(null)
    try {
      const next = await fetchProjectsJson()
      setProjects(next)
    } catch (e) {
      console.error(e)
      setProjectsError(
        e instanceof Error ? e.message : 'Could not load projects',
      )
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    void (async () => {
      await Promise.resolve()
      if (cancelled) return
      setProjectsLoading(true)
      setProjectsError(null)
      try {
        const data = await fetchProjectsJson()
        if (!cancelled) setProjects(data)
      } catch (e) {
        if (!cancelled) {
          console.error(e)
          setProjectsError(
            e instanceof Error ? e.message : 'Could not load projects',
          )
          setProjects([])
        }
      } finally {
        if (!cancelled) setProjectsLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const addProject = useCallback(async (draft) => {
    const id = crypto.randomUUID()
    const ownerCountry =
      typeof profile?.country === 'string' && profile.country.trim()
        ? profile.country.trim()
        : ''
    const row = {
      id,
      title: draft.title,
      tags: Array.isArray(draft.tags) ? draft.tags : [],
      bannerSrc: draft.bannerSrc,
      deployedUrl: draft.deployedUrl || '#',
      ownerPhotoURL: draft.ownerPhotoURL || ASSET.avatar,
      ownerUid: typeof user?.uid === 'string' ? user.uid : '',
      ownerCountry,
      likes: 0,
      likedByUser: false,
      savedByUser: false,
    }
    const res = await fetch(apiUrl('/api/projects'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || res.statusText)
    }
    const created = await res.json()
    setProjects((prev) => [created, ...prev.filter((p) => p.id !== created.id)])
    setModalOpen(false)
  }, [profile, user])

  /** Sync leaderboard country on all projects that match the signed-in user’s avatar URL. */
  const syncMyProjectsCountry = useCallback(
    async (country) => {
      const photo = user?.photoURL
      if (!photo) return
      const c = String(country ?? '').trim()
      const mine = projects.filter((p) => p.ownerPhotoURL === photo)
      await Promise.all(
        mine.map((p) =>
          patchProject(p.id, { ownerCountry: c }).catch(console.error),
        ),
      )
      await refreshProjects()
    },
    [user?.photoURL, projects, refreshProjects],
  )

  const toggleLike = useCallback((id) => {
    setProjects((prev) => {
      const updated = prev.map((p) =>
        p.id === id
          ? {
              ...p,
              likedByUser: !p.likedByUser,
              likes: p.likedByUser ? p.likes - 1 : p.likes + 1,
            }
          : p,
      )
      const p = updated.find((x) => x.id === id)
      if (p) {
        patchProject(id, { likedByUser: p.likedByUser, likes: p.likes }).catch(
          console.error,
        )
      }
      return updated
    })
  }, [])

  const toggleSaved = useCallback((id) => {
    setProjects((prev) => {
      const updated = prev.map((p) =>
        p.id === id ? { ...p, savedByUser: !p.savedByUser } : p,
      )
      const p = updated.find((x) => x.id === id)
      if (p) {
        patchProject(id, { savedByUser: p.savedByUser }).catch(console.error)
      }
      return updated
    })
  }, [])

  const filteredProjects = useMemo(() => {
    if (!activeFilter) return projects
    const key = activeFilter.toLowerCase()
    return projects.filter(
      (p) =>
        Array.isArray(p.tags) &&
        p.tags.some(
          (t) =>
            t !== null &&
            typeof t === 'object' &&
            typeof t.label === 'string' &&
            t.label.toLowerCase() === key,
        ),
    )
  }, [projects, activeFilter])

  const value = useMemo(
    () => ({
      projects,
      filteredProjects,
      projectsLoading,
      projectsError,
      refreshProjects,
      addProject,
      toggleLike,
      toggleSaved,
      modalOpen,
      setModalOpen,
      activeFilter,
      setActiveFilter,
      syncMyProjectsCountry,
    }),
    [
      projects,
      filteredProjects,
      projectsLoading,
      projectsError,
      refreshProjects,
      addProject,
      syncMyProjectsCountry,
      toggleLike,
      toggleSaved,
      modalOpen,
      activeFilter,
    ],
  )

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  )
}

export function useProjects() {
  const ctx = useContext(ProjectsContext)
  if (!ctx)
    throw new Error('useProjects must be used within ProjectsProvider')
  return ctx
}
