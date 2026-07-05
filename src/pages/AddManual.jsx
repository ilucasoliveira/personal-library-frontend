import { useState } from "react";
import { createBook } from "../services/api";

export default function AddManual({ onCreated, onCancel, initialTitle=""}) {
    const [form, setForm] = useState({
    title: initialTitle,
    author: "",
    gender: "",
    synopsis: "",
    cover_url: "",
    });

    const inputStyle = {
    width: "100%",
    maxWidth: "400px",
    background: "var(--color-card)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-sm)",
    padding: "10px 14px",
    color: "var(--color-text-primary)",
    fontFamily: "var(--font-ui)",
    marginBottom: "14px",
    display: "block",
    };

    const labelStyle = {
    display: "block",
    fontSize: "12px",
    color: "var(--color-text-secondary)",
    marginBottom: "6px",
    };

    async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.author || !form.gender) {
        alert("Título, autor e gênero são obrigatórios.");
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
    <div className="page-padding" style={{ background: "var(--color-background)", minHeight: "100vh", fontFamily: "var(--font-ui)" }}>
        <button onClick={onCancel} style={{ marginBottom: "20px", background: "none", border: "none", color: "var(--color-text-secondary)", cursor: "pointer" }}>
        ← Voltar
        </button>

        <h1 style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)", marginBottom: "24px" }}>
        Conte-me sobre esse livro
        </h1>

        <form onSubmit={handleSubmit}>
        <label style={labelStyle}>Nome do livro *</label>
        <input style={inputStyle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />

        <label style={labelStyle}>Autor *</label>
        <input style={inputStyle} value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />

        <label style={labelStyle}>Gênero *</label>
        <input style={inputStyle} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} />

        <label style={labelStyle}>URL da capa (opcional)</label>
        <input style={inputStyle} value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} placeholder="https://..." />

        <label style={labelStyle}>Sinopse (opcional)</label>
        <textarea
            style={{ ...inputStyle, fontFamily: "var(--font-reading)" }}
            rows={4}
            value={form.synopsis}
            onChange={(e) => setForm({ ...form, synopsis: e.target.value })}
        />

        <button type="submit" style={{ marginTop: "10px", background: "var(--color-primary)", color: "#241119", border: "none", borderRadius: "var(--radius-sm)", padding: "10px 24px", fontWeight: 600, cursor: "pointer" }}>
            Salvar na estante
        </button>
        </form>
    </div>
    );
}