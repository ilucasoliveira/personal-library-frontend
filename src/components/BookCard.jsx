import { getGenderColor } from "../utils/coverColor";
import { useI18n } from "../i18n";
import { Link } from "./Link";

// na grade a capa aparece com ~160 px: o tamanho M da Open Library basta (o L tem ~500 px)
function gridCover(url) {
  return url?.includes("covers.openlibrary.org") ? url.replace(/-L\.jpg$/, "-M.jpg") : url;
}

const STATUS_ICON = {
  toRead: "🌙",
  reading: "🌗",
  read: "🌕",
};

// O card é um link de verdade (Tab chega nele, Enter abre, Ctrl+clique abre em outra aba).
// O coração fica fora do link: botão dentro de link é HTML inválido e confunde o leitor de tela.
export default function BookCard({
  title,
  author,
  gender = null,
  coverColor = "var(--color-primary)",
  coverUrl = null,
  rating = 0,
  favorite = false,
  status = "reading",
  isExample = false,
  to,
  onOpen,
  onToggleFavorite,
}) {
  const { t } = useI18n();
  // os rótulos de status começam com o emoji da lua; o leitor de tela recebe só o texto
  const statusText = t(`status.${status}`).replace(/^\S+\s/, "");

  return (
    <div className="book-card">
      <Link to={to} onClick={onOpen} className="book-card__link">
        <div
          className="book-card__cover"
          style={{ background: coverUrl ? "none" : coverColor }}
        >
          {coverUrl && (
            <img
              src={gridCover(coverUrl)}
              alt=""
              loading="lazy"
              decoding="async"
              width="180"
              height="270"
            />
          )}
          <span className="book-card__status" aria-hidden="true">
            {STATUS_ICON[status]}
          </span>
          {isExample && (
            <span className="example-badge book-card__example">{t("card.example")}</span>
          )}
        </div>
        <div className="book-card__body">
          <span className="book-card__title">{title}</span>
          {gender && (
            <span
              className="book-card__genre"
              style={{
                background: getGenderColor(gender).bg,
                color: getGenderColor(gender).text,
              }}
            >
              {gender}
            </span>
          )}
          <span className="book-card__author">{author}</span>
          <span className="sr-only">
            {statusText}
            {rating > 0 ? `, ${t("card.rating", { rating })}` : ""}
          </span>
          <span className="book-card__stars" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                style={{
                  color: i <= rating ? "var(--color-star-filled)" : "var(--color-star-empty)",
                }}
              >
                ★
              </span>
            ))}
          </span>
        </div>
      </Link>
      <button
        type="button"
        className="book-card__favorite"
        onClick={() => onToggleFavorite?.()}
        aria-pressed={favorite}
        aria-label={t("card.favoriteOf", { title })}
        style={{ color: favorite ? "var(--color-favorite)" : "rgba(255,255,255,0.85)" }}
      >
        <span aria-hidden="true">{favorite ? "♥" : "♡"}</span>
      </button>
    </div>
  );
}
