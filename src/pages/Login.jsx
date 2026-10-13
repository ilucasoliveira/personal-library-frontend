import { useState } from "react";
import { APP_NAME, DEMO_MODE, DEMO_USERNAME, DEMO_PASSWORD } from "../config";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    login(username, password);
  }

  function handleDemoLogin() {
    setUsername(DEMO_USERNAME);
    setPassword(DEMO_PASSWORD);
    login(DEMO_USERNAME, DEMO_PASSWORD);
  }

  async function login(user, pass) {
    setError("");
    setLoading(true);

    const token = btoa(`${user}:${pass}`);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
        headers: { Authorization: `Basic ${token}` },
      });

      if (!response.ok) {
        throw new Error("Usuário ou senha incorretos.");
      }

      onLogin(token);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Não foi possível falar com o servidor. Ele pode estar acordando; tente de novo em alguns segundos."
          : err.message,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="twilight-hero-bg"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-ui)",
        padding: "20px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "var(--color-card)",
          padding: "40px",
          borderRadius: "var(--radius-lg)",
          width: "100%",
          maxWidth: "360px",
          boxShadow: "var(--shadow-modal)",
        }}
      >
        <h1
          className="nav-brand"
          style={{
            justifyContent: "center",
            fontSize: "22px",
            margin: "0 0 28px",
          }}
        >
          <svg
            className="moon"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: "18px", height: "18px" }}
          >
            <path d="M12 2a10 10 0 1 0 9.8 12.1A8 8 0 0 1 12 2Z" />
          </svg>
          {APP_NAME}
        </h1>

        {DEMO_MODE && (
          <div
            style={{
              marginBottom: "24px",
              padding: "14px 16px",
              borderRadius: "var(--radius-sm)",
              border: "1px dashed rgba(232, 196, 104, 0.45)",
              background: "rgba(232, 196, 104, 0.06)",
              fontSize: "13px",
              lineHeight: 1.55,
              color: "var(--color-text-secondary)",
            }}
          >
            <span className="example-badge" style={{ marginBottom: "8px" }}>
              Demo pública
            </span>
            <p style={{ margin: "8px 0 10px" }}>
              Explore uma estante de exemplo e adicione seus próprios livros.
              Os livros que você criar somem depois de um dia.
            </p>
            <p
              style={{
                margin: "0 0 12px",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--color-text-primary)",
              }}
            >
              usuário: {DEMO_USERNAME}
              <br />
              senha: {DEMO_PASSWORD}
            </p>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              style={{
                width: "100%",
                padding: "9px",
                background: "transparent",
                color: "var(--color-accent)",
                border: "1px solid rgba(232, 196, 104, 0.6)",
                borderRadius: "var(--radius-sm)",
                fontWeight: 600,
                cursor: loading ? "default" : "pointer",
              }}
            >
              Entrar como visitante
            </button>
          </div>
        )}

        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Usuário"
          autoFocus
          style={{
            width: "100%",
            padding: "10px 14px",
            marginBottom: "12px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--color-border)",
            background: "var(--color-background)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-ui)",
          }}
        />

        <div style={{ position: "relative", marginBottom: "16px" }}>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            style={{
              width: "100%",
              padding: "10px 42px 10px 14px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-border)",
              background: "var(--color-background)",
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-ui)",
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              color: "var(--color-text-muted)",
            }}
          >
            {showPassword ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="18"
                height="18"
              >
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5 0-9.27-3.11-11-8 .77-2.19 2.15-4.1 3.94-5.5M9.9 4.24A9.12 9.12 0 0 1 12 4c5 0 9.27 3.11 11 8a13.16 13.16 0 0 1-1.67 2.68M14.12 14.12A3 3 0 1 1 9.88 9.88" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="18"
                height="18"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>

        {error && (
          <p
            style={{
              color: "var(--color-error)",
              fontSize: "13px",
              marginBottom: "12px",
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            background: "var(--color-primary)",
            color: "#241119",
            border: "none",
            borderRadius: "var(--radius-sm)",
            fontWeight: 600,
            cursor: loading ? "default" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
