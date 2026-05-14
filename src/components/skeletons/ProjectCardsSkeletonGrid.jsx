import './skeleton-base.css'
import './ProjectCardsSkeletonGrid.css'

/**
 * Matches Explore / Profile `.project-cards` + `.project-cards__slot` sizing.
 *
 * @param {{
 *   count?: number
 *   className?: string
 *   id?: string
 *   'aria-labelledby'?: string
 * }} props
 */
export function ProjectCardsSkeletonGrid({
  count = 6,
  className = '',
  id,
  'aria-labelledby': ariaLabelledby,
}) {
  const slots = Array.from({ length: count }, (_, i) => i)

  return (
    <div
      id={id}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading projects"
      aria-labelledby={ariaLabelledby}
      className={['project-cards', 'project-cards--skeleton', className].filter(Boolean).join(' ')}
    >
      {slots.map((key) => (
        <div key={key} className="project-cards__slot">
          <div className="project-card-skeleton" aria-hidden>
            <div className="project-card-skeleton__preview skeleton-block" />
            <div className="project-card-skeleton__footer">
              <span className="project-card-skeleton__corner skeleton-block" />
              <div className="project-card-skeleton__title skeleton-block" />
              <div className="project-card-skeleton__pills">
                <span className="project-card-skeleton__pill skeleton-block" />
                <span className="project-card-skeleton__pill skeleton-block" />
                <span className="project-card-skeleton__pill skeleton-block" />
              </div>
              <div className="project-card-skeleton__meta">
                <span className="project-card-skeleton__chip skeleton-block" />
                <span className="project-card-skeleton__btn skeleton-block" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
