import { useEffect, useRef, useState } from "react";
import { createBook } from "../services/api";
import { notify } from "../utils/notify";
import { bookKey } from "../utils/bookKey";
import { useI18n } from "../i18n";
import Button from "../components/ui/Button";
import Cover from "../components/ui/Cover";
import Dialog from "../components/ui/Dialog";
import StatusIcon from "../components/ui/StatusIcon";
import { Link } from "../components/Link";

const REQUIRED = ["title", "author", "gender"];
const STATUSES = ["toRead", "reading", "read"];

function isUrl(text) {
  return /^https?:\/\/\S+$/i.test(text.trim());
}

// Formulário à mão: valida ao sair de cada campo e no envio (o foco vai para o primeiro erro),
// sugere os gêneros já usados, mostra a prévia da capa e avisa antes de perder o que foi digitado.
export default function AddManual({ onCreated, onCancel, initialTitle = "", books }) {
  const { t } = useI18n();
  const empty = { title: initialTitle, author: "", gender: "", cover_url: "", synopsis: "", reading_status: "toRead" };
  const [form, setForm] = useState(empty);
  const [touched, setTouched] = useState({});
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const keep = useRef(null);
  const saved = useRef(false);

  const dirty = Object.keys(form).some((key) => form[key] !== empty[key]);
  const errors = {
    title: !form.title.trim(),
    author: !form.author.trim(),
    gender: !form.gender.trim(),
    cover_url: form.cover_url.trim() !== "" && !isUrl(form.cover_url),
  };
  const shown = (key) => touched[key] && errors[key];

  const genres = [...new Set(books.map((b) => b.gender).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const duplicate = books.find(
    (b) => form.title.trim() && form.author.trim() && bookKey(b.title, b.author) === bookKey(form.title, form.author),
  );

  // fechar a aba ou recarregar com dados preenchidos: o navegador pergunta antes
  useEffect(() => {
    if (!dirty) return;
    function warn(event) {
      if (saved.current) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ title: true, author: true, gender: true, cover_url: true });
    const firstError = [...REQUIRED, "cover_url"].find((key) => errors[key]);
    if (firstError) {
      document.getElementById(`manual-${firstError}`)?.focus();
      return;
    }
    setBusy(true);
    try {
      const created = await createBook({
        title: form.title.trim(),
        author: form.author.trim(),
        gender: form.gender.trim(),
        cover_url: form.cover_url.trim() || null,
        synopsis: form.synopsis.trim() || null,
        reading_status: form.reading_status,
      });
      saved.current = true;
      notify(t("search.added", { title: created.title }), "success", {
        label: t("toast.viewBook"),
        to: `/livro/${created.id}`,
      });
      onCreated(created);
    } catch (err) {
      notify(err.message);
      setBusy(false);
    }
  }

  function field(key, label, { type = "text", hint, list } = {}) {
    const describedBy = [hint && `manual-${key}-hint`, shown(key) && `manual-${key}-error`].filter(Boolean).join(" ");
    return (
      <div className="form-row">
        <label htmlFor={`manual-${key}`} className="form-row__label">
          {label}
        </label>
        <input
          id={`manual-${key}`}
          type={type}
          className="field-input"
          value={form[key]}
          list={list}
          required={REQUIRED.includes(key)}
          aria-invalid={shown(key) || undefined}
          aria-describedby={describedBy || undefined}
          onChange={(e) => update(key, e.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, [key]: true }))}
        />
        {hint && (
          <p id={`manual-${key}-hint`} className="form-row__hint">
            {hint}
          </p>
        )}
        {shown(key) && (
          <p id={`manual-${key}-error`} className="form-row__error">
            {t(`manual.${key}Error`)}
          </p>
        )}
      </div>
    );
  }

  return (
    <form className="manual-form" onSubmit={handleSubmit} noValidate>
      <div className="manual-form__fields">
        {field("title", t("manual.name"))}
        {field("author", t("manual.author"))}
        {duplicate && (
          <p className="form-row__hint manual-form__duplicate" role="status">
            {t("manual.duplicate")}{" "}
            <Link to={`/livro/${duplicate.id}`}>{t("toast.viewBook")}</Link>
          </p>
        )}
        {field("gender", t("manual.gender"), {
          list: "manual-genres",
          hint: genres.length ? t("manual.genderHint") : undefined,
        })}
        <datalist id="manual-genres">
          {genres.map((genre) => (
            <option key={genre} value={genre} />
          ))}
        </datalist>

        <div className="form-row">
          <span className="form-row__label" id="manual-status-label">
            {t("manual.status")}
          </span>
          <div className="seg book-status" role="group" aria-labelledby="manual-status-label">
            {STATUSES.map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={form.reading_status === key}
                onClick={() => update("reading_status", key)}
              >
                <StatusIcon status={key} />
                {t(`statusShort.${key}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="manual-form__cover">
          {field("cover_url", t("manual.cover"), { type: "url", hint: t("manual.coverHint") })}
          <div className="manual-form__preview" aria-hidden="true">
            <Cover
              key={isUrl(form.cover_url) ? form.cover_url : "none"}
              url={isUrl(form.cover_url) ? form.cover_url.trim() : null}
              title={form.title || "?"}
              size="large"
            />
          </div>
        </div>

        <div className="form-row">
          <label htmlFor="manual-synopsis" className="form-row__label">
            {t("manual.synopsis")}
          </label>
          <textarea
            id="manual-synopsis"
            className="field-input book-note"
            rows={5}
            maxLength={2000}
            value={form.synopsis}
            onChange={(e) => update("synopsis", e.target.value)}
          />
        </div>
      </div>

      <div className="manual-form__actions">
        <Button variant="secondary" onClick={() => (dirty ? setConfirming(true) : onCancel())}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" busy={busy} busyText={t("details.saving")}>
          {t("manual.submit")}
        </Button>
      </div>

      <Dialog
        open={confirming}
        title={t("manual.discardTitle")}
        onClose={() => setConfirming(false)}
        initialFocus={keep}
        actions={
          <>
            <button ref={keep} type="button" className="btn btn--secondary" onClick={() => setConfirming(false)}>
              {t("manual.keep")}
            </button>
            <Button
              variant="danger-solid"
              onClick={() => {
                saved.current = true;
                setConfirming(false);
                onCancel();
              }}
            >
              {t("manual.discard")}
            </Button>
          </>
        }
      >
        <p>{t("manual.discardText")}</p>
      </Dialog>
    </form>
  );
}
