/**
 * Total aura = sum of likes on projects owned by the user (matches leaderboard semantics).
 * Ownership: Firebase uid on project when present, else Google profile photo URL.
 *
 * @param {unknown[]} projects
 * @param {{ uid?: string | null, photoURL?: string | null }} user
 */
export function totalAuraForUser(projects, user) {
  const list = Array.isArray(projects) ? projects : []
  const uid = typeof user?.uid === 'string' && user.uid.trim() ? user.uid.trim() : ''
  const photo =
    typeof user?.photoURL === 'string' && user.photoURL ? user.photoURL : ''

  return list.reduce((acc, p) => {
    const likes = Number.isFinite(p?.likes) ? p.likes : 0
    const pUid = typeof p?.ownerUid === 'string' ? p.ownerUid.trim() : ''
    if (uid && pUid && pUid === uid) return acc + likes
    if (photo && p?.ownerPhotoURL === photo) return acc + likes
    return acc
  }, 0)
}

/**
 * @param {unknown} project
 * @param {{ uid?: string | null, photoURL?: string | null }} user
 */
export function isProjectOwnedByUser(project, user) {
  if (!user) return false
  const uid = typeof user.uid === 'string' && user.uid.trim() ? user.uid.trim() : ''
  const photo =
    typeof user.photoURL === 'string' && user.photoURL ? user.photoURL : ''
  const pUid = typeof project?.ownerUid === 'string' ? project.ownerUid.trim() : ''
  if (uid && pUid && pUid === uid) return true
  if (photo && project?.ownerPhotoURL === photo) return true
  return false
}
