// Rotas com o histórico do navegador, sem biblioteca: são poucas telas.
// navigate() troca a URL e avisa quem usa useRoute(); o Voltar do navegador
// dispara popstate e faz o mesmo.
import { useSyncExternalStore } from "react";

const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener());
}

window.addEventListener("popstate", emit);

// a rolagem é controlada pelo App (topo em cada tela, estante volta ao ponto)
if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

function currentHref() {
  return window.location.pathname + window.location.search;
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function navigate(to, { replace = false } = {}) {
  if (to === currentHref()) return;
  // marca as entradas criadas pelo app, para o "Voltar" interno saber se pode voltar
  window.history[replace ? "replaceState" : "pushState"]({ app: true }, "", to);
  emit();
}

// volta uma página se ela for do app; se a pessoa chegou por link direto, vai para o fallback
export function goBack(fallback = "/") {
  if (window.history.state?.app) {
    window.history.back();
  } else {
    navigate(fallback, { replace: true });
  }
}

export function matchRoute(path) {
  const clean = path.replace(/\/+$/, "") || "/";
  if (clean === "/") return { name: "library" };
  const book = clean.match(/^\/livro\/(\d+)$/);
  if (book) return { name: "book", id: Number(book[1]) };
  if (clean === "/adicionar") return { name: "add" };
  if (clean === "/adicionar/manual") return { name: "addManual" };
  if (clean === "/perfil") return { name: "profile" };
  if (clean === "/configuracoes") return { name: "settings" };
  return { name: "notFound" };
}

export function useRoute() {
  const href = useSyncExternalStore(subscribe, currentHref);
  const url = new URL(href, window.location.origin);
  return { ...matchRoute(url.pathname), href, query: url.searchParams };
}
