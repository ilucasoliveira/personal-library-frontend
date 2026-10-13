// avisos rápidos na tela (toast) disparados de qualquer página
const EVENT = "app:notify";

export function notify(message, type = "error") {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { message, type } }));
}

export function onNotify(handler) {
  const listener = (event) => handler(event.detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
