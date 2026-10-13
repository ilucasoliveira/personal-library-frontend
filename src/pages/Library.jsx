import { useState } from "react";
import BookCard from "../components/BookCard";
import { getCoverColor } from "../utils/coverColor";
import { navigate } from "../router";
import { Link } from "../components/Link";
import { useI18n } from "../i18n";

const SORTERS = {
  "title-asc": (a, b) => a.title.localeCompare(b.title),
  "title-desc": (a, b) => b.title.localeCompare(a.title),
  author: (a, b) => a.author.localeCompare(b.author),
  gender: (a, b) => a.gender.localeCompare(b.gender),
};

const FILTERS = {
  favorites: (book) => book.favorite,
  toRead: (book) => book.reading_status === "toRead",
  read: (book) => book.reading_status === "read",
  all: () => true,
};

function greetingKey() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "greeting.morning";
  if (hour >= 12 && hour < 18) return "greeting.afternoon";
  return "greeting.evening";
}

// shelf: aba, filtro e ordem (ficam no App para sobreviver à ida até um livro e à volta)
export default function Library({
  user,
  books,
  loading,
  error,
  shelf,
  onShelfChange,
  onOpenBook,
  onToggleFavorite,
}) {
  const { t } = useI18n();
  const [quickSearch, setQuickSearch] = useState("");
  const { activeTab, librarySearch, sortBy } = shelf;

  const firstName = user.is_visitor ? "" : user.name.split(" ")[0];
  const greeting = firstName ? `${t(greetingKey())}, ${firstName}` : t(greetingKey());

  function handleQuickSearch(e) {
    e.preventDefault();
    const q = quickSearch.trim();
    if (!q) return;
    navigate(`/adicionar?q=${encodeURIComponent(q)}`);
  }

  const term = librarySearch.trim().toLowerCase();
  const filteredBooks = books
    .filter(FILTERS[activeTab])
    .filter(
      (book) =>
        !term ||
        book.title.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term),
    )
    .sort(SORTERS[sortBy]);

  const currentlyReading = books.filter((b) => b.reading_status === "reading");

  const tabs = [
    { key: "favorites", label: t("tabs.favorites") },
    { key: "toRead", label: t("tabs.toRead") },
    { key: "read", label: t("tabs.read") },
    { key: "all", label: t("tabs.all") },
  ];

  function card(book) {
    return (
      <BookCard
        title={book.title}
        author={book.author}
        gender={book.gender}
        coverColor={getCoverColor(book.title)}
        coverUrl={book.cover_url}
        rating={book.grade || 0}
        favorite={book.favorite}
        status={book.reading_status}
        isExample={book.is_example}
        to={`/livro/${book.id}`}
        onOpen={onOpenBook}
        onToggleFavorite={() => onToggleFavorite(book)}
      />
    );
  }

  return (
    <div className="page-padding">
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text-primary)",
            fontSize: "28px",
            margin: 0,
          }}
        >
          {greeting}
        </h1>
        <p
          style={{
            color: "var(--color-text-secondary)",
            fontFamily: "var(--font-ui)",
            marginTop: "8px",
          }}
        >
          {t("home.subtitle")}
        </p>
      </div>

      <form
        role="search"
        onSubmit={handleQuickSearch}
        style={{ maxWidth: "400px", margin: "0 auto 32px", position: "relative" }}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-text-muted)"
          strokeWidth="2"
          style={{
            position: "absolute",
            left: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "16px",
            height: "16px",
          }}
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="search"
          value={quickSearch}
          onChange={(e) => setQuickSearch(e.target.value)}
          placeholder={t("home.quickSearch")}
          aria-label={t("home.quickSearchLabel")}
          style={{
            width: "100%",
            padding: "12px 16px 12px 42px",
            borderRadius: "var(--radius-pill)",
            border: "1px solid var(--color-border-strong)",
            background: "var(--color-card)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-ui)",
          }}
        />
      </form>

      {loading ? (
        <p style={{ color: "var(--color-text-secondary)" }}>{t("common.loading")}</p>
      ) : error ? (
        <p role="alert" style={{ color: "var(--color-error)" }}>
          {error}
        </p>
      ) : (
        <>
          {currentlyReading.length > 0 && (
            <section aria-labelledby="reading-title" style={{ marginBottom: "32px" }}>
              <h2 id="reading-title" className="section-label">
                {t("home.continueReading")}
              </h2>
              <ul className="reading-row">
                {currentlyReading.map((book) => (
                  <li key={book.id}>{card(book)}</li>
                ))}
              </ul>
            </section>
          )}

          <div role="group" aria-label={t("tabs.label")} className="shelf-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className="tab-btn"
                aria-pressed={activeTab === tab.key}
                onClick={() => onShelfChange({ activeTab: tab.key })}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
            <input
              type="search"
              value={librarySearch}
              onChange={(e) => onShelfChange({ librarySearch: e.target.value })}
              placeholder={t("home.filter")}
              aria-label={t("home.filterLabel")}
              className="shelf-filter"
            />
            <select
              value={sortBy}
              onChange={(e) => onShelfChange({ sortBy: e.target.value })}
              aria-label={t("sort.label")}
              className="shelf-sort"
            >
              <option value="title-asc">{t("sort.titleAsc")}</option>
              <option value="title-desc">{t("sort.titleDesc")}</option>
              <option value="author">{t("sort.author")}</option>
              <option value="gender">{t("sort.gender")}</option>
            </select>
          </div>

          {filteredBooks.length === 0 ? (
            <div style={{ textAlign: "center", marginTop: "60px" }}>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontSize: "18px",
                }}
              >
                {term ? t("empty.search", { q: librarySearch }) : t(`empty.${activeTab}`)}
              </p>
              {!term && (
                <Link to="/adicionar" className="btn-primary" style={{ marginTop: "16px" }}>
                  {t("empty.cta")}
                </Link>
              )}
            </div>
          ) : (
            <ul className="book-grid">
              {filteredBooks.map((book) => (
                <li key={book.id}>{card(book)}</li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
