import { useEffect, useId, useRef } from "react";

// Diálogo modal com o <dialog> do navegador: ele já prende o foco dentro, fecha com Esc
// e devolve o foco a quem abriu. initialFocus: ref do elemento que recebe o foco ao abrir.
export default function Dialog({ open, title, children, actions, onClose, initialFocus, className = "" }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) {
      dialog.showModal();
      initialFocus?.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, initialFocus]);

  return (
    <dialog
      ref={ref}
      className={`dialog ${className}`}
      aria-labelledby={titleId}
      onClose={onClose}
      // clique no fundo escuro (fora da caixa) fecha
      onClick={(event) => event.target === ref.current && onClose()}
    >
      <div className="dialog__box">
        <h2 id={titleId} className="dialog__title">
          {title}
        </h2>
        <div className="dialog__body">{children}</div>
        <div className="dialog__actions">{actions}</div>
      </div>
    </dialog>
  );
}
