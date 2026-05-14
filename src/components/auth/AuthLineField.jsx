export function AuthLineField({ label, id, icon, inputRef, ...inputProps }) {
  return (
    <div className="auth-line-field">
      <label className="auth-line-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="auth-line-field__track">
        <input
          id={id}
          ref={inputRef}
          className="auth-line-field__input"
          {...inputProps}
        />
        <span className="auth-line-field__icon" aria-hidden>
          {icon}
        </span>
      </div>
    </div>
  )
}
