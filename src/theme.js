// Aparência: tema (paleta inteira) + cor de destaque opcional.
// O tema vira data-theme no <html> (as cores estão no index.css) e a cor de
// destaque sobrescreve --color-primary. Tudo fica salvo no navegador para a
// tela não piscar com o tema padrão antes de a conta carregar.

export const THEMES = [
  { id: "twilight", preview: ["#14152b", "#20223f", "#d88c9a", "#e8c468"] },
  { id: "paper", preview: ["#f6f2eb", "#ffffff", "#b5536a", "#d9a521"] },
  { id: "sepia", preview: ["#211a14", "#2e241b", "#d99a5b", "#e8c468"] },
  { id: "forest", preview: ["#111a15", "#1a271f", "#7cc49a", "#e8c468"] },
];

export const ACCENTS = ["#d88c9a", "#e2617a", "#e07a5f", "#e8c468", "#7cc49a", "#2a9d8f", "#7c93c3", "#b48ead"];

const DEFAULT = { theme: "twilight", accent: null };
const STORAGE_KEY = "appearance";

// texto escuro em cores claras e texto branco em cores escuras (luminância relativa)
export function textColorOn(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.36 ? "#1d1820" : "#ffffff";
}

export function readSavedAppearance() {
  try {
    return { ...DEFAULT, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
  } catch {
    return DEFAULT;
  }
}

export function applyAppearance({ theme, accent } = DEFAULT) {
  const root = document.documentElement;
  const themeId = THEMES.some((item) => item.id === theme) ? theme : "twilight";
  root.dataset.theme = themeId;

  if (accent) {
    root.style.setProperty("--color-primary", accent);
    root.style.setProperty("--color-on-primary", textColorOn(accent));
  } else {
    root.style.removeProperty("--color-primary");
    root.style.removeProperty("--color-on-primary");
  }

  // cor da barra do navegador no celular (PWA)
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", THEMES.find((item) => item.id === themeId).preview[0]);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme: themeId, accent: accent || null }));
  } catch {
    // sem localStorage a aparência vale só nesta aba
  }
}
