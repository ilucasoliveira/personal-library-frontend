import { useState, useEffect, useRef } from "react";
import Login from "./pages/Login";
import Library from "./pages/Library";
import SearchBooks from "./pages/SearchBooks";
import BookDetails from "./pages/BookDetails";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import AddManual from "./pages/AddManual";
import Toast from "./components/Toast";
import AccountMenu from "./components/AccountMenu";
import {
  clearToken,
  getBooks,
  getMe,
  getToken,
  saveToken,
  SESSION_EXPIRED,
  updateBook,
} from "./services/api";
import { notify } from "./utils/notify";
import { APP_NAME } from "./config";
import { useI18n } from "./i18n";
import { applyAppearance } from "./theme";
import { useRoute, navigate, goBack } from "./router";
import { Link } from "./components/Link";

const NAV_ITEMS = [
  {
    to: "/",
    label: "nav.library",
    section: ["library", "book"],
    icon: (
      <>
        <path d="M4 19V5a1 1 0 0 1 1-1h3v16H5a1 1 0 0 1-1-1Z" />
        <path d="M8 4h4v16H8" />
        <path d="m13.5 5.2 3.7-1 3.6 13.5-3.7 1z" />
      </>
    ),
  },
  {
    to: "/adicionar",
    label: "nav.addShort",
    section: ["add", "addManual"],
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8M8 12h8" />
      </>
    ),
  },
  {
    to: "/perfil",
    label: "nav.profile",
    section: ["profile"],
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
      </>
    ),
  },
];

const PAGE_TITLES = {
  add: "nav.add",
  addManual: "manual.title",
  profile: "nav.profile",
  settings: "nav.settings",
};

function App() {
  const { t, setLanguage } = useI18n();
  const route = useRoute();
  // user: a conta logada (vem de /me ou do login); booting: conferindo um token salvo
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(() => Boolean(getToken()));
  const [notice, setNotice] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // aba, filtro e ordem da estante: ficam aqui para sobreviver à ida até um livro
  const [shelf, setShelf] = useState({ activeTab: "all", librarySearch: "", sortBy: "title-asc" });
  // posição da estante ao abrir um livro, para voltar ao mesmo ponto
  const libraryScroll = useRef(null);
  const main = useRef(null);
  const firstRoute = useRef(true);

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

  // token vencido em qualquer requisição: volta para a tela de login (a URL fica, para voltar ao mesmo lugar)
  useEffect(() => {
    function handleExpired() {
      setUser(null);
      setNotice(t("auth.sessionExpired"));
    }
    window.addEventListener(SESSION_EXPIRED, handleExpired);
    return () => window.removeEventListener(SESSION_EXPIRED, handleExpired);
  }, [t]);

  const userId = user?.id;

  // a lista vem uma vez por conta; as telas atualizam a cópia local
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getBooks()
      .then((list) => {
        setBooks(list);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  // rota que não existe: estante
  useEffect(() => {
    if (route.name === "notFound") navigate("/", { replace: true });
  }, [route.name]);

  // cada tela começa do topo; ao voltar de um livro, a estante volta para onde estava.
  // O foco vai para o conteúdo novo, para teclado e leitor de tela não ficarem no menu.
  useEffect(() => {
    if (route.name === "library" && libraryScroll.current !== null) {
      window.scrollTo(0, libraryScroll.current);
    } else {
      window.scrollTo(0, 0);
    }
    // indo para outra seção (não livro nem estante) a posição guardada deixa de valer
    if (route.name !== "book" && route.name !== "library") libraryScroll.current = null;
    if (firstRoute.current) {
      firstRoute.current = false;
    } else {
      main.current?.focus({ preventScroll: true });
    }
  }, [route.href, route.name]);

  const selectedBook = route.name === "book" ? books.find((b) => b.id === route.id) : null;

  // título da aba do navegador acompanha a tela
  useEffect(() => {
    const key = PAGE_TITLES[route.name];
    const page = selectedBook ? selectedBook.title : key ? t(key) : null;
    document.title = page ? `${page} · ${APP_NAME}` : APP_NAME;
  }, [route.name, selectedBook, t]);

  function updateShelf(change) {
    setShelf((prev) => ({ ...prev, ...change }));
  }

  function handleUpdated(updatedBook) {
    setBooks((prev) => prev.map((b) => (b.id === updatedBook.id ? updatedBook : b)));
  }

  function handleDeleted(deletedId) {
    setBooks((prev) => prev.filter((b) => b.id !== deletedId));
    goBack("/");
  }

  function handleAdded(newBook) {
    setBooks((prev) => [...prev, newBook]);
  }

  function handleCreated(newBook) {
    handleAdded(newBook);
    navigate("/", { replace: true });
  }

  function handleLogin(session) {
    saveToken(session.access_token);
    setNotice("");
    applyUser(session.user);
  }

  function handleLogout() {
    clearToken();
    setUser(null);
    setBooks([]);
    navigate("/", { replace: true });
  }

  async function handleToggleFavorite(book) {
    try {
      const updated = await updateBook(book.id, { favorite: !book.favorite });
      handleUpdated(updated);
    } catch (err) {
      notify(err.message);
    }
  }

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

  function navLinks(className) {
    return NAV_ITEMS.map((item) => {
      const inSection = item.section.includes(route.name);
      const exact = route.href.split("?")[0] === item.to;
      return (
        <li key={item.to}>
          <Link
            to={item.to}
            className={`${className}${inSection ? " active" : ""}`}
            aria-current={exact ? "page" : undefined}
          >
            {className === "bottom-nav-item" && (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {item.icon}
              </svg>
            )}
            <span>{t(item.label)}</span>
          </Link>
        </li>
      );
    });
  }

  let page;
  if (route.name === "book") {
    page = selectedBook ? (
      <BookDetails
        key={selectedBook.id}
        book={selectedBook}
        onBack={() => goBack("/")}
        onUpdated={handleUpdated}
        onDeleted={handleDeleted}
      />
    ) : loading ? (
      <p className="page-padding" style={{ color: "var(--color-text-secondary)" }}>
        {t("common.loading")}
      </p>
    ) : (
      <div className="page-padding">
        <h1 style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}>
          {t("book.missingTitle")}
        </h1>
        <p style={{ color: "var(--color-text-secondary)" }}>{error || t("err.notFound")}</p>
        <Link to="/" className="btn-primary">
          {t("common.backToShelf")}
        </Link>
      </div>
    );
  } else if (route.name === "add") {
    const q = route.query.get("q") || "";
    page = (
      <SearchBooks
        key={q}
        initialQuery={q}
        onQueryChange={(next) =>
          navigate(`/adicionar?q=${encodeURIComponent(next)}`, { replace: true })
        }
        onGoManual={(title) =>
          navigate(`/adicionar/manual${title ? `?titulo=${encodeURIComponent(title)}` : ""}`)
        }
        onAdded={handleAdded}
      />
    );
  } else if (route.name === "addManual") {
    page = (
      <AddManual
        key={route.href}
        initialTitle={route.query.get("titulo") || ""}
        onCreated={handleCreated}
        onCancel={() => goBack("/adicionar")}
      />
    );
  } else if (route.name === "profile") {
    page = (
      <Profile
        books={books}
        user={user}
        onUserUpdated={setUser}
        onOpenSettings={() => navigate("/configuracoes")}
        onLogout={handleLogout}
      />
    );
  } else if (route.name === "settings") {
    page = (
      <Settings
        user={user}
        onUserUpdated={setUser}
        onBack={() => goBack("/")}
        onLogout={handleLogout}
      />
    );
  } else {
    page = (
      <Library
        user={user}
        books={books}
        loading={loading}
        error={error}
        shelf={shelf}
        onShelfChange={updateShelf}
        onOpenBook={() => {
          libraryScroll.current = window.scrollY;
        }}
        onToggleFavorite={handleToggleFavorite}
      />
    );
  }

  return (
    <>
      <a href="#conteudo" className="skip-link">
        {t("nav.skip")}
      </a>
      <header className="app-nav">
        <Link to="/" className="nav-brand">
          <svg className="moon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2a10 10 0 1 0 9.8 12.1A8 8 0 0 1 12 2Z" />
          </svg>
          {APP_NAME}
        </Link>
        <nav aria-label={t("nav.main")} className="nav-links-wrap">
          <ul className="nav-links">{navLinks("nav-pill")}</ul>
        </nav>
        <AccountMenu user={user} onLogout={handleLogout} />
      </header>

      <main id="conteudo" ref={main} tabIndex={-1} className="app-main">
        {page}
      </main>

      <footer className="app-footer">
        {t("app.footer")}
        {user.is_visitor && (
          <>
            <br />
            {t("app.visitorFooter")}
          </>
        )}
      </footer>

      <nav aria-label={t("nav.main")} className="bottom-nav">
        <ul>{navLinks("bottom-nav-item")}</ul>
      </nav>
      <Toast />
    </>
  );
}

export default App;
