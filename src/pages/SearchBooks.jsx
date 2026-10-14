import { useEffect, useState } from "react";
import { searchBooks, SOURCES } from "../services/googleBooks";
import { createBook } from "../services/api";
import { notify } from "../utils/notify";
import { useI18n } from "../i18n";
import Cover from "../components/ui/Cover";
import Button from "../components/ui/Button";
import SearchField from "../components/ui/SearchField";
import MenuButton from "../components/ui/MenuButton";
import StatusIcon from "../components/ui/StatusIcon";
import { Link } from "../components/Link";
import { bookKey } from "../utils/bookKey";

const PAGE_SIZE = 10;

// A busca mora na URL (/adicionar?q=...): recarregar ou compartilhar o link repete a busca.
// O App remonta esta tela quando o q muda (key={q}), e a primeira página roda sozinha.
export default function SearchBooks({ onGoManual, initialQuery = "", onQueryChange, onAdded, books }) {
  const { t } = useI18n();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(Boolean(initialQuery.trim()));
  const [page, setPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  // o que foi buscado de fato (o campo pode ter mudado depois) e de qual catálogo veio
  const [searched, setSearched] = useState(null);
  const [failed, setFailed] = useState(false);
  const [adding, setAdding] = useState(null);

  // livros que já estão na estante, para o resultado mostrar "Na sua estante"
  const onShelf = new Map(books.map((b) => [bookKey(b.title, b.author), b.id]));

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
    if (initialQuery.trim()) runSearch(initialQuery.trim(), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    // busca nova vai para a URL; a mesma busca de novo roda aqui mesmo
    if (q !== initialQuery.trim()) {
      onQueryChange(q);
      return;
    }
    setPage(0);
    runSearch(q, 0);
  }

  function goToPage(newPage) {
    setPage(newPage);
    runSearch(searched.query, newPage, searched.source);
    window.scrollTo(0, 0);
  }

  async function handleAdd(book, status = "toRead") {
    setAdding(book.googleId);
    try {
      const created = await createBook({
        title: book.title,
        author: book.author,
        gender: book.gender,
        synopsis: book.synopsis,
        cover_url: book.cover,
        reading_status: status,
      });
      onAdded(created);
      notify(t("search.added", { title: book.title }), "success", {
        label: t("toast.viewBook"),
        to: `/livro/${created.id}`,
      });
    } catch (err) {
      notify(err.message);
    } finally {
      setAdding(null);
    }
  }

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const hasNext = (page + 1) * PAGE_SIZE < totalItems;
  const hasPrev = page > 0;

  return (
    <div className="catalog">
      <form role="search" className="catalog__form" onSubmit={handleSearch}>
        <SearchField
          id="catalog-search"
          className="catalog__field"
          label={t("search.placeholder")}
          placeholder={t("search.placeholder")}
          value={query}
          onChange={setQuery}
        />
        <Button type="submit">{t("search.button")}</Button>
      </form>

      <p className="catalog__status" aria-live="polite">
        {searching ? t("search.searching") : !searched ? t("search.hint") : ""}
      </p>

      {!searching && failed && (
        <div className="banner banner--error" role="alert">
          <span>{t("search.failed")}</span>
          <span className="banner__actions">
            <Button variant="secondary" onClick={() => runSearch(searched.query, 0)}>
              {t("search.retry")}
            </Button>
            <Button variant="text" onClick={() => onGoManual(searched.query)}>
              {t("add.tabManual")}
            </Button>
          </span>
        </div>
      )}

      {!searching && !failed && searched && results.length === 0 && (
        <div className="empty-state empty-state--inline">
          <p className="empty-state__text">{t("search.notFoundQ", { q: searched.query })}</p>
          <Button onClick={() => onGoManual(searched.query)}>{t("add.tabManual")}</Button>
        </div>
      )}

      {!searching && results.length > 0 && (
        <>
          <ul className="result-list">
            {results.map((book) => {
              const existing = onShelf.get(bookKey(book.title, book.author));
              const busy = adding === book.googleId;
              return (
                <li key={book.googleId} className="result">
                  <Cover url={book.cover} title={book.title} size="result" />
                  <div className="result__text">
                    <span className="result__title">{book.title}</span>
                    <span className="result__meta">
                      {book.author}
                      {book.year ? ` · ${book.year}` : ""}
                    </span>
                  </div>
                  <div className="result__actions">
                    {existing ? (
                      <Link to={`/livro/${existing}`} className="result__on-shelf">
                        <StatusIcon status="read" />
                        {t("search.onShelf")}
                      </Link>
                    ) : (
                      <div className="split-button">
                        <Button
                          busy={busy}
                          busyText={t("search.adding")}
                          disabled={adding !== null}
                          onClick={() => handleAdd(book)}
                          aria-label={t("search.addTitle", { title: book.title })}
                        >
                          {t("search.add")}
                        </Button>
                        <MenuButton
                          className="split-button__menu"
                          label={t("search.moreStatus", { title: book.title })}
                          icon={
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false">
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          }
                          items={["reading", "read"].map((status) => ({
                            label: t("search.addAs", { status: t(`statusShort.${status}`) }),
                            onSelect: () => handleAdd(book, status),
                          }))}
                        />
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {searched?.source && (
            <p className="catalog__source">{t("search.source", { source: SOURCES[searched.source] })}</p>
          )}

          {totalPages > 1 && (
            <nav className="pager" aria-label={t("search.pages")}>
              <Button variant="secondary" disabled={!hasPrev} onClick={() => goToPage(page - 1)}>
                {t("search.prev")}
              </Button>
              <span className="pager__label">{t("search.page", { page: page + 1, total: totalPages })}</span>
              <Button variant="secondary" disabled={!hasNext} onClick={() => goToPage(page + 1)}>
                {t("search.next")}
              </Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
