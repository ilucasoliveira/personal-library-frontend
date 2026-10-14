import { useEffect, useRef, useState } from "react";
import { APP_NAME, DEMO_MODE } from "../config";
import { useI18n } from "../i18n";
import { login, loginAsVisitor, ping, register } from "../services/api";

function EyeIcon({ open }) {
  return open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" aria-hidden="true">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5 0-9.27-3.11-11-8 .77-2.19 2.15-4.1 3.94-5.5M9.9 4.24A9.12 9.12 0 0 1 12 4c5 0 9.27 3.11 11 8a13.16 13.16 0 0 1-1.67 2.68M14.12 14.12A3 3 0 1 1 9.88 9.88" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function Login({ onLogin, notice }) {
  const { lang, t, setLanguage } = useI18n();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [waking, setWaking] = useState(false);
  // o deploy público já começa mostrando visitante e cadastro; o /ping confirma
  const [flags, setFlags] = useState({ demo: DEMO_MODE, signup: DEMO_MODE });
  const wakingTimer = useRef(0);

  useEffect(() => {
    // também acorda a API do Render enquanto a pessoa digita
    ping()
      .then((data) => setFlags({ demo: Boolean(data.demo), signup: Boolean(data.signup) }))
      .catch(() => {});
    return () => clearTimeout(wakingTimer.current);
  }, []);

  async function run(action) {
    setError("");
    setLoading(true);
    // se a resposta demorar, provavelmente o servidor gratuito está acordando
    wakingTimer.current = setTimeout(() => setWaking(true), 4000);
    try {
      const session = await action();
      onLogin(session);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    } finally {
      clearTimeout(wakingTimer.current);
      setWaking(false);
    }
  }

  function validateRegister() {
    if (!name.trim()) return t("err.nameRequired");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return t("err.invalidEmail");
    if (password.length < 8) return t("err.shortPassword");
    if (new TextEncoder().encode(password).length > 72) return t("err.longPassword");
    return "";
  }

  const isRegister = mode === "register" && flags.signup;

  function handleSubmit(e) {
    e.preventDefault();
    if (isRegister) {
      const problem = validateRegister();
      if (problem) {
        setError(problem);
        return;
      }
      run(() => register({ name: name.trim(), email: email.trim(), password, language: lang }));
    } else {
      run(() => login(email.trim(), password));
    }
  }

  function switchMode(next) {
    setMode(next);
    setError("");
  }

  return (
    <main className="auth-page twilight-hero-bg">
      <div className="auth-card">
        <div className="auth-card__top">
          <div className="seg" role="group" aria-label={t("settings.language")}>
            {["pt", "en"].map((code) => (
              <button key={code} type="button" aria-pressed={lang === code} onClick={() => setLanguage(code)}>
                {code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <h1 className="nav-brand auth-card__brand">
          <svg className="moon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2a10 10 0 1 0 9.8 12.1A8 8 0 0 1 12 2Z" />
          </svg>
          {APP_NAME}
        </h1>
        <p className="auth-card__tagline">{t("auth.tagline")}</p>

        {notice && (
          <p className="form-error" role="status">
            {notice}
          </p>
        )}

        {flags.signup && (
          <div className="seg seg--block auth-card__modes" role="group" aria-label={t("auth.mode")}>
            <button type="button" aria-pressed={!isRegister} onClick={() => switchMode("login")}>
              {t("auth.login")}
            </button>
            <button type="button" aria-pressed={isRegister} onClick={() => switchMode("register")}>
              {t("auth.register")}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {isRegister && (
            <div>
              <label className="field-label" htmlFor="auth-name">
                {t("auth.name")}
              </label>
              <input
                id="auth-name"
                className="field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                maxLength={60}
              />
            </div>
          )}

          <div>
            <label className="field-label" htmlFor="auth-email">
              {t("auth.email")}
            </label>
            <input
              id="auth-email"
              className="field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="auth-password">
              {t("auth.password")}
            </label>
            <div className="password-field">
              <input
                id="auth-password"
                className="field"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isRegister ? "new-password" : "current-password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={t("auth.showPassword")}
                aria-pressed={showPassword}
                className="password-field__toggle"
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
            {isRegister && <p className="field-hint">{t("auth.passwordHint")}</p>}
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {waking && <p className="field-hint">{t("auth.waking")}</p>}

          <button type="submit" className="btn btn--primary auth-card__submit" disabled={loading}>
            {loading
              ? isRegister
                ? t("auth.creating")
                : t("auth.loggingIn")
              : isRegister
                ? t("auth.register")
                : t("auth.login")}
          </button>
        </form>

        {flags.demo && (
          <div className="demo-box">
            <strong className="demo-box__title">{t("auth.demoTitle")}</strong>
            <p className="demo-box__text">{t("auth.demoText")}</p>
            <button type="button" disabled={loading} onClick={() => run(loginAsVisitor)}>
              {t("auth.visitor")}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
