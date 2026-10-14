// avisos rápidos na tela (toast) disparados de qualquer página.
// action (opcional): { label, to } vira um link ("Ver livro"); { label, onClick } vira um botão ("Desfazer").
// duration (opcional): quanto tempo o aviso fica na tela, em ms.
const EVENT = "app:notify";

export function notify(message, type = "error", action = null, duration = 0) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { message, type, action, duration } }));
}

export function onNotify(handler) {
  const listener = (event) => handler(event.detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
