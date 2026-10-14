// Nota de 0.25 a 5, de 0.25 em 0.25 (um quarto de estrela).
export const STEP = 0.25;
export const MIN = STEP;
export const MAX = 5;

// arredonda para o quarto mais próximo e prende entre 0.25 e 5
export function clampRating(value) {
  const snapped = Math.round(value / STEP) * STEP;
  return Math.min(MAX, Math.max(MIN, snapped));
}

// quanto de cada uma das 5 estrelas fica pintado: 3.75 vira [1, 1, 1, 0.75, 0]
export function starFills(rating) {
  return [0, 1, 2, 3, 4].map((i) => Math.min(1, Math.max(0, (rating || 0) - i)));
}

// 3.75 vira "3,75" em português e "3.75" em inglês; 4 vira "4"
export function formatRating(rating, lang) {
  if (!rating) return "";
  return rating.toLocaleString(lang === "pt" ? "pt-BR" : "en", { maximumFractionDigits: 2 });
}
