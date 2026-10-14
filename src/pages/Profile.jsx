import { useRef, useState } from "react";
import { uploadProfilePhoto } from "../services/api";
import { notify } from "../utils/notify";
import { useI18n } from "../i18n";
import Button from "../components/ui/Button";
import Dialog from "../components/ui/Dialog";
import { Link } from "../components/Link";

function mostCommon(values) {
  const counts = values.reduce((acc, value) => acc.set(value, (acc.get(value) || 0) + 1), new Map());
  let best = null;
  for (const [value, count] of counts) if (!best || count > best[1]) best = [value, count];
  return best ? best[0] : null;
}

// Perfil: quem é o leitor, 3 números do ano, os livros lidos por mês e a ficha do leitor.
// Tudo sai da estante já carregada e de /me; nada novo é pedido à API.
export default function Profile({ books, user, onUserUpdated, onLogout }) {
  const { lang, t } = useI18n();
  const locale = lang === "pt" ? "pt-BR" : "en";
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const stay = useRef(null);
  const fileInput = useRef(null);

  async function handleFileChange(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      onUserUpdated(await uploadProfilePhoto(file));
      notify(t("profile.photoUpdated"), "success");
    } catch (err) {
      notify(err.message);
    } finally {
      setUploading(false);
    }
  }

  const year = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const read = books.filter((b) => b.reading_status === "read");
  const finishedThisYear = read.filter((b) => b.finished_date?.startsWith(String(year)));
  const perMonth = Array.from({ length: 12 }, (_, month) =>
    finishedThisYear.filter((b) => Number(b.finished_date.slice(5, 7)) === month + 1).length,
  );
  const monthName = (month, style) => new Intl.DateTimeFormat(locale, { month: style }).format(new Date(year, month, 1));

  const rated = books.filter((b) => b.grade);
  const average = rated.length
    ? (rated.reduce((sum, b) => sum + b.grade, 0) / rated.length).toLocaleString(locale, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })
    : null;
  const lastRead = read
    .filter((b) => b.finished_date)
    .sort((a, b) => b.finished_date.localeCompare(a.finished_date))[0];

  const since = user.created_at
    ? new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(new Date(user.created_at))
    : null;

  const numbers = [
    { value: finishedThisYear.length, label: t("profile.readYear", { year }) },
    { value: books.filter((b) => b.reading_status === "reading").length, label: t("stats.reading") },
    { value: books.length, label: t("stats.total") },
  ];

  const record = [
    { label: t("stats.topAuthor"), value: mostCommon(read.map((b) => b.author)) },
    { label: t("stats.topGenre"), value: mostCommon(books.map((b) => b.gender)) },
    { label: t("stats.avg"), value: average && t("profile.average", { value: average }) },
    {
      label: t("profile.lastRead"),
      value: lastRead && (
        <Link to={`/livro/${lastRead.id}`} className="record__link">
          {lastRead.title}
        </Link>
      ),
    },
  ];

  return (
    <div className="page profile-page">
      <header className="profile-head">
        <div
          className="profile-head__avatar"
          style={{
            backgroundImage: user.photo_url
              ? `url(${user.photo_url})`
              : "linear-gradient(155deg, var(--color-primary), var(--color-secondary))",
          }}
          aria-hidden="true"
        >
          {!user.photo_url && user.name.charAt(0).toUpperCase()}
        </div>
        <div className="profile-head__text">
          <h1 className="page-title">{user.name}</h1>
          {since && <p className="profile-head__since">{t("profile.since", { date: since })}</p>}
          {user.is_visitor ? (
            <p className="profile-head__note">{t("profile.visitorPhoto")}</p>
          ) : (
            <>
              <Button
                variant="text"
                busy={uploading}
                busyText={t("profile.uploading")}
                onClick={() => fileInput.current?.click()}
              >
                {user.photo_url ? t("profile.changePhoto") : t("profile.choosePhoto")}
              </Button>
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
                onChange={handleFileChange}
              />
            </>
          )}
        </div>
      </header>

      <dl className="profile-numbers">
        {numbers.map((item) => (
          <div key={item.label} className="profile-numbers__item">
            <dt className="label">{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>

      <section className="book-section month-chart" aria-labelledby="chart-title">
        <h2 id="chart-title" className="label">
          {t("profile.chartTitle", { year })}
        </h2>
        <MonthChart
          values={perMonth}
          currentMonth={currentMonth}
          shortName={(m) => monthName(m, "short").replace(".", "")}
          longName={(m) => monthName(m, "long")}
          countLabel={(n) => (n === 1 ? t("profile.oneBook") : t("profile.nBooks", { n }))}
        />
        <details className="month-chart__table">
          <summary>{t("profile.asTable")}</summary>
          <table>
            <thead>
              <tr>
                <th scope="col">{t("profile.month")}</th>
                <th scope="col">{t("profile.booksRead")}</th>
              </tr>
            </thead>
            <tbody>
              {perMonth.map((count, month) => (
                <tr key={month}>
                  <th scope="row">{monthName(month, "long")}</th>
                  <td>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </section>

      <section className="book-section" aria-labelledby="reader-title">
        <div className="reader-card">
          <h2 id="reader-title" className="label">
            {t("reader.title")}
          </h2>
          <dl className="record">
            {record.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value || t("profile.none")}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="profile-actions">
        <Link to="/configuracoes" className="btn btn--secondary">
          {t("profile.settings")}
        </Link>
        <Button variant="danger" onClick={() => setConfirming(true)}>
          {t("profile.logout")}
        </Button>
      </div>

      <Dialog
        open={confirming}
        title={t("profile.logoutTitle")}
        onClose={() => setConfirming(false)}
        initialFocus={stay}
        actions={
          <>
            <button ref={stay} type="button" className="btn btn--secondary" onClick={() => setConfirming(false)}>
              {t("common.cancel")}
            </button>
            <Button variant="danger-solid" onClick={onLogout}>
              {t("profile.logout")}
            </Button>
          </>
        }
      >
        <p>{t("profile.confirmLogout")}</p>
      </Dialog>
    </div>
  );
}

// Colunas por mês, uma cor só. O valor fica no topo das colunas com livros; passar o mouse
// ou focar uma coluna mostra mês e quantidade.
function MonthChart({ values, currentMonth, shortName, longName, countLabel }) {
  const max = Math.max(1, ...values);
  return (
    <div className="month-chart__plot" role="list">
      {values.map((count, month) => {
        return (
          <div
            key={month}
            role="listitem"
            tabIndex={0}
            className={`month-chart__col${month === currentMonth ? " is-current" : ""}`}
            aria-label={`${longName(month)}: ${countLabel(count)}`}
          >
            <span className="month-chart__bar-area" aria-hidden="true">
              {count > 0 && <span className="month-chart__value">{count}</span>}
              <span className="month-chart__bar" style={{ height: `${(count / max) * 100}%` }} />
            </span>
            <span className="month-chart__month" aria-hidden="true">
              {shortName(month)}
            </span>
            <span className="month-chart__tip" aria-hidden="true">
              <strong>{countLabel(count)}</strong> {longName(month)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
