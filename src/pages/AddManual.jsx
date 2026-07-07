import { useState } from "react";
import { createBook } from "../services/api";

export default function AddManual({ onCreated, onCancel, initialTitle = "" }) {
  const [form, setForm] = useState({
    title: initialTitle,
    author: "",
    gender: "",
    synopsis: "",
    cover_url: "",
  });
  const [errors, setErrors] = useState({});

  function inputStyleFor(field) {
    return {
      width: "100%",
      maxWidth: "400px",
      background: "var(--color-card)",
      border: errors[field]
        ? "1px solid var(--color-warning)"
        : "1px solid var(--color-border)",
      borderRadius: "var(--radius-sm)",
      padding: "10px 14px",
      color: "var(--color-text-primary)",
      fontFamily: "var(--font-ui)",
      marginBottom: errors[field] ? "6px" : "14px",
      display: "block",
    };
  }

  const labelStyle = {
    display: "block",
    fontSize: "12px",
    color: "var(--color-text-secondary)",
    marginBottom: "6px",
  };

  const errorTextStyle = {
    fontSize: "12px",
    color: "var(--color-warning)",
    margin: "0 0 14px",
  };

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: false }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {
      title: !form.title.trim(),
      author: !form.author.trim(),
      gender: !form.gender.trim(),
    };
    if (newErrors.title || newErrors.author || newErrors.gender) {
      setErrors(newErrors);
      return;
    }
    const created = await createBook({
      ...form,
      cover_url: form.cover_url || null,
      synopsis: form.synopsis || null,
    });
    onCreated(created);
  }

  return (
    <div
      className="page-padding"
      style={{
        background: "var(--color-background)",
        minHeight: "100vh",
        fontFamily: "var(--font-ui)",
      }}
    >
      <button
        onClick={onCancel}
        style={{
          marginBottom: "20px",
          background: "none",
          border: "none",
          color: "var(--color-text-secondary)",
          cursor: "pointer",
        }}
      >
        ← Voltar
      </button>

      <h1
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-text-primary)",
          marginBottom: "24px",
        }}
      >
        Conte-me sobre esse livro
      </h1>

      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>Nome do livro *</label>
        <input
          style={inputStyleFor("title")}
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder={errors.title ? "obrigatório" : ""}
        />
        {errors.title && (
          <p style={errorTextStyle}>Escreva o título para continuar.</p>
        )}

        <label style={labelStyle}>Autor *</label>
        <input
          style={inputStyleFor("author")}
          value={form.author}
          onChange={(e) => updateField("author", e.target.value)}
          placeholder={errors.author ? "obrigatório" : ""}
        />
        {errors.author && (
          <p style={errorTextStyle}>Escreva o autor para continuar.</p>
        )}

        <label style={labelStyle}>Gênero *</label>
        <input
          style={inputStyleFor("gender")}
          value={form.gender}
          onChange={(e) => updateField("gender", e.target.value)}
          placeholder={errors.gender ? "obrigatório" : ""}
        />
        {errors.gender && (
          <p style={errorTextStyle}>Escolha um gênero para continuar.</p>
        )}

        <label style={labelStyle}>URL da capa (opcional)</label>
        <input
          style={inputStyleFor()}
          value={form.cover_url}
          onChange={(e) => updateField("cover_url", e.target.value)}
          placeholder="https://..."
        />

        <label style={labelStyle}>Sinopse (opcional)</label>
        <textarea
          style={{ ...inputStyleFor(), fontFamily: "var(--font-reading)" }}
          rows={4}
          value={form.synopsis}
          onChange={(e) => updateField("synopsis", e.target.value)}
        />

        <button
          type="submit"
          style={{
            marginTop: "10px",
            background: "var(--color-primary)",
            color: "#241119",
            border: "none",
            borderRadius: "var(--radius-sm)",
            padding: "10px 24px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Salvar na estante
        </button>
      </form>
    </div>
  );
}
