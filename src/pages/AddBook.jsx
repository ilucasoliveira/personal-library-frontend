import SearchBooks from "./SearchBooks";
import AddManual from "./AddManual";
import { Link } from "../components/Link";
import { navigate } from "../router";
import { useI18n } from "../i18n";

// Adicionar: duas abas que são duas URLs (/adicionar e /adicionar/manual),
// então o Voltar do navegador e o link direto funcionam nas duas.
export default function AddBook({ mode, query, books, onAdded, onCreated, onCancel }) {
  const { t } = useI18n();
  const q = query.get("q") || "";

  const tabs = [
    { to: q ? `/adicionar?q=${encodeURIComponent(q)}` : "/adicionar", label: t("add.tabCatalog"), active: mode === "search" },
    { to: "/adicionar/manual", label: t("add.tabManual"), active: mode === "manual" },
  ];

  return (
    <div className="page add-page">
      <header className="page-header">
        <h1 className="page-title">{t("nav.add")}</h1>
      </header>
      <nav className="add-tabs" aria-label={t("add.tabs")}>
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            to={tab.to}
            className={`add-tabs__tab${tab.active ? " is-active" : ""}`}
            aria-current={tab.active ? "page" : undefined}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {mode === "search" ? (
        <SearchBooks
          key={q}
          initialQuery={q}
          books={books}
          onAdded={onAdded}
          onQueryChange={(next) => navigate(`/adicionar?q=${encodeURIComponent(next)}`, { replace: true })}
          onGoManual={(title) =>
            navigate(`/adicionar/manual${title ? `?titulo=${encodeURIComponent(title)}` : ""}`)
          }
        />
      ) : (
        <AddManual
          key={query.get("titulo") || ""}
          initialTitle={query.get("titulo") || ""}
          books={books}
          onCreated={onCreated}
          onCancel={onCancel}
        />
      )}
    </div>
  );
}
