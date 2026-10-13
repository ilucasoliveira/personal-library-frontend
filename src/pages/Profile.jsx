import { useState } from "react";
import { uploadProfilePhoto } from "../services/api";
import { notify } from "../utils/notify";
import { useI18n } from "../i18n";

export default function Profile({ books, user, onUserUpdated, onOpenSettings, onLogout }) {
  const { lang, t } = useI18n();
  const [uploading, setUploading] = useState(false);
  const photoUrl = user.photo_url;

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

  function handleLogoutClick() {
    if (!window.confirm(t("profile.confirmLogout"))) return;
    onLogout();
  }

  const totalRead = books.filter((b) => b.reading_status === "read").length;
  const totalBooks = books.length;

  const ratedBooks = books.filter((b) => b.grade);
  const avgRating = ratedBooks.length
    ? (ratedBooks.reduce((sum, b) => sum + b.grade, 0) / ratedBooks.length).toLocaleString(
        lang === "pt" ? "pt-BR" : "en",
        { minimumFractionDigits: 1, maximumFractionDigits: 1 },
      )
    : "-";

  const genderCounts = books.reduce((acc, b) => {
    acc[b.gender] = (acc[b.gender] || 0) + 1;
    return acc;
  }, {});
  const favoriteGender = Object.keys(genderCounts).length
    ? Object.entries(genderCounts).sort((a, b) => b[1] - a[1])[0][0]
    : "-";

  const readBooks = books.filter((b) => b.reading_status === "read");
  const authorCounts = readBooks.reduce((acc, b) => {
    acc[b.author] = (acc[b.author] || 0) + 1;
    return acc;
  }, {});
  const topAuthor = Object.keys(authorCounts).length
    ? Object.entries(authorCounts).sort((a, b) => b[1] - a[1])[0][0]
    : "-";

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const currentlyReadingCount = books.filter(
    (b) => b.reading_status === "reading",
  ).length;

  const readThisMonth = books.filter((b) => {
    if (!b.finished_date) return false;
    const finished = new Date(b.finished_date + "T00:00:00");
    return (
      finished.getFullYear() === currentYear &&
      finished.getMonth() === currentMonth
    );
  }).length;

  const readThisYear = books.filter((b) => {
    if (!b.finished_date) return false;
    const finished = new Date(b.finished_date + "T00:00:00");
    return finished.getFullYear() === currentYear;
  }).length;

  // ficha do leitor, calculada a partir da própria estante
  const favoriteBook =
    books
      .filter((b) => b.favorite)
      .sort((a, b) => (b.grade || 0) - (a.grade || 0))[0]?.title || "-";
  const lastRead =
    readBooks
      .filter((b) => b.finished_date)
      .sort((a, b) => b.finished_date.localeCompare(a.finished_date))[0]
      ?.title || "-";
  const toReadCount = books.filter((b) => b.reading_status === "toRead").length;
  const favoritesCount = books.filter((b) => b.favorite).length;

  const stats = [
    { label: t("stats.read"), value: totalRead },
    { label: t("stats.reading"), value: currentlyReadingCount },
    { label: t("stats.topAuthor"), value: topAuthor },
    { label: t("stats.topGenre"), value: favoriteGender },
    { label: t("stats.total"), value: totalBooks },
    { label: t("stats.avg"), value: avgRating },
    { label: t("stats.month"), value: readThisMonth },
    { label: t("stats.year"), value: readThisYear },
  ];

  return (
    <div
      className="page-padding"
      style={{
        background: "var(--color-background)",
        minHeight: "100vh",
        fontFamily: "var(--font-ui)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            backgroundImage: photoUrl
              ? `url(${photoUrl})`
              : "linear-gradient(155deg, var(--color-primary), var(--color-secondary))",
            backgroundSize: "cover",
            backgroundPosition: "center",
            margin: "0 auto 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-on-primary)",
            fontSize: "28px",
            fontWeight: 700,
          }}
        >
          {!photoUrl && user.name.charAt(0).toUpperCase()}
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text-primary)",
            margin: 0,
            fontSize: "26px",
          }}
        >
          {user.name}
        </h1>
        {favoriteBook !== "-" && (
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              color: "var(--color-text-secondary)",
              marginTop: "8px",
            }}
          >
            "{t("profile.favoriteBook", { title: favoriteBook })}"
          </p>
        )}

        <div
          style={{
            maxWidth: "300px",
            margin: "16px auto 0",
            textAlign: "center",
          }}
        >
          {user.is_visitor ? (
            <p
              style={{
                fontSize: "12px",
                color: "var(--color-text-muted)",
                margin: 0,
              }}
            >
              {t("profile.visitorPhoto")}
            </p>
          ) : (
          <label
            style={{
              opacity: uploading ? 0.6 : 1,
              background: "var(--color-primary)",
              color: "var(--color-on-primary)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              padding: "8px 16px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-block",
            }}
          >
            {uploading ? t("common.loading") : t("profile.choosePhoto")}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={uploading}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </label>
          )}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "12px",
          maxWidth: "400px",
          margin: "0 auto 32px",
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "var(--color-card)",
              borderRadius: "var(--radius-sm)",
              padding: "16px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "22px",
                color: "var(--color-accent)",
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                marginTop: "4px",
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          maxWidth: "400px",
          margin: "0 auto",
          border: "1px dashed var(--color-border)",
          borderRadius: "var(--radius-sm)",
          padding: "16px 20px",
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          color: "var(--color-text-muted)",
          lineHeight: 1.8,
        }}
      >
        <b
          style={{
            display: "block",
            color: "var(--color-text-secondary)",
            fontSize: "10px",
            textTransform: "uppercase",
            marginBottom: "6px",
          }}
        >
          {t("reader.title")}
        </b>
        {t("reader.lastRead", { value: lastRead })}
        <br />
        {t("reader.favorites", { value: favoritesCount })}
        <br />
        {t("reader.queue", { value: toReadCount })}
      </div>

      <div
        style={{
          maxWidth: "400px",
          margin: "24px auto 0",
          textAlign: "center",
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <button className="btn-ghost" onClick={onOpenSettings}>
          {t("profile.settings")}
        </button>
        <button className="btn-danger" onClick={handleLogoutClick}>
          {t("profile.logout")}
        </button>
      </div>
    </div>
  );
}
