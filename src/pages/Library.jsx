import { useEffect, useState } from "react";
import BookCard, { FavoriteButton } from "../components/BookCard";
import { Link } from "../components/Link";
import Cover from "../components/ui/Cover";
import StatusIcon from "../components/ui/StatusIcon";
import Stars from "../components/ui/Stars";
import SearchField from "../components/ui/SearchField";
import SelectField from "../components/ui/SelectField";
import Button from "../components/ui/Button";
import { navigate } from "../router";
import { useI18n } from "../i18n";

// Aba, ordem e visão ficam na URL (?aba=lidos&ordem=autor&vista=lista&q=duna),
// para o Voltar e o recarregar devolverem a mesma estante. Aba, ordem e visão
// também ficam no navegador e voltam na próxima visita.
const TABS = [
  { slug: "todos", key: "all", test: () => true },
  { slug: "lendo", key: "reading", test: (b) => b.reading_status === "reading" },
  { slug: "quero-ler", key: "toRead", test: (b) => b.reading_status === "toRead" },
  { slug: "lidos", key: "read", test: (b) => b.reading_status === "read" },
  { slug: "favoritos", key: "favorites", test: (b) => b.favorite },
];

const byText = (field) => (a, b) => a[field].localeCompare(b[field], undefined, { sensitivity: "base" });
const SORTS = {
  titulo: { label: "sort.titleAsc", compare: byText("title") },
  "titulo-desc": { label: "sort.titleDesc", compare: (a, b) => byText("title")(b, a) },
  autor: { label: "sort.author", compare: byText("author") },
  genero: { label: "sort.gender", compare: byText("gender") },
  recentes: {
    label: "sort.recent",
    compare: (a, b) => (b.add_date || "").localeCompare(a.add_date || "") || b.id - a.id,
  },
};

const DEFAULTS = { aba: "todos", ordem: "titulo", vista: "grade" };
const PREFS_KEY = "shelfPrefs";

function readPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY)) || {};
  } catch {
    return {};
  }
}

function savePrefs(prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // sem localStorage a escolha vale só pela URL
  }
}

function pick(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

// "2026-10-13" vira data local (new Date("2026-10-13") seria meia-noite UTC, um dia antes no Brasil)
function formatDate(iso, lang) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat(lang === "pt" ? "pt-BR" : "en", { dateStyle: "short" }).format(
    new Date(y, m - 1, d),
  );
}

export default function Library({ books, loading, error, query, onRetry, onOpenBook, onToggleFavorite }) {
  const { t, lang } = useI18n();
  const prefs = readPrefs();

  const aba = pick(query.get("aba") ?? prefs.aba, TABS.map((x) => x.slug), DEFAULTS.aba);
  const ordem = pick(query.get("ordem") ?? prefs.ordem, Object.keys(SORTS), DEFAULTS.ordem);
  const vista = pick(query.get("vista") ?? prefs.vista, ["grade", "lista"], DEFAULTS.vista);
  const q = query.get("q") || "";

  // o campo responde na hora; a filtragem (e a URL) esperam 150 ms sem digitar
  const [term, setTerm] = useState(q);

  function update(change) {
    const next = { aba, ordem, vista, q, ...change };
    savePrefs({ aba: next.aba, ordem: next.ordem, vista: next.vista });
    const params = new URLSearchParams();
    for (const key of ["aba", "ordem", "vista"]) {
      if (next[key] !== DEFAULTS[key]) params.set(key, next[key]);
    }
    if (next.q.trim()) params.set("q", next.q.trim());
    const search = params.toString();
    navigate(search ? `/?${search}` : "/", { replace: true });
  }

  useEffect(() => {
    if (term.trim() === q) return;
    const timer = setTimeout(() => update({ q: term }), 150);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  // servidor do Render dormindo: depois de 4 s avisa que está acordando
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(timer);
  }, [loading]);

  const needle = q.toLowerCase();
  const matches = needle
    ? books.filter(
        (b) => b.title.toLowerCase().includes(needle) || b.author.toLowerCase().includes(needle),
      )
    : books;
  const tab = TABS.find((x) => x.slug === aba);
  const visible = matches.filter(tab.test).sort(SORTS[ordem].compare);
  const reading = books.filter((b) => b.reading_status === "reading");

  const year = new Date().getFullYear();
  const readThisYear = books.filter(
    (b) => b.reading_status === "read" && b.finished_date?.startsWith(String(year)),
  ).length;
  const summary = [
    books.length === 1 ? t("shelf.book") : t("shelf.books", { n: books.length }),
    t("shelf.readingCount", { n: reading.length }),
    readThisYear === 1 ? t("shelf.readYearOne", { year }) : t("shelf.readYear", { n: readThisYear, year }),
  ].join(" · ");

  // com uma cópia salva, a estante continua na tela mesmo se a atualização falhar
  const hasBooks = !loading && books.length > 0;

  return (
    <div className="page shelf">
      <header className="page-header">
        <h1 className="page-title">{t("shelf.title")}</h1>
        {hasBooks && <p className="page-summary">{summary}</p>}
      </header>

      {loading && (
        <>
          <p className="shelf-status" aria-live="polite">
            {slow ? t("shelf.waking") : t("common.loading")}
          </p>
          <ul className="book-grid" aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => (
              <li key={i}>
                <span className="cover skeleton" />
                <span className="skeleton skeleton--line" />
                <span className="skeleton skeleton--line skeleton--short" />
              </li>
            ))}
          </ul>
        </>
      )}

      {error && !loading && (
        <div className="banner banner--error" role="alert">
          <span>
            {error}
            {books.length > 0 && ` ${t("shelf.stale")}`}
          </span>
          <Button variant="secondary" onClick={onRetry}>
            {t("common.retry")}
          </Button>
        </div>
      )}

      {!loading && !error && books.length === 0 && (
        <div className="empty-state">
          <svg className="empty-state__art" viewBox="0 0 160 96" aria-hidden="true" focusable="false">
            <path d="M58 20a18 18 0 1 0 22 22 14 14 0 0 1-22-22Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M16 80h128M28 80v8M132 80v8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M104 80V54h8v26M114 80V60h7v20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
          <h2 className="empty-state__title">{t("empty.firstTitle")}</h2>
          <p className="empty-state__text">{t("empty.firstText")}</p>
          <div className="empty-state__actions">
            <Link to="/adicionar" className="btn btn--primary">
              {t("empty.cta")}
            </Link>
            <Link to="/adicionar/manual" className="btn btn--secondary">
              {t("empty.manual")}
            </Link>
          </div>
        </div>
      )}

      {hasBooks && (
        <>
          {reading.length > 0 && (
            <section className="reading-strip" aria-labelledby="reading-title">
              <h2 id="reading-title" className="label">
                {t("shelf.readingNow")}
              </h2>
              <ul className="reading-strip__list">
                {reading.map((book) => (
                  <li key={book.id}>
                    <Link to={`/livro/${book.id}`} onClick={onOpenBook} className="reading-item">
                      <Cover url={book.cover_url} title={book.title} size="thumb" />
                      <span className="reading-item__text">
                        <span className="reading-item__title">{book.title}</span>
                        <span className="reading-item__author">{book.author}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="shelf-tools">
            <SearchField
              id="shelf-search"
              className="shelf-tools__search"
              label={t("shelf.search")}
              placeholder={t("shelf.searchPh")}
              value={term}
              onChange={setTerm}
            />
            <div className="shelf-tools__right">
              <SelectField
                id="shelf-sort"
                label={t("shelf.sort")}
                value={ordem}
                onChange={(value) => update({ ordem: value })}
                options={Object.entries(SORTS).map(([value, sort]) => ({ value, label: t(sort.label) }))}
              />
              <div className="view-toggle" role="group" aria-label={t("shelf.view")}>
                {[
                  { value: "grade", label: t("shelf.grid"), icon: <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" /> },
                  { value: "lista", label: t("shelf.list"), icon: <path d="M4 6h16M4 12h16M4 18h16" /> },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className="view-toggle__button"
                    aria-pressed={vista === option.value}
                    aria-label={option.label}
                    title={option.label}
                    onClick={() => update({ vista: option.value })}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      {option.icon}
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="status-tabs" role="group" aria-label={t("tabs.label")}>
            {TABS.map((option) => (
              <button
                key={option.slug}
                type="button"
                className="status-tabs__tab"
                aria-pressed={aba === option.slug}
                onClick={() => update({ aba: option.slug })}
              >
                {t(`tabs.${option.key}`)}
                <span className="status-tabs__count">{matches.filter(option.test).length}</span>
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <div className="empty-state empty-state--inline">
              {q ? (
                <>
                  <p className="empty-state__text">{t("empty.shelfSearch", { q })}</p>
                  <Link to={`/adicionar?q=${encodeURIComponent(q)}`} className="btn btn--primary">
                    {t("empty.catalog")}
                  </Link>
                </>
              ) : (
                <p className="empty-state__text">{t(`empty.${tab.key}`)}</p>
              )}
            </div>
          ) : vista === "lista" ? (
            <ul className="book-list">
              {visible.map((book) => (
                <li key={book.id} className="book-row">
                  <Cover url={book.cover_url} title={book.title} size="thumb" />
                  <div className="book-row__main">
                    <Link to={`/livro/${book.id}`} onClick={onOpenBook} className="book-row__link">
                      {book.title}
                    </Link>
                    <span className="book-row__author">{book.author}</span>
                  </div>
                  <span className="book-row__genre">{book.gender}</span>
                  <span className="book-row__status">
                    <StatusIcon status={book.reading_status} />
                    {t(`statusShort.${book.reading_status}`)}
                  </span>
                  <span className="book-row__rating">
                    <Stars rating={book.grade} label={t("card.rating", { rating: book.grade })} />
                  </span>
                  <span className="book-row__date">
                    {book.reading_status === "read" && book.finished_date
                      ? t("shelf.finished", { date: formatDate(book.finished_date, lang) })
                      : t("shelf.added", { date: formatDate(book.add_date, lang) })}
                  </span>
                  <FavoriteButton book={book} onToggle={() => onToggleFavorite(book)} />
                </li>
              ))}
            </ul>
          ) : (
            <ul className="book-grid">
              {visible.map((book) => (
                <li key={book.id}>
                  <BookCard book={book} onOpen={onOpenBook} onToggleFavorite={() => onToggleFavorite(book)} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
