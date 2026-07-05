import { useState, useEffect } from "react";
import { searchGoogleBooks } from "../services/googleBooks";
import { createBook } from "../services/api";
import BookResultCard from "../components/BookResultCard";

const PAGE_SIZE = 10;

export default function SearchBooks({ onGoManual, initialQuery = ""}) {
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(Boolean(initialQuery.trim()));
    const [page, setPage] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    async function runSearch(searchQuery, pageIndex) {
        setSearching(true);
        const { items, totalItems: total } = await searchGoogleBooks(searchQuery, pageIndex * PAGE_SIZE, PAGE_SIZE);
        setResults(items);
        setTotalItems(total);
        setSearching(false);
    }

    useEffect(() => {
        if (initialQuery.trim()) {
        setPage(0);
        runSearch(initialQuery, 0);
        }
    }, []);

    async function handleSearch(e) {
        e.preventDefault();
        if (!query.trim()) return;
        setPage(0);
        await runSearch(query, 0);
    }

    async function goToPage(newPage) {
        setPage(newPage);
        await runSearch(query, newPage);
    }

    async function handleAdd(book) {
    try {
        await createBook({
        title: book.title,
        author: book.author,
        gender: book.gender,
        synopsis: book.synopsis,
        cover_url: book.cover,
        });
        alert(`"${book.title}" adicionado à biblioteca!`);
    } catch (err) {
        alert("Erro ao adicionar: " + err.message);
    }
    }

    const totalPages = Math.ceil(totalItems / PAGE_SIZE);
    const hasNext = (page + 1) * PAGE_SIZE < totalItems;
    const hasPrev = page > 0;

    return (
    <div className="page-padding" style={{ background: "var(--color-background)", minHeight: "100vh" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título, autor..."
            style={{ flex: 1, maxWidth: "400px", padding: "10px 16px", borderRadius: "var(--radius-pill)", border: "1px solid var(--color-border)", background: "var(--color-card)", color: "var(--color-text-primary)", fontFamily: "var(--font-ui)" }}
        />
        <button type="submit" style={{ background: "var(--color-primary)", color: "#241119", border: "none", borderRadius: "var(--radius-sm)", padding: "10px 20px", fontWeight: 600, cursor: "pointer" }}>
            Buscar
        </button>
        </form>

        {searching && <p style={{ color: "var(--color-text-secondary)" }}>Buscando...</p>}

        <div style={{ maxWidth: "500px" }}>
        {results.map((book) => (
            <BookResultCard key={book.googleId} book={book} onAdd={handleAdd} />
        ))}
        </div>

        {!searching && results.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginTop: "20px", maxWidth: "500px" }}>
                <button
                    onClick={() => goToPage(page - 1)}
                    disabled={!hasPrev}
                    style={{
                        background: "none",
                        border: "1px solid var(--color-border)",
                        color: hasPrev ? "var(--color-text-primary)" : "var(--color-text-muted)",
                        borderRadius: "var(--radius-sm)",
                        padding: "8px 16px",
                        cursor: hasPrev ? "pointer" : "not-allowed",
                        opacity: hasPrev ? 1 : 0.4,
                        fontFamily: "var(--font-ui)",
                    }}
                >
                    ← Anterior
                </button>

                <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--color-text-secondary)" }}>
                    Página {page + 1} de {totalPages || 1}
                </span>

                <button
                    onClick={() => goToPage(page + 1)}
                    disabled={!hasNext}
                    style={{
                        background: "none",
                        border: "1px solid var(--color-border)",
                        color: hasNext ? "var(--color-text-primary)" : "var(--color-text-muted)",
                        borderRadius: "var(--radius-sm)",
                        padding: "8px 16px",
                        cursor: hasNext ? "pointer" : "not-allowed",
                        opacity: hasNext ? 1 : 0.4,
                        fontFamily: "var(--font-ui)",
                    }}
                >
                    Próxima →
                </button>
            </div>
        )}

        {!searching && results.length === 0 && query && (
        <div style={{ maxWidth: "500px", textAlign: "center", marginTop: "20px" }}>
            <p style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-display)", fontStyle: "italic" }}>
            Esse título não está no nosso banco de dados — mas isso não significa que ele não mereça um lugar na sua estante.
            </p>
            <button
            onClick={() => onGoManual(query)}
            style={{ background: "var(--color-primary)", color: "#241119", border: "none", borderRadius: "var(--radius-sm)", padding: "10px 20px", fontWeight: 600, cursor: "pointer" }}
            >
            Adicionar manualmente
            </button>
        </div>
        )}
    </div>
    );
}