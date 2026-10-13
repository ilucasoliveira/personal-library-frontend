import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n";
import { changePassword, deleteAccount, saveToken, updateMe } from "../services/api";
import { ACCENTS, THEMES, applyAppearance, readSavedAppearance } from "../theme";
import { notify } from "../utils/notify";

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

  async function handleDelete(e) {
    e.preventDefault();
    if (!window.confirm(t("settings.deleteConfirm"))) return;
    setBusy("delete");
    try {
      await deleteAccount(deletePassword);
      onLogout();
    } catch (err) {
      notify(err.message);
      setBusy("");
    }
  }

  const customAccent = appearance.accent && !ACCENTS.includes(appearance.accent);

  return (
    <div className="page-padding" style={{ background: "var(--color-background)", minHeight: "100vh" }}>
      <div className="settings">
        <button
          onClick={onBack}
          style={{
            marginBottom: "16px",
            background: "none",
            border: "none",
            color: "var(--color-text-secondary)",
            cursor: "pointer",
            padding: 0,
            fontFamily: "var(--font-ui)",
          }}
        >
          {t("common.back")}
        </button>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text-primary)",
            fontSize: "26px",
            margin: "0 0 20px",
          }}
        >
          {t("settings.title")}
        </h1>

        {isVisitor && (
          <p className="demo-box" style={{ margin: "0 0 16px" }}>
            {t("settings.visitorNote")}
          </p>
        )}

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
                <span className="theme-card__preview" style={{ background: theme.preview[0] }}>
                  <span style={{ height: "40px", background: theme.preview[1] }} />
                  <span style={{ height: "28px", background: theme.preview[2] }} />
                  <span style={{ height: "18px", background: theme.preview[3] }} />
                </span>
                <span className="theme-card__name">{t(`theme.${theme.id}`)}</span>
              </button>
            ))}
          </div>

          <h2 style={{ marginTop: "22px" }}>{t("settings.accent")}</h2>
          <div className="swatches">
            <button
              type="button"
              className="swatch"
              aria-pressed={!appearance.accent}
              aria-label={t("settings.accentDefault")}
              title={t("settings.accentDefault")}
              onClick={() => changeAppearance({ accent: null })}
              style={{
                background: "linear-gradient(135deg, var(--color-card) 50%, var(--color-border) 50%)",
              }}
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
                style={{ background: color }}
              />
            ))}
            <label
              className="swatch swatch--custom"
              data-active={customAccent ? "true" : "false"}
              title={t("settings.accentCustom")}
              style={customAccent ? { background: appearance.accent } : undefined}
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
                  <p style={{ margin: 0, color: "var(--color-text-secondary)", fontSize: "14px" }}>{user.email}</p>
                </div>
                <button type="submit" className="btn-primary" disabled={busy === "name" || name.trim() === user.name}>
                  {t("settings.saveName")}
                </button>
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
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={busy === "password" || !passwords.current || !passwords.next}
                >
                  {t("settings.changePassword")}
                </button>
              </form>
            </section>
          </>
        )}

        <section className="settings-section">
          <button type="button" className="btn-ghost" onClick={onLogout}>
            {t("profile.logout")}
          </button>
        </section>

        {!isVisitor && (
          <section
            className="settings-section"
            aria-labelledby="delete-title"
            style={{ borderColor: "color-mix(in srgb, var(--color-error) 45%, var(--color-border))" }}
          >
            <h2 id="delete-title" style={{ color: "var(--color-error)" }}>
              {t("settings.delete")}
            </h2>
            <p style={{ margin: "0 0 12px", color: "var(--color-text-secondary)", fontSize: "14px" }}>
              {t("settings.deleteText")}
            </p>
            <form onSubmit={handleDelete} className="stack">
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
              <button type="submit" className="btn-danger" disabled={busy === "delete" || !deletePassword}>
                {t("settings.deleteButton")}
              </button>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}
