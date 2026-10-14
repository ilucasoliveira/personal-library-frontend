import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n";
import { changePassword, deleteAccount, saveToken, updateMe } from "../services/api";
import { ACCENTS, THEMES, applyAppearance, readSavedAppearance } from "../theme";
import { notify } from "../utils/notify";
import Button from "../components/ui/Button";
import Dialog from "../components/ui/Dialog";

export default function Settings({ user, onUserUpdated, onBack, onLogout }) {
  const { lang, t, setLanguage } = useI18n();
  const isVisitor = user.is_visitor;

  // o visitante usa a aparência salva no navegador; as contas, a salva na API
  const [appearance, setAppearance] = useState(() =>
    isVisitor ? readSavedAppearance() : { theme: user.theme, accent: user.accent },
  );
  const [name, setName] = useState(user.name);
  const [passwords, setPasswords] = useState({ current: "", next: "" });
  const [deletePassword, setDeletePassword] = useState("");
  const [busy, setBusy] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const keepAccount = useRef(null);
  const saveTimer = useRef(0);
  const pendingSave = useRef(null);

  // saindo da tela com uma cor ainda por salvar: salva na hora
  useEffect(
    () => () => {
      clearTimeout(saveTimer.current);
      pendingSave.current?.();
    },
    [],
  );

  async function save(data, { quiet = false } = {}) {
    try {
      const updated = await updateMe(data);
      onUserUpdated(updated);
      if (!quiet) notify(t("settings.saved"), "success");
      return updated;
    } catch (err) {
      notify(err.message);
      return null;
    }
  }

  // aplica na hora e salva na conta; a cor personalizada espera a pessoa parar de arrastar
  function changeAppearance(next, { debounce = false } = {}) {
    const merged = { ...appearance, ...next };
    setAppearance(merged);
    applyAppearance(merged);
    if (isVisitor) return;

    // salva tema e cor juntos: se um salvamento pendente for cancelado, o próximo leva os dois
    clearTimeout(saveTimer.current);
    pendingSave.current = null;
    const persist = () => {
      pendingSave.current = null;
      save({ theme: merged.theme, accent: merged.accent }, { quiet: true });
    };
    if (debounce) {
      pendingSave.current = persist;
      saveTimer.current = setTimeout(persist, 500);
    } else {
      persist();
    }
  }

  function changeLanguage(code) {
    setLanguage(code);
    if (!isVisitor) save({ language: code }, { quiet: true });
  }

  async function handleSaveName(e) {
    e.preventDefault();
    if (!name.trim()) {
      notify(t("err.nameRequired"));
      return;
    }
    setBusy("name");
    await save({ name: name.trim() });
    setBusy("");
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (passwords.next.length < 8) {
      notify(t("err.shortPassword"));
      return;
    }
    setBusy("password");
    try {
      // a troca derruba as outras sessões e devolve um token novo para esta
      const session = await changePassword(passwords.current, passwords.next);
      saveToken(session.access_token);
      onUserUpdated(session.user);
      setPasswords({ current: "", next: "" });
      notify(t("settings.passwordChanged"), "success");
    } catch (err) {
      notify(err.message);
    } finally {
      setBusy("");
    }
  }

  async function handleDelete() {
    setBusy("delete");
    try {
      await deleteAccount(deletePassword);
      onLogout();
    } catch (err) {
      setConfirmingDelete(false);
      notify(err.message);
      setBusy("");
    }
  }

  const customAccent = appearance.accent && !ACCENTS.includes(appearance.accent);

  return (
    <div className="page settings">
      <button type="button" className="btn btn--text book-page__back" onClick={onBack}>
        {t("common.back")}
      </button>
      <header className="page-header">
        <h1 className="page-title">{t("settings.title")}</h1>
      </header>

      {isVisitor && <p className="book-page__note settings__note">{t("settings.visitorNote")}</p>}


        <section className="settings-section" aria-labelledby="appearance-title">
          <h2 id="appearance-title">{t("settings.theme")}</h2>
          <div className="theme-grid">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                className="theme-card"
                aria-pressed={appearance.theme === theme.id}
                onClick={() => changeAppearance({ theme: theme.id })}
              >
                {/* as cores da miniatura vêm do próprio tema (theme.js) */}
                <span
                  className="theme-card__preview"
                  style={{
                    "--p0": theme.preview[0],
                    "--p1": theme.preview[1],
                    "--p2": theme.preview[2],
                    "--p3": theme.preview[3],
                  }}
                >
                  <span />
                  <span />
                  <span />
                </span>
                <span className="theme-card__name">{t(`theme.${theme.id}`)}</span>
              </button>
            ))}
          </div>

          <h2 className="settings__subhead">{t("settings.accent")}</h2>
          <div className="swatches">
            <button
              type="button"
              className="swatch swatch--default"
              aria-pressed={!appearance.accent}
              aria-label={t("settings.accentDefault")}
              title={t("settings.accentDefault")}
              onClick={() => changeAppearance({ accent: null })}
            />
            {ACCENTS.map((color) => (
              <button
                key={color}
                type="button"
                className="swatch"
                aria-pressed={appearance.accent === color}
                aria-label={color}
                title={color}
                onClick={() => changeAppearance({ accent: color })}
                style={{ "--swatch": color }}
              />
            ))}
            <label
              className="swatch swatch--custom"
              data-active={customAccent ? "true" : "false"}
              title={t("settings.accentCustom")}
              style={customAccent ? { "--swatch": appearance.accent } : undefined}
            >
              <input
                type="color"
                aria-label={t("settings.accentCustom")}
                value={appearance.accent || "#d88c9a"}
                onChange={(e) => changeAppearance({ accent: e.target.value }, { debounce: true })}
              />
            </label>
          </div>
        </section>

        <section className="settings-section" aria-labelledby="language-title">
          <h2 id="language-title">{t("settings.language")}</h2>
          <div className="seg" role="group" aria-labelledby="language-title">
            <button type="button" aria-pressed={lang === "pt"} onClick={() => changeLanguage("pt")}>
              Português
            </button>
            <button type="button" aria-pressed={lang === "en"} onClick={() => changeLanguage("en")}>
              English
            </button>
          </div>
        </section>

        {!isVisitor && (
          <>
            <section className="settings-section" aria-labelledby="account-title">
              <h2 id="account-title">{t("settings.account")}</h2>
              <form onSubmit={handleSaveName} className="stack">
                <div>
                  <label className="field-label" htmlFor="settings-name">
                    {t("settings.name")}
                  </label>
                  <input
                    id="settings-name"
                    className="field"
                    value={name}
                    maxLength={60}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <span className="field-label">{t("settings.email")}</span>
                  <p className="settings__value">{user.email}</p>
                </div>
                <Button type="submit" busy={busy === "name"} busyText={t("details.saving")} disabled={name.trim() === user.name}>
                  {t("settings.saveName")}
                </Button>
              </form>
            </section>

            <section className="settings-section" aria-labelledby="password-title">
              <h2 id="password-title">{t("settings.password")}</h2>
              <form onSubmit={handleChangePassword} className="stack">
                <div>
                  <label className="field-label" htmlFor="current-password">
                    {t("settings.currentPassword")}
                  </label>
                  <input
                    id="current-password"
                    className="field"
                    type="password"
                    autoComplete="current-password"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="new-password">
                    {t("settings.newPassword")}
                  </label>
                  <input
                    id="new-password"
                    className="field"
                    type="password"
                    autoComplete="new-password"
                    value={passwords.next}
                    onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                  />
                  <p className="field-hint">{t("auth.passwordHint")}</p>
                </div>
                <Button
                  type="submit"
                  busy={busy === "password"}
                  busyText={t("details.saving")}
                  disabled={!passwords.current || !passwords.next}
                >
                  {t("settings.changePassword")}
                </Button>
              </form>
            </section>
          </>
        )}

        <section className="settings-section">
          <Button variant="secondary" onClick={onLogout}>
            {t("profile.logout")}
          </Button>
        </section>

        {!isVisitor && (
          <section className="settings-section settings-section--danger" aria-labelledby="delete-title">
            <h2 id="delete-title">{t("settings.delete")}</h2>
            <p className="settings__value">{t("settings.deleteText")}</p>
            <form
              className="stack"
              onSubmit={(e) => {
                e.preventDefault();
                setConfirmingDelete(true);
              }}
            >
              <div>
                <label className="field-label" htmlFor="delete-password">
                  {t("settings.deletePassword")}
                </label>
                <input
                  id="delete-password"
                  className="field"
                  type="password"
                  autoComplete="current-password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                />
              </div>
              <Button type="submit" variant="danger" disabled={!deletePassword}>
                {t("settings.deleteButton")}
              </Button>
            </form>
          </section>
        )}

      <Dialog
        open={confirmingDelete}
        title={t("settings.deleteConfirm")}
        onClose={() => setConfirmingDelete(false)}
        initialFocus={keepAccount}
        actions={
          <>
            <button
              ref={keepAccount}
              type="button"
              className="btn btn--secondary"
              onClick={() => setConfirmingDelete(false)}
            >
              {t("common.cancel")}
            </button>
            <Button variant="danger-solid" busy={busy === "delete"} busyText={t("details.deleting")} onClick={handleDelete}>
              {t("settings.deleteButton")}
            </Button>
          </>
        }
      >
        <p>{t("settings.deleteText")}</p>
      </Dialog>
    </div>
  );
}
