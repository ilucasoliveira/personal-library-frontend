import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { updateBook } from "../services/api";
import { notify } from "../utils/notify";
import { useI18n } from "../i18n";
import Cover from "../components/ui/Cover";
import StatusIcon from "../components/ui/StatusIcon";
import Button from "../components/ui/Button";
import Dialog from "../components/ui/Dialog";
import MenuButton from "../components/ui/MenuButton";
import Stars from "../components/ui/Stars";
import RatingDialog from "../components/RatingDialog";
import { formatRating } from "../utils/rating";

const STATUSES = ["toRead", "reading", "read"];
const COMMENT_MAX = 300;

function formatDate(iso, lang) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat(lang === "pt" ? "pt-BR" : "en", { dateStyle: "long" }).format(
    new Date(y, m - 1, d),
  );
}

// Página do livro: capa e título; os 3 controles do dia a dia (status, nota, favorito);
// a nota pessoal; a sinopse; a ficha. Editar e excluir ficam no menu "⋯".
export default function BookDetails({ book, onBack, onUpdated, onDelete }) {
  const { t, lang } = useI18n();
  const readOnly = book.is_example;
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // salva na API; se falhar (ex.: livro de exemplo da demo), avisa e devolve false
  async function save(data) {
    try {
      onUpdated(await updateBook(book.id, data));
      return true;
    } catch (err) {
      notify(err.message);
      return false;
    }
  }

  return (
    <div className="page book-page">
      <button type="button" className="btn btn--text book-page__back" onClick={onBack}>
        {t("common.back")}
      </button>

      <div className="book-page__layout">
        <Cover url={book.cover_url} title={book.title} size="large" className="book-page__cover" />

        <div className="book-page__main">
          {editing ? (
            <EditForm book={book} onCancel={() => setEditing(false)} onSave={save} onDone={() => setEditing(false)} />
          ) : (
            <>
              <header className="book-page__header">
                <div className="book-page__heading">
                  {book.is_example && <span className="tag">{t("card.example")}</span>}
                  <h1 className="book-page__title">{book.title}</h1>
                  <p className="book-page__author">{book.author}</p>
                </div>
                {!readOnly && (
                  <MenuButton
                    label={t("details.actions")}
                    items={[
                      { label: t("details.editData"), onSelect: () => setEditing(true) },
                      { label: t("details.delete"), danger: true, onSelect: () => setConfirming(true) },
                    ]}
                  />
                )}
              </header>

              {readOnly && <p className="book-page__note">{t("details.exampleNote")}</p>}

              <Controls book={book} readOnly={readOnly} onSave={save} />
              <PersonalNote book={book} readOnly={readOnly} onSave={save} />
              {book.synopsis && <Synopsis text={book.synopsis} />}

              <section className="book-section" aria-labelledby="record-title">
                <h2 id="record-title" className="label">
                  {t("details.record")}
                </h2>
                <dl className="record">
                  <div>
                    <dt>{t("details.genre")}</dt>
                    <dd>{book.gender}</dd>
                  </div>
                  {book.add_date && (
                    <div>
                      <dt>{t("details.addedOn")}</dt>
                      <dd>{formatDate(book.add_date, lang)}</dd>
                    </div>
                  )}
                  {book.reading_status === "read" && book.finished_date && (
                    <div>
                      <dt>{t("details.finishedOn")}</dt>
                      <dd>{formatDate(book.finished_date, lang)}</dd>
                    </div>
                  )}
                </dl>
              </section>
            </>
          )}
        </div>
      </div>

      <DeleteDialog
        open={confirming}
        book={book}
        onClose={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          onDelete(book);
        }}
      />
    </div>
  );
}

// status, nota e favorito: mudam na hora e desfazem se a API recusar
function Controls({ book, readOnly, onSave }) {
  const { t, lang } = useI18n();
  const [status, setStatus] = useState(book.reading_status);
  const [rating, setRating] = useState(book.grade || 0);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [favorite, setFavorite] = useState(book.favorite);

  async function change(setter, previous, next, data) {
    setter(next);
    if (!(await onSave(data))) setter(previous);
  }

  return (
    <div className="book-controls">
      <div className="book-controls__row">
        <span className="book-controls__label" id="status-label">
          {t("details.status")}
        </span>
        <div className="seg book-status" role="group" aria-labelledby="status-label">
          {STATUSES.map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={status === key}
              disabled={readOnly}
              onClick={() => status !== key && change(setStatus, status, key, { reading_status: key })}
            >
              <StatusIcon status={key} />
              {t(`statusShort.${key}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="book-controls__row">
        <span className="book-controls__label">
          {t("details.rating")}
        </span>
        <button
          type="button"
          className="rating-open"
          aria-label={rating ? t("details.rateChange", { n: formatRating(rating, lang) }) : t("details.rate")}
          disabled={readOnly}
          onClick={() => setRatingOpen(true)}
        >
          <Stars rating={rating} empty />
          <span className="rating-open__value" aria-hidden="true">
            {rating ? formatRating(rating, lang) : t("details.rate")}
          </span>
        </button>
      </div>

      {ratingOpen && (
        <RatingDialog
          book={book}
          rating={rating}
          onClose={() => setRatingOpen(false)}
          onSave={(next) => {
            setRatingOpen(false);
            change(setRating, rating, next ?? 0, { grade: next });
          }}
        />
      )}

      <div className="book-controls__row">
        <span className="book-controls__label">{t("details.favoriteLabel")}</span>
        <button
          type="button"
          className={`btn btn--secondary book-favorite${favorite ? " is-on" : ""}`}
          aria-pressed={favorite}
          disabled={readOnly}
          onClick={() => change(setFavorite, favorite, !favorite, { favorite: !favorite })}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 20.5s-7.5-4.6-7.5-10.1A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8c0 5.5-7.5 10.1-7.5 10.1Z" />
          </svg>
          {favorite ? t("details.isFavorite") : t("details.makeFavorite")}
        </button>
      </div>
    </div>
  );
}

// comentário: salva sozinho 1 s depois de parar de digitar ou ao sair do campo
function PersonalNote({ book, readOnly, onSave }) {
  const { t } = useI18n();
  const [text, setText] = useState(book.comment || "");
  const [state, setState] = useState("idle"); // idle | saving | saved | error
  const saved = useRef(book.comment || "");

  async function flush(value) {
    if (value === saved.current) return;
    setState("saving");
    if (await onSave({ comment: value })) {
      saved.current = value;
      setState("saved");
    } else {
      setState("error");
    }
  }

  useEffect(() => {
    if (text === saved.current) return;
    const timer = setTimeout(() => flush(text), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <section className="book-section">
      <div className="book-section__head">
        <label htmlFor="personal-note" className="label">
          {t("details.comment")}
        </label>
        <span className="book-note__state" aria-live="polite">
          {state === "saving" ? t("details.saving") : state === "saved" ? t("details.saved") : ""}
        </span>
      </div>
      <textarea
        id="personal-note"
        className="field-input book-note"
        rows={4}
        maxLength={COMMENT_MAX}
        value={text}
        readOnly={readOnly}
        aria-describedby="personal-note-count"
        placeholder={t("details.commentPh")}
        onChange={(e) => {
          setText(e.target.value);
          setState("idle");
        }}
        onBlur={() => flush(text)}
      />
      <span id="personal-note-count" className="book-note__count">
        {text.length}/{COMMENT_MAX}
      </span>
    </section>
  );
}

// sinopse recolhida em 5 linhas; "Ler mais" só aparece se o texto passar disso
function Synopsis({ text }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (el && !open) setOverflows(el.scrollHeight > el.clientHeight + 1);
  }, [text, open]);

  return (
    <section className="book-section" aria-labelledby="synopsis-title">
      <h2 id="synopsis-title" className="label">
        {t("details.synopsis")}
      </h2>
      <p ref={ref} id="synopsis-text" className={`book-synopsis${open ? " is-open" : ""}`}>
        {text}
      </p>
      {(overflows || open) && (
        <button
          type="button"
          className="btn btn--text"
          aria-expanded={open}
          aria-controls="synopsis-text"
          onClick={() => setOpen(!open)}
        >
          {open ? t("details.less") : t("details.more")}
        </button>
      )}
    </section>
  );
}

function EditForm({ book, onCancel, onSave, onDone }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    title: book.title,
    author: book.author,
    gender: book.gender,
    cover_url: book.cover_url || "",
    synopsis: book.synopsis || "",
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const first = useRef(null);

  useEffect(() => first.current?.focus(), []);

  async function submit(event) {
    event.preventDefault();
    const found = {
      title: !form.title.trim(),
      author: !form.author.trim(),
      gender: !form.gender.trim(),
    };
    setErrors(found);
    const firstError = Object.keys(found).find((key) => found[key]);
    if (firstError) {
      document.getElementById(`edit-${firstError}`)?.focus();
      return;
    }
    setBusy(true);
    const ok = await onSave({
      title: form.title.trim(),
      author: form.author.trim(),
      gender: form.gender.trim(),
      cover_url: form.cover_url.trim(),
      synopsis: form.synopsis.trim(),
    });
    setBusy(false);
    if (ok) onDone();
  }

  function field(key, label, { required = false, type = "text", multiline = false } = {}) {
    const Input = multiline ? "textarea" : "input";
    return (
      <div className="form-row">
        <label htmlFor={`edit-${key}`} className="form-row__label">
          {label}
        </label>
        <Input
          ref={key === "title" ? first : undefined}
          id={`edit-${key}`}
          type={multiline ? undefined : type}
          rows={multiline ? 6 : undefined}
          className={`field-input${multiline ? " book-note" : ""}`}
          value={form[key]}
          required={required}
          aria-invalid={errors[key] || undefined}
          aria-describedby={errors[key] ? `edit-${key}-error` : undefined}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        />
        {errors[key] && (
          <p id={`edit-${key}-error`} className="form-row__error">
            {t(`manual.${key === "gender" ? "gender" : key}Error`)}
          </p>
        )}
      </div>
    );
  }

  return (
    <form className="edit-form" onSubmit={submit} noValidate>
      <h1 className="book-page__title">{t("details.editData")}</h1>
      {field("title", t("manual.name"), { required: true })}
      {field("author", t("manual.author"), { required: true })}
      {field("gender", t("manual.gender"), { required: true })}
      {field("cover_url", t("manual.cover"), { type: "url" })}
      {field("synopsis", t("manual.synopsis"), { multiline: true })}
      <div className="edit-form__actions">
        <Button variant="secondary" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" busy={busy} busyText={t("details.saving")}>
          {t("common.save")}
        </Button>
      </div>
    </form>
  );
}

// confirmar só tira o livro da tela; a API apaga depois do prazo do "Desfazer" (App.jsx)
function DeleteDialog({ open, book, onClose, onConfirm }) {
  const { t } = useI18n();
  const cancel = useRef(null);

  return (
    <Dialog
      open={open}
      title={t("details.deleteTitle")}
      onClose={onClose}
      initialFocus={cancel}
      actions={
        <>
          <button ref={cancel} type="button" className="btn btn--secondary" onClick={onClose}>
            {t("common.cancel")}
          </button>
          <Button variant="danger-solid" onClick={onConfirm}>
            {t("details.deleteConfirm")}
          </Button>
        </>
      }
    >
      <p>{t("details.deleteText", { title: book.title })}</p>
    </Dialog>
  );
}
