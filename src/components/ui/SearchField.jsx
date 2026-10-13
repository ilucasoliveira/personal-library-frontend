// Campo de busca com lupa; Esc limpa
export default function SearchField({ id, label, value, onChange, placeholder, className = "" }) {
  return (
    <div className={`search-field ${className}`}>
      <svg
        className="search-field__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </svg>
      <input
        id={id}
        type="search"
        className="field-input search-field__input"
        value={value}
        placeholder={placeholder}
        aria-label={label}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && value) {
            e.preventDefault();
            onChange("");
          }
        }}
      />
    </div>
  );
}
