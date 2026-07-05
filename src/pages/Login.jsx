import { useState } from "react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const token = btoa(`${username}:${password}`);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
        headers: { Authorization: `Basic ${token}` },
      });

      if (!response.ok) {
        throw new Error("Usuário ou senha incorretos.");
      }

      onLogin(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-background)",
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
        Biblioteca do Thur
      </h1>

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

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          style={{
            width: "100%",
            padding: "10px 14px",
            marginBottom: "16px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--color-border)",
            background: "var(--color-background)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-ui)",
          }}
        />

        {error && (
          <p style={{ color: "var(--color-error)", fontSize: "13px", marginBottom: "12px" }}>
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
