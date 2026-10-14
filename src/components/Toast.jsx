import { useEffect, useState } from "react";
import { onNotify } from "../utils/notify";
import { Link } from "./Link";
import { useI18n } from "../i18n";

// aviso no rodapé da tela; some sozinho (6 s, ou 8 s quando tem ação para dar tempo de clicar).
// A ação pode ser um link ({ label, to }) ou um botão ({ label, onClick }), como o "Desfazer".
export default function Toast() {
  const { t } = useI18n();
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let timer = 0;
    const stop = onNotify((detail) => {
      clearTimeout(timer);
      setToast({ ...detail, key: Date.now() });
      timer = setTimeout(() => setToast(null), detail.duration || (detail.action ? 8000 : 6000));
    });
    return () => {
      stop();
      clearTimeout(timer);
    };
  }, []);

  if (!toast) return null;

  return (
    <div
      key={toast.key}
      role={toast.type === "error" ? "alert" : "status"}
      className={`toast toast--${toast.type}`}
    >
      <span className="toast__message">{toast.message}</span>
      {toast.action?.to && (
        <Link to={toast.action.to} className="toast__action" onClick={() => setToast(null)}>
          {toast.action.label}
        </Link>
      )}
      {toast.action?.onClick && (
        <button
          type="button"
          className="toast__action toast__action--button"
          onClick={() => {
            setToast(null);
            toast.action.onClick();
          }}
        >
          {toast.action.label}
        </button>
      )}
      <button
        type="button"
        className="toast__close"
        aria-label={t("common.close")}
        onClick={() => setToast(null)}
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>
  );
}
