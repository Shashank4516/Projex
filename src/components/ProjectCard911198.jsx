import { useEffect, useRef, useState } from 'react'
import { useProjects } from '../context/ProjectsContext'
import './ProjectCard911198.css'

const ASSET = {
  bgVector: '/figma/card-91-1198/bg-vector.svg',
  preview: '/figma/card-91-1198/preview.png',
  avatar: '/figma/card-91-1198/avatar.png',
  buttonArrow: '/figma/card-91-1198/button-arrow.svg',
}

// Module-level cache so each banner is only fetched once per session.
const bannerCache = new Map()

/**
 * Shows a placeholder until the card is near the viewport, then loads full
 * banner from GET /api/projects/item/{id} (list response omits bannerSrc).
 */
function useLazyBanner(id, fallback) {
  const [src, setSrc] = useState(() => bannerCache.get(id) ?? fallback)
  const cardRef = useRef(null)

  useEffect(() => {
    const el = cardRef.current
    if (!el || !id) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        if (bannerCache.has(id)) {
          setSrc(bannerCache.get(id))
          return
        }
        fetch(`/api/projects/item/${encodeURIComponent(id)}`, { cache: 'force-cache' })
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            const url = data?.bannerSrc
            if (url) {
              bannerCache.set(id, url)
              setSrc(url)
            }
          })
          .catch(() => {})
      },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [id, fallback])

  return { src, cardRef }
}

/* Full path = outer silhouette + inner loop (hole). Stroked when unliked. */
const FLAME_PATH_OUTLINE =
  'M6.20889 6.40553C6.51247 5.97945 6.4786 5.53071 6.26809 4.72352C5.85178 3.12712 6.01755 2.25212 7.45274 1.21619L8.15323 0.710576L8.32266 1.55771C8.50272 2.458 8.79841 3.01483 9.55766 4.0859C9.58782 4.12845 9.58782 4.12845 9.61812 4.17118C10.7118 5.71411 11.1112 6.64423 11.1112 8.33333C11.1112 10.3824 9.03976 12.2222 6.66678 12.2222C4.29367 12.2222 2.22234 10.3827 2.22234 8.33333C2.22234 8.29502 2.22237 8.29618 2.21588 8.12691C2.16569 6.81766 2.40778 5.79298 3.38737 4.68658C3.59434 4.45282 3.8296 4.22815 4.09435 4.01316L4.67879 3.53858L4.95992 4.23698C5.16766 4.75303 5.41106 5.1587 5.68601 5.45639C5.91888 5.70852 6.09164 6.02559 6.20889 6.40553ZM4.21927 5.42314C3.46518 6.27484 3.2859 7.03366 3.32618 8.08434C3.33368 8.27994 3.33345 8.27306 3.33345 8.33333C3.33345 9.73771 4.87989 11.1111 6.66678 11.1111C8.45352 11.1111 10.0001 9.73748 10.0001 8.33333C10.0001 6.92122 9.68441 6.18612 8.71163 4.81371C8.68149 4.7712 8.68149 4.7712 8.65119 4.72846C8.06042 3.89505 7.70827 3.31532 7.4753 2.66695C7.09482 3.12287 7.11719 3.57632 7.34325 4.44314C7.75956 6.03954 7.59379 6.91453 6.1586 7.95046L5.34026 8.54114L5.27892 7.53376C5.23972 6.89013 5.09404 6.45308 4.86978 6.21027C4.64821 5.97037 4.44815 5.68952 4.26875 5.36821C4.25202 5.38647 4.23553 5.40478 4.21927 5.42314Z'

/* Outer contour only — solid fill like the bookmark (no “donut hole”). */
const FLAME_PATH_SOLID =
  'M6.20889 6.40553C6.51247 5.97945 6.4786 5.53071 6.26809 4.72352C5.85178 3.12712 6.01755 2.25212 7.45274 1.21619L8.15323 0.710576L8.32266 1.55771C8.50272 2.458 8.79841 3.01483 9.55766 4.0859C9.58782 4.12845 9.58782 4.12845 9.61812 4.17118C10.7118 5.71411 11.1112 6.64423 11.1112 8.33333C11.1112 10.3824 9.03976 12.2222 6.66678 12.2222C4.29367 12.2222 2.22234 10.3827 2.22234 8.33333C2.22234 8.29502 2.22237 8.29618 2.21588 8.12691C2.16569 6.81766 2.40778 5.79298 3.38737 4.68658C3.59434 4.45282 3.8296 4.22815 4.09435 4.01316L4.67879 3.53858L4.95992 4.23698C5.16766 4.75303 5.41106 5.1587 5.68601 5.45639C5.91888 5.70852 6.09164 6.02559 6.20889 6.40553Z'

/** Flame — outlined when not liked; solid orange fill when liked (same “filled glyph” idea as bookmark). */
function FlameIcon({ liked }) {
  return (
    <svg
      viewBox="0 0 13.3333 13.3333"
      width="13.333"
      height="13.333"
      fill="none"
      className="pc-911198__meta-svg"
      aria-hidden
    >
      {liked ? (
        <path d={FLAME_PATH_SOLID} fill="#f97316" />
      ) : (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d={FLAME_PATH_OUTLINE}
          fill="none"
          stroke="#9ca3af"
          strokeWidth="0.9"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}

/** Bookmark icon — filled when saved, outlined when not. */
function BookmarkIcon({ saved }) {
  return (
    <svg
      viewBox="0 0 14 14"
      width="13.333"
      height="13.333"
      fill="none"
      className="pc-911198__meta-svg"
      aria-hidden
    >
      <path
        d="M3.5 2C3.22 2 3 2.22 3 2.5v10l4-2.4 4 2.4V2.5
           C11 2.22 10.78 2 10.5 2h-7z"
        fill={saved ? '#111827' : 'none'}
        stroke={saved ? 'none' : '#9ca3af'}
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * @param {{
 *   project: {
 *     id: string
 *     title: string
 *     bannerSrc?: string | null
 *     tags: Array<{ label: string, kind: 'category' | 'tech', tint?: string }>
 *     deployedUrl: string
 *     ownerPhotoURL?: string
 *     likes?: number
 *     likedByUser?: boolean
 *     savedByUser?: boolean
 *   }
 * }} props
 */
export function ProjectCard911198({ project }) {
  const { toggleLike, toggleSaved } = useProjects()

  const {
    id,
    title,
    bannerSrc: listBannerSrc,
    tags = [],
    deployedUrl = '#',
    ownerPhotoURL = ASSET.avatar,
    likes = 0,
    likedByUser = false,
    savedByUser = false,
  } = project

  const { src: bannerSrc, cardRef } = useLazyBanner(
    id,
    listBannerSrc || ASSET.preview,
  )

  const canOpen =
    Boolean(deployedUrl) &&
    deployedUrl !== '#' &&
    /^https?:\/\//i.test(deployedUrl)

  const avatarSrc = ownerPhotoURL || ASSET.avatar

  return (
    <article ref={cardRef} className="pc-911198" data-node-id="91:1450" data-name="Card">
      <div className="pc-911198__bg" aria-hidden>
        <img className="pc-911198__bg-img" src={ASSET.bgVector} alt="" />
      </div>

      {/* Owner avatar — top-right, shows who added the project */}
      <div className="pc-911198__avatar">
        <img src={avatarSrc} alt="" width={24} height={24} referrerPolicy="no-referrer" />
      </div>

      <div className="pc-911198__preview" aria-label="Project preview">
        <img className="pc-911198__preview-img" src={bannerSrc} alt="" />
      </div>

      <div className="pc-911198__content">
        <div className="pc-911198__title-row">
          <h3 className="pc-911198__title">{title}</h3>

          <div className="pc-911198__meta-icons">
            <button
              type="button"
              className={[
                'pc-911198__meta-btn',
                likedByUser ? 'pc-911198__meta-btn--lit' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label={likedByUser ? `Unlike (${likes})` : `Like (${likes})`}
              aria-pressed={likedByUser}
              onClick={() => toggleLike(id)}
            >
              <FlameIcon liked={likedByUser} />
            </button>

            {/* Bookmark / save */}
            <button
              type="button"
              className={[
                'pc-911198__meta-btn',
                savedByUser ? 'pc-911198__meta-btn--saved' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label={savedByUser ? 'Remove from saved' : 'Save project'}
              aria-pressed={savedByUser}
              onClick={() => toggleSaved(id)}
            >
              <BookmarkIcon saved={savedByUser} />
            </button>
          </div>
        </div>

        <div className="pc-911198__tags" aria-label="Tags">
          {tags.map((tag, i) => {
            const kind = tag.kind === 'category' ? 'category' : 'tech'
            const cls = ['pc-911198__tag']
            if (kind === 'category') cls.push('pc-911198__tag--category')
            else {
              cls.push('pc-911198__tag--dash')
              cls.push(
                `pc-911198__tag--${
                  tag.tint === 'yellow' || tag.tint === 'green'
                    ? tag.tint
                    : 'aqua'
                }`,
              )
            }
            return (
              <span key={`${tag.label}-${i}`} className={cls.join(' ')}>
                {tag.label}
              </span>
            )
          })}
        </div>

        {canOpen ? (
          <a
            className="pc-911198__cta"
            href={deployedUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="pc-911198__cta-label">VIEW PROJECT</span>
            <span className="pc-911198__cta-ico" aria-hidden>
              <img src={ASSET.buttonArrow} alt="" />
            </span>
          </a>
        ) : (
          <span
            className="pc-911198__cta pc-911198__cta--disabled"
            aria-disabled="true"
            title="Add a deployed link when creating this project"
          >
            <span className="pc-911198__cta-label">VIEW PROJECT</span>
            <span className="pc-911198__cta-ico" aria-hidden>
              <img src={ASSET.buttonArrow} alt="" />
            </span>
          </span>
        )}
      </div>
    </article>
  )
}
