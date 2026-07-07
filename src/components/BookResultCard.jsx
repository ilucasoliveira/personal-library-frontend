export default function BookResultCard({ book, onAdd }) {
  return (
    <div
      style={{
        background: "var(--color-card)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        boxShadow: "var(--shadow-card)",
        width: "100%",
        fontFamily: "var(--font-ui)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        style={{
          background: book.cover ? "none" : "var(--color-card-hover)",
          height: "220px",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {book.cover && (
          <img
            src={book.cover}
            alt={book.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
      </div>
      <div
        style={{
          padding: "var(--space-3)",
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        <p
          style={{
            margin: 0,
            color: "var(--color-text-primary)",
            fontSize: "var(--text-small)",
            fontWeight: "var(--font-weight-semibold)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: "1.3em",
          }}
        >
          {book.title}
        </p>
        <p
          style={{
            margin: "4px 0 0",
            color: "var(--color-text-muted)",
            fontSize: "var(--text-caption)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {book.author}
          {book.year ? ` · ${book.year}` : ""}
        </p>

        <div style={{ marginTop: "auto", paddingTop: "10px" }}>
          <button
            onClick={() => onAdd(book)}
            style={{
              width: "100%",
              background: "var(--color-primary)",
              color: "#241119",
              border: "none",
              borderRadius: "var(--radius-sm)",
              padding: "8px 12px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
