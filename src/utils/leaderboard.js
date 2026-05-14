/** @typedef {'all' | 'month' | 'week'} LeaderboardRange */

const NAME_POOL = [
  'Ronald Jones',
  'Grace Stokes',
  'Bernard Underwood',
  'Cody May',
  'Jimmy Watkins',
  'Elena Hart',
  'Marcus Webb',
  'Priya Singh',
  'Noah Kim',
  'Sofia Alvarez',
  'James Chen',
  'Amira Hassan',
  'Olivia Park',
  'Diego Ramos',
  'Hannah Lee',
]

/** Fallback when projects have no `ownerCountry` (legacy / anonymous). */
const COUNTRY_POOL = [
  'Slovakia',
  'Pakistan',
  'Maldives',
  'Tunisia',
  'Somalia',
  'Liberia',
  'Kenya',
  'Japan',
  'Canada',
  'Brazil',
  'Germany',
  'India',
  'Australia',
  'France',
  'Mexico',
]

function countryFromProjectGroup(group) {
  for (const p of group) {
    const c = p?.ownerCountry
    if (typeof c === 'string' && c.trim()) return c.trim()
  }
  return null
}

export function hashString(s) {
  const str = String(s ?? '')
  let h = 0
  for (let i = 0; i < str.length; i += 1) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function pickFromPool(seed, pool) {
  return pool[hashString(seed) % pool.length]
}

function parseCreatedAt(p) {
  const raw = p.createdAt
  if (!raw) return null
  const t = new Date(raw).getTime()
  return Number.isFinite(t) ? t : null
}

/**
 * @param {unknown[]} projects
 * @param {LeaderboardRange} range
 */
export function filterProjectsByRange(projects, range) {
  if (range === 'all') return projects
  const now = Date.now()
  const start =
    range === 'week'
      ? now - 7 * 24 * 60 * 60 * 1000
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime()
  return projects.filter((p) => {
    const t = parseCreatedAt(p)
    if (t == null) return true
    return t >= start
  })
}

/**
 * @param {{
 *   projects: unknown[]
 *   range: LeaderboardRange
 *   search: string
 *   currentUserPhotoURL?: string | null
 *   currentUserDisplayName?: string | null
 *   currentUserCountry?: string | null
 *   currentUserUid?: string | null
 * }} opts
 */
export function buildLeaderboardRows({
  projects,
  range,
  search,
  currentUserPhotoURL,
  currentUserDisplayName,
  currentUserCountry,
  currentUserUid,
}) {
  const list = Array.isArray(projects) ? projects : []
  const filtered = filterProjectsByRange(list, range)
  const q = search.trim().toLowerCase()

  /** @type {Map<string, { key: string, projects: unknown[] }>} */
  const groups = new Map()
  for (const p of filtered) {
    const photo =
      typeof p.ownerPhotoURL === 'string' && p.ownerPhotoURL
        ? p.ownerPhotoURL
        : ''
    const uidRaw =
      typeof p.ownerUid === 'string' && p.ownerUid.trim() ? p.ownerUid.trim() : ''
    const key = uidRaw ? `uid:${uidRaw}` : photo || '__anon__'
    if (!groups.has(key)) {
      groups.set(key, { key, projects: [] })
    }
    groups.get(key).projects.push(p)
  }

  const rows = []
  for (const { key, projects: group } of groups.values()) {
    let ownerUid = ''
    let photo = ''
    for (const p of group) {
      const u = typeof p.ownerUid === 'string' ? p.ownerUid.trim() : ''
      if (u) ownerUid = u
      const ph =
        typeof p.ownerPhotoURL === 'string' && p.ownerPhotoURL
          ? p.ownerPhotoURL
          : ''
      if (!photo && ph) photo = ph
    }

    let totalAura = 0
    let tagTally = 0
    for (const p of group) {
      totalAura += Number.isFinite(p.likes) ? p.likes : 0
      if (Array.isArray(p.tags)) {
        tagTally += p.tags.filter(Boolean).length
      }
    }
    const projectCount = group.length
    const learningHours = Math.max(
      1,
      Math.round(12 * projectCount + totalAura * 0.14 + tagTally * 2.5),
    )

    const isCurrentUser =
      (Boolean(currentUserUid) &&
        Boolean(ownerUid) &&
        ownerUid === currentUserUid) ||
      (Boolean(currentUserPhotoURL) &&
        Boolean(photo) &&
        photo === currentUserPhotoURL &&
        (!ownerUid || ownerUid === currentUserUid))

    const displayName = isCurrentUser
      ? currentUserDisplayName?.trim() || 'Me'
      : key === '__anon__'
        ? 'Anonymous'
        : pickFromPool(key, NAME_POOL)

    const fromProjects = countryFromProjectGroup(group)
    const profileCountry =
      typeof currentUserCountry === 'string' && currentUserCountry.trim()
        ? currentUserCountry.trim()
        : null
    const country =
      isCurrentUser && profileCountry
        ? profileCountry
        : fromProjects || pickFromPool(`${key}-country`, COUNTRY_POOL)

    rows.push({
      key,
      ownerUid,
      photo: photo || '/figma/card-91-1198/avatar.png',
      displayName,
      country,
      learningHours,
      projectCount,
      totalAura,
      isCurrentUser,
    })
  }

  rows.sort((a, b) => b.totalAura - a.totalAura)

  const filteredBySearch = q
    ? rows.filter(
        (r) =>
          r.displayName.toLowerCase().includes(q) ||
          r.country.toLowerCase().includes(q),
      )
    : rows

  return filteredBySearch.map((r, i) => ({ ...r, rank: i + 1 }))
}
