import { useState, useEffect } from "react";
import { searchBooks, SOURCES } from "../services/googleBooks";
import { createBook } from "../services/api";
import { notify } from "../utils/notify";
import BookResultCard from "../components/BookResultCard";
import { useI18n } from "../i18n";

const PAGE_SIZE = 10;

export default function SearchBooks({
  onGoManual,
  initialQuery = "",
  onConsumeInitialQuery,
}) {
  const { t } = useI18n();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(Boolean(initialQuery.trim()));
  const [page, setPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  // o que foi buscado de fato (o campo pode ter mudado depois) e de qual catálogo veio
  const [searched, setSearched] = useState(null);
  const [failed, setFailed] = useState(false);

  async function runSearch(searchQuery, pageIndex, source = null) {
    setSearching(true);
    setFailed(false);
    try {
      const data = await searchBooks(searchQuery, pageIndex * PAGE_SIZE, PAGE_SIZE, source);
      setResults(data.items);
      setTotalItems(data.totalItems);
      setSearched({ query: searchQuery, source: data.source });
    } catch {
      // as duas fontes falharam: é erro, não "livro não encontrado"
      setResults([]);
      setTotalItems(0);
      setSearched({ query: searchQuery, source: null });
      setFailed(true);
    } finally {
      setSearching(false);
    }
  }

  useEffect(() => {
    if (initialQuery.trim()) {
      setPage(0);
      runSearch(initialQuery, 0);
      onConsumeInitialQuery?.();
    }
  }, []);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setPage(0);
    await runSearch(query, 0);
  }

  async function goToPage(newPage) {
    setPage(newPage);
    await runSearch(searched.query, newPage, searched.source);
  }

  function retry() {
    setPage(0);
    runSearch(searched.query, 0);
  }

  async function handleAdd(book) {
    try {
      await createBook({
        title: book.title,
        author: book.author,
        gender: book.gender,
        synopsis: book.synopsis,
        cover_url: book.cover,
      });
      notify(t("search.added", { title: book.title }), "success");
    } catch (err) {
      notify(err.message);
    }
  }

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const hasNext = (page + 1) * PAGE_SIZE < totalItems;
  const hasPrev = page > 0;

  return (
    <div
      className="page-padding"
      style={{ background: "var(--color-background)", minHeight: "100vh" }}
    >
      <form
        onSubmit={handleSearch}
        style={{ display: "flex", gap: "8px", marginBottom: "24px" }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search.placeholder")}
          aria-label={t("search.placeholder")}
          type="search"
          style={{
            flex: 1,
            maxWidth: "400px",
            padding: "10px 16px",
            borderRadius: "var(--radius-pill)",
            border: "1px solid var(--color-border)",
            background: "var(--color-card)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-ui)",
          }}
        />
        <button
          type="submit"
          style={{
            background: "var(--color-primary)",
            color: "var(--color-on-primary)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            padding: "10px 20px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {t("search.button")}
        </button>
      </form>

      {searching && (
        <p style={{ color: "var(--color-text-secondary)" }}>{t("search.searching")}</p>
      )}

      <div className="book-grid">
        {results.map((book) => (
          <BookResultCard key={book.googleId} book={book} onAdd={handleAdd} />
        ))}
      </div>

      {!searching && results.length > 0 && searched?.source && (
        <p
          style={{
            margin: "16px 0 0",
            fontSize: "12px",
            color: "var(--color-text-muted)",
          }}
        >
          {t("search.source", { source: SOURCES[searched.source] })}
        </p>
      )}

      {!searching && failed && (
        <div
          role="alert"
          style={{ maxWidth: "500px", textAlign: "center", marginTop: "20px" }}
        >
          <p style={{ color: "var(--color-text-secondary)" }}>{t("search.failed")}</p>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={retry}>
              {t("search.retry")}
            </button>
            <button className="btn-ghost" onClick={() => onGoManual(searched.query)}>
              {t("search.addManual")}
            </button>
          </div>
        </div>
      )}

      {!searching && results.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            marginTop: "20px",
            maxWidth: "500px",
          }}
        >
          <button
            onClick={() => goToPage(page - 1)}
            disabled={!hasPrev}
            style={{
              background: "none",
              border: "1px solid var(--color-border)",
              color: hasPrev
                ? "var(--color-text-primary)"
                : "var(--color-text-muted)",
              borderRadius: "var(--radius-sm)",
              padding: "8px 16px",
              cursor: hasPrev ? "pointer" : "not-allowed",
              opacity: hasPrev ? 1 : 0.4,
              fontFamily: "var(--font-ui)",
            }}
          >
            {t("search.prev")}
          </button>

          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--color-text-secondary)",
            }}
          >
            {t("search.page", { page: page + 1, total: totalPages || 1 })}
          </span>

          <button
            onClick={() => goToPage(page + 1)}
            disabled={!hasNext}
            style={{
              background: "none",
              border: "1px solid var(--color-border)",
              color: hasNext
                ? "var(--color-text-primary)"
                : "var(--color-text-muted)",
              borderRadius: "var(--radius-sm)",
              padding: "8px 16px",
              cursor: hasNext ? "pointer" : "not-allowed",
              opacity: hasNext ? 1 : 0.4,
              fontFamily: "var(--font-ui)",
            }}
          >
            {t("search.next")}
          </button>
        </div>
      )}

      {!searching && !failed && searched && results.length === 0 && (
        <div
          style={{ maxWidth: "500px", textAlign: "center", marginTop: "20px" }}
        >
          <p
            style={{
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
            }}
          >
            {t("search.notFound")}
          </p>
          <button
            onClick={() => onGoManual(searched.query)}
            style={{
              background: "var(--color-primary)",
              color: "var(--color-on-primary)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              padding: "10px 20px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {t("search.addManual")}
          </button>
        </div>
      )}
    </div>
  );
}
