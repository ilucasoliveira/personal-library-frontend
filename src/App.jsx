import Login from "./pages/Login";
import { setAuth, clearAuth } from "./services/api";
import { getCoverColor } from "./utils/coverColor";
import { useState, useEffect } from "react";
import BookCard from "./components/BookCard";
import { getBooks, getProfile, updateBook } from "./services/api";
import SearchBooks from "./pages/SearchBooks";
import BookDetails from "./pages/BookDetails";
import Profile from "./pages/Profile";
import AddManual from "./pages/AddManual";

function App() {
  const [authToken, setAuthToken] = useState(() =>
    localStorage.getItem("authToken"),
  );
  const [view, setView] = useState("library");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [manualPrefill, setManualPrefill] = useState("");
  const [profile, setProfile] = useState(null);
  const [searchPrefill, setSearchPrefill] = useState("");
  const [quickSearch, setQuickSearch] = useState("");
  const [librarySearch, setLibrarySearch] = useState("");
  const [sortBy, setSortBy] = useState("title-asc");

  function handleDeleted(deletedId) {
    setBooks((prev) => prev.filter((b) => b.id !== deletedId));
    setSelectedBook(null);
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return "Bom dia";
    if (hour >= 12 && hour < 18) return "Boa tarde";
    return "Boa noite";
  }

  useEffect(() => {
    if (!authToken) return;
    getBooks()
      .then(setBooks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [view, authToken]);

  useEffect(() => {
    if (!authToken) return;
    getProfile()
      .then(setProfile)
      .catch(() => {});
  }, [authToken]);

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

  function handleProfileUpdated(updatedProfile) {
    setProfile(updatedProfile);
  }

  function handleQuickSearch(e) {
    e.preventDefault();
    if (!quickSearch.trim()) return;
    setSearchPrefill(quickSearch);
    setQuickSearch("");
    setView("search");
  }

  function handleLogout() {
    clearAuth();
    localStorage.removeItem("authToken");
    setAuthToken(null);
  }

  async function handleToggleFavorite(book) {
    const updated = await updateBook(book.id, { favorite: !book.favorite });
    setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
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
    { key: "favorites", label: "Favoritos" },
    { key: "toRead", label: "Na lista" },
    { key: "read", label: "Lidos" },
    { key: "all", label: "Todos" },
  ];

  const currentlyReading = books.filter((b) => b.reading_status === "reading");

  if (!authToken) {
    return (
      <Login
        onLogin={(token) => {
          setAuth(token);
          localStorage.setItem("authToken", token);
          setAuthToken(token);
        }}
      />
    );
  }

  setAuth(authToken);

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
          Biblioteca do Thur
        </button>

        <div
          className="nav-avatar"
          onClick={() => setView("profile")}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundImage: profile?.photo_url
              ? `url(${profile.photo_url})`
              : "linear-gradient(155deg, var(--color-primary), var(--color-secondary))",
            backgroundSize: "cover",
            backgroundPosition: "center",
            cursor: "pointer",
          }}
        />
      </nav>

      <div className="bottom-nav">
        <button
          className={`bottom-nav-item ${view === "library" ? "active" : ""}`}
          onClick={() => setView("library")}
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
          onClick={() => setView("search")}
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
          onClick={() => setView("profile")}
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

      {view !== "addManual" && !selectedBook && (
        <button
          className="fab-add"
          onClick={() => setView("addManual")}
          aria-label="Adicionar livro"
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
          profile={profile}
          onProfileUpdated={handleProfileUpdated}
          onLogout={handleLogout}
        />
      ) : view === "addManual" ? (
        <AddManual
          onCreated={handleCreated}
          onCancel={() => setView("library")}
          initialTitle={manualPrefill}
        />
      ) : loading ? (
        <p style={{ color: "var(--color-text-primary)" }}>Carregando...</p>
      ) : error ? (
        <p style={{ color: "var(--color-error)" }}>{error}</p>
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
              {getGreeting()}, Thur
            </h1>
            <p
              style={{
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-ui)",
                marginTop: "8px",
              }}
            >
              O que vamos ler hoje?
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
              placeholder="Buscar título ou autor..."
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
                Continuando a leitura
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
                      onClick={() => setSelectedBook(book)}
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
              placeholder="Buscar na sua estante..."
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
              <option value="title-asc">Título A-Z</option>
              <option value="title-desc">Título Z-A</option>
              <option value="author">Autor</option>
              <option value="gender">Gênero</option>
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
                  ? `Nenhum livro encontrado para "${librarySearch}" nessa lista.`
                  : {
                      favorites:
                        "Nenhuma estrela nesse céu ainda. Favorite um livro para começar.",
                      toRead:
                        "Nada na fila por enquanto. Que tal buscar algo novo?",
                      read: "As primeiras páginas de uma nova jornada de leitura.",
                      all: "Sua estante ainda está esperando o primeiro capítulo.",
                    }[activeTab]}
              </p>
              {!librarySearch.trim() && (
                <button
                  onClick={() => setView("search")}
                  style={{
                    marginTop: "16px",
                    background: "var(--color-primary)",
                    color: "#241119",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    padding: "10px 20px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Buscar um livro
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
                  onClick={() => setSelectedBook(book)}
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
        © 2026 Lucas de Oliveira · Built with ♥.
      </footer>
    </div>
  );
}

export default App;
