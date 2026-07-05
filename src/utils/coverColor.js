const PALETTE = [
"var(--color-primary)",
"var(--color-secondary)",
"var(--color-accent)",
"var(--color-favorite)",
"var(--color-card-hover)",
];

export function getCoverColor(seed) {
let hash = 0;
for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
}
const index = Math.abs(hash) % PALETTE.length;
return PALETTE[index];
}