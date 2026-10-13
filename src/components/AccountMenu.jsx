import { useEffect, useRef, useState } from "react";
import { Link } from "./Link";
import { useI18n } from "../i18n";

// Avatar que abre um painel com Configurações e Sair.
// Fecha com Esc (devolvendo o foco ao avatar), com clique fora e ao escolher um item.
export default function AccountMenu({ user, onLogout }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const wrapper = useRef(null);
  const button = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onKey(event) {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    }
    function onPointer(event) {
      if (!wrapper.current?.contains(event.target)) setOpen(false);
    }
    // foco saiu do menu com Tab: fecha também
    function onFocus(event) {
      if (!wrapper.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("focusin", onFocus);
    };
  }, [open]);

  return (
    <div className="nav-avatar" ref={wrapper}>
      <button
        ref={button}
        type="button"
        className="account-button"
        aria-label={t("nav.account")}
        aria-expanded={open}
        aria-controls="account-menu"
        onClick={() => setOpen((value) => !value)}
        style={{
          backgroundImage: user.photo_url
            ? `url(${user.photo_url})`
            : "linear-gradient(155deg, var(--color-primary), var(--color-secondary))",
        }}
      >
        {!user.photo_url && <span aria-hidden="true">{user.name.charAt(0).toUpperCase()}</span>}
      </button>

      {open && (
        <div id="account-menu" className="account-menu">
          <div className="account-menu__who">
            <strong>{user.name}</strong>
            {!user.is_visitor && <span>{user.email}</span>}
          </div>
          <Link
            to="/configuracoes"
            className="account-menu__item"
            onClick={() => setOpen(false)}
          >
            {t("nav.settings")}
          </Link>
          <button
            type="button"
            className="account-menu__item"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          >
            {t("profile.logout")}
          </button>
        </div>
      )}
    </div>
  );
}
