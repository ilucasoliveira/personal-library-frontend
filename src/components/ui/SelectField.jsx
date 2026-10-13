// Seletor com rótulo visível (o rótulo fica ao lado no desktop e acima no celular)
export default function SelectField({ id, label, value, onChange, options, className = "" }) {
  return (
    <div className={`select-field ${className}`}>
      <label htmlFor={id} className="select-field__label">
        {label}
      </label>
      <select id={id} className="select" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
