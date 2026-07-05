import { useState } from "react";
import { updateProfile, uploadProfilePhoto } from "../services/api";

export default function Profile({ books, profile, onProfileUpdated, onLogout }) {
    const [photoUrl, setPhotoUrl] = useState(profile?.photo_url || "");

    async function handleSavePhoto() {
        const updated = await updateProfile({ photo_url: photoUrl });
        onProfileUpdated(updated);
    }

    async function handleFileChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        const updated = await uploadProfilePhoto(file);
        onProfileUpdated(updated);
        setPhotoUrl(updated.photo_url);
    }

    function handleLogoutClick() {
        const confirmed = window.confirm("Tem certeza que deseja sair?");
        if (!confirmed) return;
        onLogout();
    }

    const totalRead = books.filter((b) => b.reading_status === "read").length;
    const totalBooks = books.length;

    const ratedBooks = books.filter((b) => b.grade);
    const avgRating = ratedBooks.length
    ? (ratedBooks.reduce((sum, b) => sum + b.grade, 0) / ratedBooks.length).toFixed(1)
    : "—";

    const genderCounts = books.reduce((acc, b) => {
    acc[b.gender] = (acc[b.gender] || 0) + 1;
    return acc;
    }, {});
    const favoriteGender = Object.keys(genderCounts).length
    ? Object.entries(genderCounts).sort((a, b) => b[1] - a[1])[0][0]
    : "—";

    const readBooks = books.filter((b) => b.reading_status === "read");
    const authorCounts = readBooks.reduce((acc, b) => {
        acc[b.author] = (acc[b.author] || 0) + 1;
    return acc;
    }, {});
    const topAuthor = Object.keys(authorCounts).length
    ? Object.entries(authorCounts).sort((a, b) => b[1] - a[1])[0][0]
    : "—";

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentlyReadingCount = books.filter((b) => b.reading_status === "reading").length;

    const readThisMonth = books.filter((b) => {
        if (!b.finished_date) return false;
        const finished = new Date(b.finished_date + "T00:00:00");
        return finished.getFullYear() === currentYear && finished.getMonth() === currentMonth;
    }).length;

    const readThisYear = books.filter((b) => {
        if (!b.finished_date) return false;
        const finished = new Date(b.finished_date + "T00:00:00");
        return finished.getFullYear() === currentYear;
    }).length;

    const stats = [
    { label: "Livros lidos", value: totalRead },
    { label: "Lendo agora", value: currentlyReadingCount },
    { label: "Autor mais lido", value: topAuthor },
    { label: "Gênero favorito", value: favoriteGender },
    { label: "Total na estante", value: totalBooks },
    { label: "Nota média", value: avgRating },
    { label: "Lidos este mês", value: readThisMonth },
    { label: "Lidos este ano", value: readThisYear },
    ];

    return (
    <div style={{ padding: "40px", background: "var(--color-background)", minHeight: "100vh", fontFamily: "var(--font-ui)" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            backgroundImage: photoUrl ? `url(${photoUrl})` : "linear-gradient(155deg, var(--color-primary), var(--color-secondary))",
            backgroundSize: "cover",
            backgroundPosition: "center",
            margin: "0 auto 16px",
        }} />
        <h1 style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)", margin: 0, fontSize: "26px" }}>
            A biblioteca de Thur
        </h1>
        <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--color-text-secondary)", marginTop: "8px" }}>
            "Livro favorito: Heartstopper"
        </p>

        <div style={{ maxWidth: "300px", margin: "16px auto 0", textAlign: "center" }}>
            <label style={{ background: "var(--color-primary)", color: "#241119", border: "none", borderRadius: "var(--radius-sm)", padding: "8px 16px", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "inline-block" }}>
                Escolher foto
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
            </label>
        </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", maxWidth: "400px", margin: "0 auto 32px" }}>
        {stats.map((stat) => (
        <div key={stat.label} style={{ background: "var(--color-card)", borderRadius: "var(--radius-sm)", padding: "16px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "var(--color-accent)" }}>{stat.value}</div>
        <div style={{ fontSize: "11px", color: "var(--color-text-muted)", textTransform: "uppercase", marginTop: "4px" }}>{stat.label}</div>
        </div>
        ))}
        </div>

        <div style={{
        maxWidth: "400px",
        margin: "0 auto",
        border: "1px dashed var(--color-border)",
        borderRadius: "var(--radius-sm)",
        padding: "16px 20px",
        fontFamily: "var(--font-mono)",
        fontSize: "12px",
        color: "var(--color-text-muted)",
        lineHeight: 1.8,
        }}>
        <b style={{ display: "block", color: "var(--color-text-secondary)", fontSize: "10px", textTransform: "uppercase", marginBottom: "6px" }}>
            Ficha do leitor
        </b>
        Personagem favorito: Charlie<br />
        Série favorita: The Vampire Diaries<br />
        Cores favoritas: Rosa &amp; Azul<br />
        Artista favorita: Taylor Swift
        </div>

        <div style={{ maxWidth: "400px", margin: "24px auto 0", textAlign: "center" }}>
        <button
            onClick={handleLogoutClick}
            style={{
                background: "none",
                border: "1px solid var(--color-error)",
                color: "var(--color-error)",
                borderRadius: "var(--radius-sm)",
                padding: "8px 20px",
                fontSize: "13px",
                cursor: "pointer",
                fontFamily: "var(--font-ui)",
            }}
        >
            Sair da conta
        </button>
        </div>
    </div>
    );
}