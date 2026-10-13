import Login from "./pages/Login";
import { getCoverColor } from "./utils/coverColor";
import { useState, useEffect, useRef } from "react";
import BookCard from "./components/BookCard";
import {
  clearToken,
  getBooks,
  getMe,
  getToken,
  saveToken,
  SESSION_EXPIRED,
  updateBook,
} from "./services/api";
import SearchBooks from "./pages/SearchBooks";
import BookDetails from "./pages/BookDetails";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import AddManual from "./pages/AddManual";
import Toast from "./components/Toast";
import { notify } from "./utils/notify";
import { APP_NAME } from "./config";
import { useI18n } from "./i18n";
import { applyAppearance } from "./theme";

function App() {
  const { t, setLanguage } = useI18n();
  // user: a conta logada (vem de /me ou do login); booting: conferindo um token salvo
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(() => Boolean(getToken()));
  const [notice, setNotice] = useState("");
  const [view, setView] = useState("library");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [manualPrefill, setManualPrefill] = useState("");
  const [searchPrefill, setSearchPrefill] = useState("");
  const [quickSearch, setQuickSearch] = useState("");
  const [librarySearch, setLibrarySearch] = useState("");
  const [sortBy, setSortBy] = useState("title-asc");
  // posição da estante ao abrir um livro, para voltar ao mesmo ponto
  const libraryScroll = useRef(null);

  function openBook(book) {
    libraryScroll.current = window.scrollY;
    setSelectedBook(book);
  }

  function handleDeleted(deletedId) {
    setBooks((prev) => prev.filter((b) => b.id !== deletedId));
    setSelectedBook(null);
  }

  function getGreeting() {
    const hour = new Date().getHours();
    const greeting =
      hour >= 6 && hour < 12
        ? t("greeting.morning")
        : hour >= 12 && hour < 18
          ? t("greeting.afternoon")
          : t("greeting.evening");
    const firstName = user?.is_visitor ? "" : user?.name.split(" ")[0];
    return firstName ? `${greeting}, ${firstName}` : greeting;
  }

  // aplica a conta: idioma e aparência salvos nela (o visitante usa os do navegador)
  function applyUser(account) {
    setUser(account);
    if (!account.is_visitor) {
      setLanguage(account.language);
      applyAppearance({ theme: account.theme, accent: account.accent });
    }
  }

  // ao abrir o app com um token salvo, confere se ele ainda vale
  useEffect(() => {
    if (!getToken()) return;
    getMe()
      .then(applyUser)
      .catch(() => clearToken())
      .finally(() => setBooting(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // token vencido em qualquer requisição: volta para a tela de login
  useEffect(() => {
    function handleExpired() {
      setUser(null);
      setNotice(t("auth.sessionExpired"));
    }
    window.addEventListener(SESSION_EXPIRED, handleExpired);
    return () => window.removeEventListener(SESSION_EXPIRED, handleExpired);
  }, [t]);

  const userId = user?.id;
  const selectedId = selectedBook?.id;

  // cada tela começa do topo; ao fechar um livro, a estante volta para onde estava
  useEffect(() => {
    if (!selectedId && view === "library" && libraryScroll.current !== null) {
      window.scrollTo(0, libraryScroll.current);
      libraryScroll.current = null;
    } else {
      window.scrollTo(0, 0);
      if (!selectedId) libraryScroll.current = null;
    }
  }, [view, selectedId]);

  useEffect(() => {
    if (!userId) return;
    getBooks()
      .then((list) => {
        setBooks(list);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [view, userId]);

  function handleUpdated(updatedBook) {
    setSelectedBook(updatedBook);
    setBooks((prev) =>
      prev.map((b) => (b.id === updatedBook.id ? updatedBook : b)),
    );
  }

  function handleCreated(newBook) {
    setBooks((prev) => [...prev, newBook]);
    setView("library");
  }

  function handleGoManual(query) {
    setManualPrefill(query);
    setView("addManual");
  }

  function handleLogin(session) {
    saveToken(session.access_token);
    setNotice("");
    setLoading(true);
    setView("library");
    applyUser(session.user);
  }

  function handleQuickSearch(e) {
    e.preventDefault();
    if (!quickSearch.trim()) return;
    setSearchPrefill(quickSearch);
    setQuickSearch("");
    setView("search");
  }

  function handleLogout() {
    clearToken();
    setUser(null);
    setBooks([]);
    setSelectedBook(null);
    setView("library");
  }

  async function handleToggleFavorite(book) {
    try {
      const updated = await updateBook(book.id, { favorite: !book.favorite });
      setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    } catch (err) {
      notify(err.message);
    }
  }

  const filteredBooks = books
    .filter((book) => {
      if (activeTab === "favorites") return book.favorite;
      if (activeTab === "toRead") return book.reading_status === "toRead";
      if (activeTab === "read") return book.reading_status === "read";
      return true;
    })
    .filter((book) => {
      if (!librarySearch.trim()) return true;
      const term = librarySearch.toLowerCase();
      return (
        book.title.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      if (sortBy === "title-asc") return a.title.localeCompare(b.title);
      if (sortBy === "title-desc") return b.title.localeCompare(a.title);
      if (sortBy === "author") return a.author.localeCompare(b.author);
      if (sortBy === "gender") return a.gender.localeCompare(b.gender);
      return 0;
    });

  const tabs = [
    { key: "favorites", label: t("tabs.favorites") },
    { key: "toRead", label: t("tabs.toRead") },
    { key: "read", label: t("tabs.read") },
    { key: "all", label: t("tabs.all") },
  ];

  const currentlyReading = books.filter((b) => b.reading_status === "reading");

  if (booting) {
    return (
      <p style={{ color: "var(--color-text-secondary)", textAlign: "center", paddingTop: "40vh" }}>
        {t("common.loading")}
      </p>
    );
  }

  if (!user) {
    return (
      <>
        <Login onLogin={handleLogin} notice={notice} />
        <Toast />
      </>
    );
  }

  return (
    <div>
      <nav className="app-nav">
        <button
          className="nav-brand"
          onClick={() => {
            setView("library");
            setSelectedBook(null);
          }}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
          }}
        >
          <svg
            className="moon"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2a10 10 0 1 0 9.8 12.1A8 8 0 0 1 12 2Z" />
          </svg>
          {APP_NAME}
        </button>

        <div className="nav-avatar" style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <button
            onClick={() => {
              setSelectedBook(null);
              setView("settings");
            }}
            aria-label={t("nav.settings")}
            title={t("nav.settings")}
            style={{
              background: "none",
              border: "none",
              padding: "4px",
              cursor: "pointer",
              display: "flex",
              color: view === "settings" ? "var(--color-primary)" : "var(--color-text-secondary)",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
            </svg>
          </button>
          <button
            onClick={() => {
              setSelectedBook(null);
              setView("profile");
            }}
            aria-label={t("nav.profile")}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "none",
              padding: 0,
              backgroundImage: user.photo_url
                ? `url(${user.photo_url})`
                : "linear-gradient(155deg, var(--color-primary), var(--color-secondary))",
              backgroundSize: "cover",
              backgroundPosition: "center",
              cursor: "pointer",
              color: "var(--color-on-primary)",
              fontWeight: 700,
              fontFamily: "var(--font-ui)",
            }}
          >
            {!user.photo_url && user.name.charAt(0).toUpperCase()}
          </button>
        </div>
      </nav>

      <div className="bottom-nav">
        <button
          className={`bottom-nav-item ${view === "library" ? "active" : ""}`}
          onClick={() => {
            setSelectedBook(null);
            setView("library");
          }}
          aria-label={t("nav.home")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 12l9-9 9 9" />
            <path d="M5 10v10h14V10" />
          </svg>
        </button>
        <button
          className={`bottom-nav-item ${view === "search" ? "active" : ""}`}
          onClick={() => {
            setSelectedBook(null);
            setView("search");
          }}
          aria-label={t("nav.search")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>
        <button
          className={`bottom-nav-item ${view === "profile" ? "active" : ""}`}
          onClick={() => {
            setSelectedBook(null);
            setView("profile");
          }}
          aria-label={t("nav.profile")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
          </svg>
        </button>
      </div>

      {view !== "addManual" && view !== "settings" && !selectedBook && (
        <button
          className="fab-add"
          onClick={() => setView("addManual")}
          aria-label={t("nav.add")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      )}

      {selectedBook ? (
        <BookDetails
          book={selectedBook}
          onBack={() => setSelectedBook(null)}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      ) : view === "search" ? (
        <SearchBooks
          onGoManual={handleGoManual}
          initialQuery={searchPrefill}
          onConsumeInitialQuery={() => setSearchPrefill("")}
        />
      ) : view === "profile" ? (
        <Profile
          books={books}
          user={user}
          onUserUpdated={setUser}
          onOpenSettings={() => setView("settings")}
          onLogout={handleLogout}
        />
      ) : view === "settings" ? (
        <Settings
          user={user}
          onUserUpdated={setUser}
          onBack={() => setView("library")}
          onLogout={handleLogout}
        />
      ) : view === "addManual" ? (
        <AddManual
          onCreated={handleCreated}
          onCancel={() => setView("library")}
          initialTitle={manualPrefill}
        />
      ) : loading ? (
        <p className="page-padding" style={{ color: "var(--color-text-primary)" }}>
          {t("common.loading")}
        </p>
      ) : error ? (
        <p className="page-padding" style={{ color: "var(--color-error)" }}>
          {error}
        </p>
      ) : (
        <div
          className="page-padding"
          style={{ background: "var(--color-background)", minHeight: "100vh" }}
        >
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
                fontSize: "28px",
                margin: 0,
              }}
            >
              {getGreeting()}
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
            onSubmit={handleQuickSearch}
            style={{
              maxWidth: "400px",
              margin: "0 auto 32px",
              position: "relative",
            }}
          >
            <svg
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
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              placeholder={t("home.quickSearch")}
              style={{
                width: "100%",
                padding: "12px 16px 12px 42px",
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--color-border)",
                background: "var(--color-card)",
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-ui)",
              }}
            />
          </form>

          {currentlyReading.length > 0 && (
            <div style={{ marginBottom: "32px" }}>
              <h2
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--color-text-muted)",
                  marginBottom: "12px",
                }}
              >
                {t("home.continueReading")}
              </h2>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  overflowX: "auto",
                  paddingBottom: "8px",
                }}
              >
                {currentlyReading.map((book) => (
                  <div key={book.id} style={{ flexShrink: 0, width: "140px" }}>
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
                      onClick={() => openBook(book)}
                      onToggleFavorite={() => handleToggleFavorite(book)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: "16px",
              borderBottom: "1px solid var(--color-border)",
              marginBottom: "20px",
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className="tab-btn"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0 0 10px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color:
                    activeTab === tab.key
                      ? "var(--color-text-primary)"
                      : "var(--color-text-muted)",
                  borderBottom:
                    activeTab === tab.key
                      ? "2px solid var(--color-primary)"
                      : "2px solid transparent",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginBottom: "20px",
              flexWrap: "wrap",
            }}
          >
            <input
              value={librarySearch}
              onChange={(e) => setLibrarySearch(e.target.value)}
              placeholder={t("home.filter")}
              style={{
                flex: 1,
                minWidth: "180px",
                padding: "8px 14px",
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--color-border)",
                background: "var(--color-card)",
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-ui)",
                fontSize: "13px",
              }}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "8px 36px 8px 14px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border)",
                background: "var(--color-card)",
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-ui)",
                fontSize: "13px",
                cursor: "pointer",
                appearance: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23A6A3C2' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
                backgroundSize: "14px",
              }}
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
                {librarySearch.trim()
                  ? t("empty.search", { q: librarySearch })
                  : t(`empty.${activeTab}`)}
              </p>
              {!librarySearch.trim() && (
                <button
                  onClick={() => setView("search")}
                  style={{
                    marginTop: "16px",
                    background: "var(--color-primary)",
                    color: "var(--color-on-primary)",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    padding: "10px 20px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {t("empty.cta")}
                </button>
              )}
            </div>
          ) : (
            <div className="book-grid">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  title={book.title}
                  author={book.author}
                  gender={book.gender}
                  coverColor={getCoverColor(book.title)}
                  coverUrl={book.cover_url}
                  rating={book.grade || 0}
                  favorite={book.favorite}
                  status={book.reading_status}
                  isExample={book.is_example}
                  onClick={() => openBook(book)}
                  onToggleFavorite={() => handleToggleFavorite(book)}
                />
              ))}
            </div>
          )}
        </div>
      )}
      <footer
        style={{
          textAlign: "center",
          padding: "24px 20px",
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          letterSpacing: "0.03em",
          color: "var(--color-text-muted)",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        {t("app.footer")}
        {user.is_visitor && (
          <>
            <br />
            {t("app.visitorFooter")}
          </>
        )}
      </footer>
      <Toast />
    </div>
  );
}

export default App;
