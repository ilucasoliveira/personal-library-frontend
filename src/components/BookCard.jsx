import { Link } from "./Link";
import Cover from "./ui/Cover";
import StatusIcon from "./ui/StatusIcon";
import Stars from "./ui/Stars";
import { formatRating } from "../utils/rating";
import { useI18n } from "../i18n";

// Coração dos cards: botão próprio, fora do link do livro
export function FavoriteButton({ book, onToggle }) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      className={`favorite-button${book.favorite ? " is-on" : ""}`}
      onClick={onToggle}
      aria-pressed={book.favorite}
      aria-label={t("card.favoriteOf", { title: book.title })}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 20.5s-7.5-4.6-7.5-10.1A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8c0 5.5-7.5 10.1-7.5 10.1Z" />
      </svg>
    </button>
  );
}

// Card da grade: o link leva capa, título, autor e o selo de exemplo; status, nota e
// coração ficam na linha de baixo. O gênero aparece só na lista e na página do livro.
export default function BookCard({ book, onOpen, onToggleFavorite }) {
  const { t, lang } = useI18n();
  return (
    <article className="book-card">
      <Link to={`/livro/${book.id}`} onClick={onOpen} className="book-card__link">
        <Cover url={book.cover_url} title={book.title} />
        <span className="book-card__title">{book.title}</span>
        <span className="book-card__author">{book.author}</span>
        {book.is_example && <span className="tag book-card__tag">{t("card.example")}</span>}
      </Link>
      <div className="book-card__meta">
        <span className="book-card__status">
          <StatusIcon status={book.reading_status} />
          {t(`statusShort.${book.reading_status}`)}
        </span>
        <Stars rating={book.grade} label={t("card.rating", { rating: formatRating(book.grade, lang) })} />
        <FavoriteButton book={book} onToggle={onToggleFavorite} />
      </div>
    </article>
  );
}
