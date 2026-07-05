export default function BookResultCard({ book, onAdd }) {
return (
    <div style={{ display: "flex", gap: "12px", background: "var(--color-card)", borderRadius: "var(--radius-md)", padding: "10px", marginBottom: "10px", alignItems: "center" }}>
        <div style={{ width: "48px", height: "68px", background: "var(--color-card-hover)", borderRadius: "6px", overflow: "hidden", flexShrink: 0 }}>
            {book.cover && <img src={book.cover} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
        </div>
        <div style={{ flex: 1, fontFamily: "var(--font-ui)" }}>
            <p style={{ margin: 0, color: "var(--color-text-primary)", fontSize: "var(--text-small)", fontWeight: "var(--font-weight-semibold)" }}>{book.title}</p>
            <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: "var(--text-caption)" }}>{book.author} {book.year && `· ${book.year}`}</p>
            <button onClick={() => onAdd(book)} style={{ marginTop: "6px", background: "var(--color-primary)", color: "#241119", border: "none", borderRadius: "var(--radius-sm)", padding: "5px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
            Adicionar
            </button>
        </div>
    </div>
);
}