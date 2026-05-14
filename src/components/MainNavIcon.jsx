/** Shared SVG icons for primary app routes (dashboard + mobile bar). */
export function MainNavIcon({ name, className }) {
  const cn = ['main-nav-icon__svg', className].filter(Boolean).join(' ')
  switch (name) {
    case 'compass':
      return (
        <svg className={cn} viewBox="0 0 24 24" width={22} height={22} fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.25" />
          <path
            d="M12 8.5 14.2 15.5 12 13.2 9.8 15.5 12 8.5z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'upload':
      return (
        <svg className={cn} viewBox="0 0 24 24" width={22} height={22} fill="none" aria-hidden>
          <path
            d="M12 5v12M8 9l4-4 4 4M5 19h14"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'trophy':
      return (
        <svg className={cn} viewBox="0 0 24 24" width={22} height={22} fill="none" aria-hidden>
          <path
            d="M8 21h8M12 17v4M7 4h10v3a5 5 0 0 1-10 0V4Z"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 7H5a1.5 1.5 0 0 0 1.5 1.5h0M17 7h2a1.5 1.5 0 0 1-1.5 1.5h0"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'user':
      return (
        <svg className={cn} viewBox="0 0 24 24" width={22} height={22} fill="none" aria-hidden>
          <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.25" />
          <path
            d="M6.5 20.5v-1A4.5 4.5 0 0 1 11 15h2a4.5 4.5 0 0 1 4.5 4.5v1"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'bell':
      return (
        <svg className={cn} viewBox="0 0 24 24" width={22} height={22} fill="none" aria-hidden>
          <path
            d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'settings':
      return (
        <svg className={cn} viewBox="0 0 24 24" width={22} height={22} fill="none" aria-hidden>
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.25" />
          <path
            d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </svg>
      )
    default:
      return null
  }
}
