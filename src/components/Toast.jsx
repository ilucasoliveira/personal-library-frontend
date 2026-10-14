import { useEffect, useState } from "react";
import { onNotify } from "../utils/notify";
import { Link } from "./Link";
import { useI18n } from "../i18n";

// aviso no rodapé da tela; some sozinho (6 s, ou 8 s quando tem ação para dar tempo de clicar)
export default function Toast() {
  const { t } = useI18n();
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let timer = 0;
    const stop = onNotify((detail) => {
      clearTimeout(timer);
      setToast({ ...detail, key: Date.now() });
      timer = setTimeout(() => setToast(null), detail.action ? 8000 : 6000);
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
      {toast.action && (
        <Link to={toast.action.to} className="toast__action" onClick={() => setToast(null)}>
          {toast.action.label}
        </Link>
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
