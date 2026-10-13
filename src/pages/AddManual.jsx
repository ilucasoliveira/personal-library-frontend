import { useState } from "react";
import { createBook } from "../services/api";
import { notify } from "../utils/notify";
import { useI18n } from "../i18n";

export default function AddManual({ onCreated, onCancel, initialTitle = "" }) {
  const { t } = useI18n();
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
    try {
      const created = await createBook({
        ...form,
        cover_url: form.cover_url || null,
        synopsis: form.synopsis || null,
      });
      onCreated(created);
    } catch (err) {
      notify(err.message);
    }
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
        {t("common.back")}
      </button>

      <h1
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-text-primary)",
          marginBottom: "24px",
        }}
      >
        {t("manual.title")}
      </h1>

      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>{t("manual.name")}</label>
        <input
          style={inputStyleFor("title")}
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder={errors.title ? t("manual.required") : ""}
        />
        {errors.title && (
          <p style={errorTextStyle}>{t("manual.titleError")}</p>
        )}

        <label style={labelStyle}>{t("manual.author")}</label>
        <input
          style={inputStyleFor("author")}
          value={form.author}
          onChange={(e) => updateField("author", e.target.value)}
          placeholder={errors.author ? t("manual.required") : ""}
        />
        {errors.author && (
          <p style={errorTextStyle}>{t("manual.authorError")}</p>
        )}

        <label style={labelStyle}>{t("manual.gender")}</label>
        <input
          style={inputStyleFor("gender")}
          value={form.gender}
          onChange={(e) => updateField("gender", e.target.value)}
          placeholder={errors.gender ? t("manual.required") : ""}
        />
        {errors.gender && (
          <p style={errorTextStyle}>{t("manual.genderError")}</p>
        )}

        <label style={labelStyle}>{t("manual.cover")}</label>
        <input
          style={inputStyleFor()}
          value={form.cover_url}
          onChange={(e) => updateField("cover_url", e.target.value)}
          placeholder="https://..."
        />

        <label style={labelStyle}>{t("manual.synopsis")}</label>
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
            color: "var(--color-on-primary)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            padding: "10px 24px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {t("manual.submit")}
        </button>
      </form>
    </div>
  );
}
