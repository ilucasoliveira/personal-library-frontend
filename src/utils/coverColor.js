const PALETTE = [
"var(--color-primary)",
"var(--color-secondary)",
"var(--color-accent)",
"var(--color-favorite)",
"var(--color-card-hover)",
];

const GENDER_PALETTE = [
    { bg: "rgba(124,147,195,0.15)", text: "var(--color-secondary)" },
    { bg: "rgba(216,140,154,0.15)", text: "var(--color-primary)" },
    { bg: "rgba(232,196,104,0.15)", text: "var(--color-accent)" },
    { bg: "rgba(226,97,122,0.15)", text: "var(--color-favorite)" },
    { bg: "rgba(127,184,143,0.15)", text: "var(--color-success)" },
    { bg: "rgba(217,112,102,0.15)", text: "var(--color-error)" },
    { bg: "rgba(230,182,85,0.15)", text: "var(--color-warning)" },
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