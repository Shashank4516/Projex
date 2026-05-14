import './skeleton-base.css'
import './LeaderboardTableSkeleton.css'

/**
 * Skeleton rows matching `.lb-table__row` grid (initial load only).
 *
 * @param {{ rows?: number }} props
 */
export function LeaderboardTableSkeleton({ rows = 8 }) {
  const keys = Array.from({ length: rows }, (_, i) => i)

  return keys.map((k) => (
    <div key={k} className="lb-table__row lb-table__row--skeleton" aria-hidden>
      <span className="lb-table-skeleton__rank skeleton-block" />
      <span className="lb-table-skeleton__name">
        <span className="lb-table-skeleton__avatar skeleton-block" />
        <span className="lb-table-skeleton__name-bar skeleton-block" />
      </span>
      <span className="lb-table-skeleton__cell skeleton-block" />
      <span className="lb-table-skeleton__cell skeleton-block" />
      <span className="lb-table-skeleton__cell skeleton-block" />
      <span className="lb-table-skeleton__aura skeleton-block" />
      <span className="lb-table-skeleton__actions skeleton-block" />
    </div>
  ))
}
