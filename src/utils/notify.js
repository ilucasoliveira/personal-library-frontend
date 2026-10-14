// avisos rápidos na tela (toast) disparados de qualquer página.
// action (opcional): { label, to } vira um link no aviso, ex.: "Ver livro".
const EVENT = "app:notify";

export function notify(message, type = "error", action = null) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { message, type, action } }));
}

export function onNotify(handler) {
  const listener = (event) => handler(event.detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
