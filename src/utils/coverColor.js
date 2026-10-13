const PALETTE = [
  "var(--color-primary)",
  "var(--color-secondary)",
  "var(--color-accent)",
  "var(--color-favorite)",
  "var(--color-card-hover)",
];

const GENDER_PALETTE = [
  { bg: "color-mix(in srgb, var(--color-secondary) 16%, transparent)", text: "var(--color-secondary)" },
  { bg: "color-mix(in srgb, var(--color-primary) 16%, transparent)", text: "var(--color-primary)" },
  { bg: "color-mix(in srgb, var(--color-accent) 16%, transparent)", text: "var(--color-accent)" },
  { bg: "color-mix(in srgb, var(--color-favorite) 16%, transparent)", text: "var(--color-favorite)" },
  { bg: "color-mix(in srgb, var(--color-success) 16%, transparent)", text: "var(--color-success)" },
  { bg: "color-mix(in srgb, var(--color-error) 16%, transparent)", text: "var(--color-error)" },
  { bg: "color-mix(in srgb, var(--color-warning) 16%, transparent)", text: "var(--color-warning)" },
];

export function getGenderColor(gender) {
  let hash = 0;
  for (let i = 0; i < gender.length; i++) {
    hash = gender.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GENDER_PALETTE.length;
  return GENDER_PALETTE[index];
}

export function getCoverColor(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
}
