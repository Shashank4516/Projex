export function AuthInstantDivider({ label }) {
  return (
    <div className="auth-dash-divider" role="separator" aria-label={label}>
      <span className="auth-dash-divider__line" aria-hidden />
      <span className="auth-dash-divider__text">{label}</span>
      <span className="auth-dash-divider__line" aria-hidden />
    </div>
  )
}
