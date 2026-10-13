import { navigate } from "../router";

// link de verdade (abre em nova aba com Ctrl/Cmd, aparece no rodapé do navegador),
// mas a navegação normal acontece sem recarregar a página
export function Link({ to, onClick, children, ...props }) {
  function handleClick(event) {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    navigate(to);
  }

  return (
    <a href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
