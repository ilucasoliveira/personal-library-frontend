export default function BookCard({
title,
author,
coverColor = "var(--color-primary)",
coverUrl = null,
rating = 0,
favorite = false,
status = "reading", // "toRead" | "reading" | "read"
onClick,
}) {
const statusIcon = {
    toRead: "🌙",
    reading: "🌗",
    read: "🌕",
}[status];

return (
    <div onClick={onClick} className="book-card" style={{ background: "var(--color-card)", borderRadius: "var(--radius-md)", overflow: "hidden", boxShadow: "var(--shadow-card)", width: "100%", fontFamily: "var(--font-ui)", cursor: "pointer" }}>        <div style={{ background: coverUrl ? "none" : coverColor, height: "220px", position: "relative" }}>
            {coverUrl && (
                <img src={coverUrl} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            )}
            <div style={{ position: "absolute", top: "8px", left: "8px", width: "22px", height: "22px", borderRadius: "50%", background: "rgba(20,21,43,0.7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>
                {statusIcon}
            </div>
            <div style={{ position: "absolute", top: "8px", right: "8px", fontSize: "16px", color: favorite ? "var(--color-favorite)" : "rgba(255,255,255,0.7)" }}>
                    {favorite ? "♥" : "♡"}
            </div>
        </div>
            <div style={{ padding: "var(--space-3)" }}>
                <p style={{ margin: 0, color: "var(--color-text-primary)", fontSize: "var(--text-small)", fontWeight: "var(--font-weight-semibold)" }}>{title}</p>
                <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: "var(--text-caption)" }}>{author}</p>
                <div style={{ marginTop: "6px", display: "flex", gap: "2px" }}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} style={{ fontSize: "12px", color: i <= rating ? "var(--color-star-filled)" : "var(--color-star-empty)" }}>★</span>
                ))}
            </div>
        </div>
    </div>
    );
}