/** Used for leaderboard in mobile nav, sidebar footer, and page header. */
export const LEADERBOARD_ICON_SRC = '/figma/image.png'

/** Primary app navigation — matches main sidebar / mobile bar. */
export const APP_NAV = /** @type {const} */ ([
  { to: '/', label: 'Explore', end: true, icon: 'compass' },
  { to: '/upload', label: 'Upload Project', end: false, icon: 'upload' },
  { to: '/leaderboard', label: 'Leaderboard', end: false, icon: 'leaderboard' },
  { to: '/profile', label: 'Profile', end: false, icon: 'user' },
  { to: '/notifications', label: 'Notifications', end: false, icon: 'bell' },
  { to: '/settings', label: 'Settings', end: false, icon: 'settings' },
])
