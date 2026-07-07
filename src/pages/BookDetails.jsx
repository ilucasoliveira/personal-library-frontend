import { useState } from "react";
import { updateBook, deleteBook } from "../services/api";
import { getGenderColor } from "../utils/coverColor";

export default function BookDetails({ book, onBack, onUpdated, onDeleted }) {
  const [rating, setRating] = useState(book.grade || 0);
  const [favorite, setFavorite] = useState(book.favorite);
  const [comment, setComment] = useState(book.comment || "");
  const [editing, setEditing] = useState(false);
  const [heartPulsing, setHeartPulsing] = useState(false);
  const [form, setForm] = useState({
    title: book.title,
    author: book.author,
    gender: book.gender,
    synopsis: book.synopsis || "",
    cover_url: book.cover_url || "",
  });

  async function handleRate(newRating) {
    setRating(newRating);
    const updated = await updateBook(book.id, { grade: newRating });
    onUpdated(updated);
  }

  async function handleFavorite() {
    const newValue = !favorite;
    setFavorite(newValue);
    setHeartPulsing(true);
    setTimeout(() => setHeartPulsing(false), 300);
    const updated = await updateBook(book.id, { favorite: newValue });
    onUpdated(updated);
  }

  async function handleCommentBlur() {
    const updated = await updateBook(book.id, { comment });
    onUpdated(updated);
  }

  async function handleStatusChange(newStatus) {
    const updated = await updateBook(book.id, { reading_status: newStatus });
    onUpdated(updated);
  }

  async function handleSaveEdit() {
    const updated = await updateBook(book.id, form);
    onUpdated(updated);
    setEditing(false);
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Tem certeza que quer excluir "${book.title}"? Essa ação não pode ser desfeita.`,
    );
    if (!confirmed) return;

    await deleteBook(book.id);
    onDeleted(book.id);
  }

  const inputStyle = {
    width: "100%",
    background: "var(--color-card)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-sm)",
    padding: "8px 12px",
    color: "var(--color-text-primary)",
    fontFamily: "var(--font-ui)",
    marginBottom: "10px",
  };

  return (
    <div
      className="page-padding"
      style={{
        background: "var(--color-background)",
        minHeight: "100vh",
        fontFamily: "var(--font-ui)",
      }}
    >
      <button
        onClick={onBack}
        style={{
          marginBottom: "20px",
          background: "none",
          border: "none",
          color: "var(--color-text-secondary)",
          cursor: "pointer",
        }}
      >
        ← Voltar
      </button>

      <div className="details-layout">
        <div
          className="details-cover"
          style={{
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            background: "var(--color-card)",
          }}
        >
          {book.cover_url && (
            <img
              src={book.cover_url}
              alt={book.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
        </div>

        <div style={{ flex: 1 }}>
          {editing ? (
            <>
              <input
                style={{
                  ...inputStyle,
                  fontFamily: "var(--font-display)",
                  fontSize: "20px",
                }}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Título:"
              />
              <input
                style={inputStyle}
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                placeholder="Autor:"
              />
              <input
                style={inputStyle}
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                placeholder="Genêro:"
              />
              <input
                style={inputStyle}
                value={form.cover_url}
                onChange={(e) =>
                  setForm({ ...form, cover_url: e.target.value })
                }
                placeholder="URL da capa (https://...)"
              />
              <textarea
                style={{ ...inputStyle, fontFamily: "var(--font-reading)" }}
                rows={5}
                value={form.synopsis}
                onChange={(e) => setForm({ ...form, synopsis: e.target.value })}
                placeholder="Sinopse:"
              />
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={handleSaveEdit}
                  style={{
                    background: "var(--color-primary)",
                    color: "#241119",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    padding: "8px 16px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Salvar
                </button>
                <button
                  onClick={() => setEditing(false)}
                  style={{
                    background: "none",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-secondary)",
                    borderRadius: "var(--radius-sm)",
                    padding: "8px 16px",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <h1
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--color-text-primary)",
                    margin: 0,
                    fontSize: "28px",
                  }}
                >
                  {book.title}
                </h1>
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-text-muted)",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  ✎
                </button>
              </div>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  margin: "4px 0 12px",
                }}
              >
                {book.author}
              </p>

              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  padding: "5px 12px",
                  borderRadius: "var(--radius-pill)",
                  background: getGenderColor(book.gender).bg,
                  color: getGenderColor(book.gender).text,
                }}
              >
                {book.gender}
              </span>

              {book.synopsis && (
                <p
                  style={{
                    fontFamily: "var(--font-reading)",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.6,
                    marginTop: "20px",
                  }}
                >
                  {book.synopsis}
                </p>
              )}
            </>
          )}

          <div style={{ margin: "16px 0" }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className="star-item"
                onClick={() => handleRate(i)}
                style={{
                  cursor: "pointer",
                  fontSize: "22px",
                  color:
                    i <= rating
                      ? "var(--color-star-filled)"
                      : "var(--color-star-empty)",
                }}
              >
                ★
              </span>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              gap: "8px",
              margin: "16px 0",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {[
              { key: "toRead", label: "🌙 Quero ler" },
              { key: "reading", label: "🌗 Lendo agora" },
              { key: "read", label: "🌕 Lido" },
            ].map((opt) => (
              <button
                key={opt.key}
                className="status-pill"
                onClick={() => handleStatusChange(opt.key)}
                style={{
                  background:
                    book.reading_status === opt.key
                      ? "var(--color-primary)"
                      : "var(--color-card)",
                  color:
                    book.reading_status === opt.key
                      ? "#241119"
                      : "var(--color-text-secondary)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-pill)",
                  padding: "6px 12px",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                {opt.label}
              </button>
            ))}

            <button
              onClick={handleFavorite}
              className={heartPulsing ? "heart-pulse" : ""}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "26px",
                color: favorite
                  ? "var(--color-favorite)"
                  : "var(--color-text-muted)",
                marginLeft: "4px",
              }}
            >
              {favorite ? "♥" : "♡"}
            </button>
          </div>

          <div style={{ marginTop: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                color: "var(--color-text-secondary)",
                marginBottom: "6px",
              }}
            >
              Seu comentário
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onBlur={handleCommentBlur}
              rows={3}
              style={{
                width: "100%",
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                padding: "10px",
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-ui)",
              }}
              placeholder="seu comentário aqui..."
            />
          </div>

          <button
            onClick={handleDelete}
            style={{
              marginTop: "20px",
              marginBottom: "16px",
              display: "block",
              background: "none",
              border: "1px solid var(--color-error)",
              color: "var(--color-error)",
              borderRadius: "var(--radius-sm)",
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            Excluir livro
          </button>
        </div>
      </div>
    </div>
  );
}
