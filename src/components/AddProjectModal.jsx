import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useProjects } from '../context/ProjectsContext'
import { useAuth } from '../context/AuthContext'
import './AddProjectModal.css'

const TECH_TINTS = /** @type {const} */ (['aqua', 'yellow', 'green'])

const BANNER_W = 295.78
const BANNER_H = 196.98

function normalizeDeployedUrl(raw) {
  const t = raw.trim()
  if (!t || t === '#') return ''
  try {
    if (/^https?:\/\//i.test(t)) return new URL(t).href
    return new URL(`https://${t}`).href
  } catch {
    return ''
  }
}

async function probeDeployUrlExists(canon, { signal } = {}) {
  const q = new URLSearchParams({ url: canon, _: String(Date.now()) })
  const res = await fetch(`/api/projects/deploy-url-exists?${q}`, {
    signal,
    cache: 'no-store',
  })
  if (!res.ok) {
    const err = new Error(`deploy-url probe failed: ${res.status}`)
    err.name = 'DeployProbeError'
    throw err
  }
  const data = await res.json()
  return data.exists === true
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(r.error)
    r.readAsDataURL(file)
  })
}

export function AddProjectModal() {
  const { modalOpen, setModalOpen, addProject } = useProjects()
  const { user } = useAuth()
  const titleId = useId()
  const linkId = useId()
  const tagInputId = useId()
  const panelRef = useRef(null)

  const [title, setTitle] = useState('')
  const [deployedRaw, setDeployedRaw] = useState('')
  const [bannerDataUrl, setBannerDataUrl] = useState('')
  const [tagDraft, setTagDraft] = useState('')
  const [tagKind, setTagKind] = useState(
    /** @type {'category' | 'tech'} */ ('tech'),
  )
  const [tags, setTags] = useState([])
  const [deployUrlExists, setDeployUrlExists] = useState(false)
  const [deployUrlChecking, setDeployUrlChecking] = useState(false)
  const [deployUrlProbeError, setDeployUrlProbeError] = useState(null)

  const resetForm = useCallback(() => {
    setTitle('')
    setDeployedRaw('')
    setBannerDataUrl('')
    setTagDraft('')
    setTagKind('tech')
    setTags([])
    setDeployUrlExists(false)
    setDeployUrlChecking(false)
    setDeployUrlProbeError(null)
  }, [])

  const closeModal = useCallback(() => {
    resetForm()
    setModalOpen(false)
  }, [resetForm, setModalOpen])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && modalOpen) closeModal()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modalOpen, closeModal])

  useEffect(() => {
    if (!modalOpen) {
      queueMicrotask(() => {
        setDeployUrlExists(false)
        setDeployUrlChecking(false)
        setDeployUrlProbeError(null)
      })
      return
    }
    const canon = normalizeDeployedUrl(deployedRaw)
    if (!canon) {
      queueMicrotask(() => {
        setDeployUrlExists(false)
        setDeployUrlChecking(false)
        setDeployUrlProbeError(null)
      })
      return
    }
    const ac = new AbortController()
    const timer = window.setTimeout(async () => {
      setDeployUrlChecking(true)
      setDeployUrlProbeError(null)
      try {
        const exists = await probeDeployUrlExists(canon, { signal: ac.signal })
        if (!ac.signal.aborted) {
          setDeployUrlExists(exists)
          setDeployUrlProbeError(null)
        }
      } catch (e) {
        if (ac.signal.aborted || e?.name === 'AbortError') return
        if (!ac.signal.aborted) {
          setDeployUrlExists(false)
          setDeployUrlProbeError(
            'Could not verify this link. Is the API running on port 3001?',
          )
        }
      } finally {
        if (!ac.signal.aborted) setDeployUrlChecking(false)
      }
    }, 420)
    return () => {
      window.clearTimeout(timer)
      ac.abort()
    }
  }, [deployedRaw, modalOpen])

  useEffect(() => {
    if (!modalOpen) return
    const root = panelRef.current
    const ae = /** @type {HTMLElement | undefined} */ (root?.querySelector?.(
      '[data-modal-first-focus]',
    ))
    ae?.focus?.()
  }, [modalOpen])

  function addTag() {
    const label = tagDraft.trim()
    if (!label) return
    setTags((prev) => {
      const nextTint =
        tagKind === 'tech'
          ? TECH_TINTS[prev.filter((x) => x.kind === 'tech').length %
              TECH_TINTS.length]
          : undefined
      return [...prev, { label, kind: tagKind, ...(nextTint ? { tint: nextTint } : {}) }]
    })
    setTagDraft('')
  }

  async function onBannerChange(e) {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    try {
      const dataUrl = await readFileAsDataURL(file)
      setBannerDataUrl(dataUrl)
    } catch {
      setBannerDataUrl('')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const t = title.trim()
    if (!t) return
    const deployed = normalizeDeployedUrl(deployedRaw)
    if (!bannerDataUrl) return

    setDeployUrlProbeError(null)
    if (deployed) {
      try {
        const exists = await probeDeployUrlExists(deployed)
        if (exists) {
          setDeployUrlExists(true)
          return
        }
        setDeployUrlExists(false)
      } catch {
        window.alert(
          'Could not verify the deploy link against the server. Try again.',
        )
        return
      }
    } else {
      setDeployUrlExists(false)
    }

    try {
      await addProject({
        title: t,
        tags,
        bannerSrc: bannerDataUrl,
        deployedUrl: deployed || '#',
        ownerPhotoURL: user?.photoURL || '',
      })
      resetForm()
    } catch (err) {
      console.error(err)
      window.alert(
        err instanceof Error
          ? err.message
          : 'Could not save the project. Make sure the dev server is running (API + Vite).',
      )
    }
  }

  if (!modalOpen) return null

  return (
    <div
      className="add-project-overlay"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeModal()
      }}
    >
      <div
        ref={panelRef}
        className="add-project-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="add-project-modal__head">
          <h2 className="add-project-modal__title" id={titleId}>
            New project
          </h2>
          <button
            type="button"
            className="add-project-modal__close"
            aria-label="Close"
            onClick={closeModal}
          >
            ×
          </button>
        </div>

        <form className="add-project-form" onSubmit={handleSubmit}>
          <label className="add-project-field" htmlFor={`${titleId}-input`}>
            <span className="add-project-field__label">Project title</span>
            <input
              id={`${titleId}-input`}
              data-modal-first-focus
              className="add-project-field__control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Bardimin Smart Lamp..."
              autoComplete="off"
              required
            />
          </label>

          <div className="add-project-field">
            <span className="add-project-field__label">Banner</span>
            <p className="add-project-banner__hint">
              Preview size {BANNER_W} × {BANNER_H}px (recommended)
            </p>
            <div
              className="add-project-banner"
              style={{ width: BANNER_W, height: BANNER_H }}
            >
              {bannerDataUrl ? (
                <img
                  className="add-project-banner__img"
                  src={bannerDataUrl}
                  alt="Banner preview"
                />
              ) : (
                <span className="add-project-banner__empty">
                  No image chosen
                </span>
              )}
            </div>
            <label className="add-project-banner__file">
              <input
                type="file"
                accept="image/*"
                className="add-project-visually-hidden"
                onChange={onBannerChange}
              />
              <span className="add-project-chip-btn">Choose image</span>
            </label>
          </div>

          <label className="add-project-field" htmlFor={linkId}>
            <span className="add-project-field__label">Deployed link</span>
            <input
              id={linkId}
              type="text"
              className={[
                'add-project-field__control',
                deployUrlExists || deployUrlProbeError
                  ? 'add-project-field__control--invalid'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
              value={deployedRaw}
              onChange={(e) => setDeployedRaw(e.target.value)}
              placeholder="https://your-project.com"
              autoComplete="url"
              inputMode="url"
              aria-invalid={deployUrlExists}
              aria-describedby={
                deployUrlExists
                  ? `${linkId}-help ${linkId}-error`
                  : `${linkId}-help`
              }
            />
            {deployUrlExists ? (
              <span
                id={`${linkId}-error`}
                className="add-project-field__error"
                role="alert"
              >
                This project already exists
              </span>
            ) : null}
            {deployUrlProbeError ? (
              <span className="add-project-field__error" role="alert">
                {deployUrlProbeError}
              </span>
            ) : null}
            <span className="add-project-field__help" id={`${linkId}-help`}>
              {deployUrlChecking &&
                'Checking whether this link is already registered…'}
              {/* “View project” opens this URL in a new tab. */}
            </span>
          </label>

          <div className="add-project-field add-project-tags">
            <span className="add-project-field__label">Tags</span>
            <p className="add-project-tags__explain">
              <strong>Category</strong>: white pill, solid border.{' '}
              <strong>Technology</strong>: pastel pill, dashed border.
            </p>
            <div className="add-project-tags__builder">
              <div className="add-project-tags__toggle" role="group" aria-label="Tag type">
                <button
                  type="button"
                  className={
                    tagKind === 'category'
                      ? 'add-project-seg add-project-seg--active'
                      : 'add-project-seg'
                  }
                  onClick={() => setTagKind('category')}
                >
                  Category
                </button>
                <button
                  type="button"
                  className={
                    tagKind === 'tech'
                      ? 'add-project-seg add-project-seg--active'
                      : 'add-project-seg'
                  }
                  onClick={() => setTagKind('tech')}
                >
                  Technology
                </button>
              </div>
              <div className="add-project-tags__row">
                <input
                  id={tagInputId}
                  className="add-project-field__control add-project-field__control--inline"
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  placeholder={
                    tagKind === 'tech' ? 'e.g. React' : 'e.g. Fintech'
                  }
                />
                <button
                  type="button"
                  className="add-project-chip-btn"
                  onClick={addTag}
                >
                  Add
                </button>
              </div>
            </div>
            {tags.length > 0 ? (
              <ul className="add-project-tags__list" aria-label="Added tags">
                {tags.map((tag, i) => (
                  <li key={`${tag.label}-${i}`}>
                    <span
                      className={[
                        'add-project-pill',
                        tag.kind === 'tech'
                          ? `add-project-pill--dash add-project-pill--${tag.tint ?? 'aqua'}`
                          : 'add-project-pill--category',
                      ].join(' ')}
                    >
                      {tag.label}
                    </span>
                    <button
                      type="button"
                      className="add-project-tag-remove"
                      aria-label={`Remove ${tag.label}`}
                      onClick={() =>
                        setTags((prev) => prev.filter((_, j) => j !== i))
                      }
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="add-project-actions">
            <button
              type="button"
              className="add-project-btn add-project-btn--ghost"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="add-project-btn add-project-btn--primary"
              disabled={!title.trim() || !bannerDataUrl || deployUrlExists}
            >
              Add project
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
