import { useRef, useState } from "react";
import { useI18n } from "../i18n";
import { formatRating } from "../utils/rating";
import Button from "./ui/Button";
import Dialog from "./ui/Dialog";
import StarInput from "./ui/StarInput";

// Tela só da nota: estrelas grandes para arrastar, o número no meio e Salvar.
// No celular ocupa a tela inteira. O pai monta este componente só quando abre,
// então o rascunho sempre começa da nota salva.
export default function RatingDialog({ book, rating, onClose, onSave }) {
  const { t, lang } = useI18n();
  const [draft, setDraft] = useState(rating);
  const [preview, setPreview] = useState(null);
  const input = useRef(null);

  const shown = preview ?? draft;
  const valueText = draft ? t("rating.valueText", { n: formatRating(draft, lang) }) : t("rating.none");

  return (
    <Dialog
      open
      className="dialog--rating"
      title={t("rating.title", { title: book.title })}
      onClose={onClose}
      initialFocus={input}
      actions={
        <>
          {rating > 0 && (
            <Button variant="text" className="rating-dialog__clear" onClick={() => onSave(null)}>
              {t("details.clearRating")}
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button disabled={!draft || draft === rating} onClick={() => onSave(draft)}>
            {t("rating.save")}
          </Button>
        </>
      }
    >
      <div className="rating-dialog">
        <StarInput
          ref={input}
          value={draft}
          onChange={setDraft}
          onPreview={setPreview}
          label={t("rating.label")}
          valueText={valueText}
        />
        <p className="rating-dialog__value" aria-hidden="true">
          {shown ? formatRating(shown, lang) : t("rating.none")}
        </p>
        <p className="rating-dialog__hint">{t("rating.hint")}</p>
      </div>
    </Dialog>
  );
}
