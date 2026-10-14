import { useEffect, useId, useRef, useState } from "react";

// Botão ("⋯" por padrão, ou o ícone passado em icon) que abre uma lista de ações. Fecha com Esc (foco volta ao botão),
// clique fora, foco saindo da lista ou ao escolher uma ação.
export default function MenuButton({ label, items, icon, className = "" }) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef(null);
  const button = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function onKey(event) {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    }
    function onOutside(event) {
      if (!wrapper.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onOutside);
    document.addEventListener("focusin", onOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onOutside);
      document.removeEventListener("focusin", onOutside);
    };
  }, [open]);

  return (
    <div className={`menu ${className}`} ref={wrapper}>
      <button
        ref={button}
        type="button"
        className="menu__button"
        aria-label={label}
        title={label}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        {icon || (
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
            <circle cx="5" cy="12" r="1.75" />
            <circle cx="12" cy="12" r="1.75" />
            <circle cx="19" cy="12" r="1.75" />
          </svg>
        )}
      </button>
      {open && (
        <div id={menuId} className="menu__list">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`menu__item${item.danger ? " menu__item--danger" : ""}`}
              onClick={() => {
                setOpen(false);
                // o foco volta ao "⋯" antes da ação: um diálogo aberto daqui devolve o foco a ele
                button.current?.focus();
                item.onSelect();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
