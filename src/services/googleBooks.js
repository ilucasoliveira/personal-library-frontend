// Busca de livros no catálogo: Google Books primeiro e Open Library quando o Google
// falha ou não acha nada. As duas respondem no mesmo formato para a tela de busca.
import { t } from "../i18n";

const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_KEY;

export const SOURCES = {
  google: "Google Books",
  openlibrary: "Open Library",
};

async function searchGoogle(query, startIndex, maxResults) {
  const params = new URLSearchParams({ q: query, startIndex, maxResults });
  if (API_KEY) params.set("key", API_KEY);
  const response = await fetch(`https://www.googleapis.com/books/v1/volumes?${params}`);
  if (!response.ok) throw new Error(`Google Books ${response.status}`);
  const data = await response.json();

  return {
    source: "google",
    totalItems: data.totalItems || 0,
    items: (data.items || []).map((item) => ({
      googleId: item.id,
      title: item.volumeInfo.title || t("book.untitled"),
      author: item.volumeInfo.authors?.[0] || t("book.unknownAuthor"),
      year: item.volumeInfo.publishedDate?.slice(0, 4) || "",
      cover: item.volumeInfo.imageLinks?.thumbnail?.replace("http://", "https://") || null,
      gender: item.volumeInfo.categories?.[0] || t("book.general"),
      synopsis: item.volumeInfo.description || null,
    })),
  };
}

async function searchOpenLibrary(query, offset, limit) {
  const params = new URLSearchParams({
    q: query,
    offset,
    limit,
    fields: "key,title,author_name,first_publish_year,cover_i",
  });
  const response = await fetch(`https://openlibrary.org/search.json?${params}`);
  if (!response.ok) throw new Error(`Open Library ${response.status}`);
  const data = await response.json();

  return {
    source: "openlibrary",
    totalItems: data.numFound || 0,
    items: (data.docs || []).map((doc) => ({
      googleId: `ol:${doc.key}`,
      title: doc.title || t("book.untitled"),
      author: doc.author_name?.[0] || t("book.unknownAuthor"),
      year: doc.first_publish_year ? String(doc.first_publish_year) : "",
      cover: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : null,
      gender: t("book.general"),
      synopsis: null,
    })),
  };
}

// source: a fonte usada na primeira página; as páginas seguintes continuam nela
export async function searchBooks(query, startIndex = 0, maxResults = 10, source = null) {
  if (source === "openlibrary") return searchOpenLibrary(query, startIndex, maxResults);
  if (source === "google") return searchGoogle(query, startIndex, maxResults);

  let google = null;
  try {
    google = await searchGoogle(query, startIndex, maxResults);
    if (google.items.length > 0) return google;
  } catch {
    // Google fora do ar ou sem cota: tenta a Open Library
  }

  try {
    return await searchOpenLibrary(query, startIndex, maxResults);
  } catch (error) {
    // o Google respondeu sem resultados e a Open Library falhou: vale o "sem resultado" do Google
    if (google) return google;
    throw error;
  }
}
