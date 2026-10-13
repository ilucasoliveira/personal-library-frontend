// Botão do design system. variant: primary | secondary | text | danger.
// busy: troca o texto pelo verbo no gerúndio ("Salvando...") e desabilita.
export default function Button({
  variant = "primary",
  busy = false,
  busyText,
  className = "",
  children,
  disabled,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`btn btn--${variant} ${className}`}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      {...props}
    >
      {busy && busyText ? busyText : children}
    </button>
  );
}
