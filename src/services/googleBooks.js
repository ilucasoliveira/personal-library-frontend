import { t } from "../i18n";

const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_KEY;

export async function searchGoogleBooks(
  query,
  startIndex = 0,
  maxResults = 10,
) {
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${maxResults}&key=${API_KEY}`,
  );
  if (!response.ok) throw new Error(`Google Books ${response.status}`);
  const data = await response.json();

  return {
    items: (data.items || []).map((item) => ({
      googleId: item.id,
      title: item.volumeInfo.title || t("book.untitled"),
      author: item.volumeInfo.authors?.[0] || t("book.unknownAuthor"),
      year: item.volumeInfo.publishedDate?.slice(0, 4) || "",
      cover:
        item.volumeInfo.imageLinks?.thumbnail?.replace("http://", "https://") ||
        null,
      gender: item.volumeInfo.categories?.[0] || t("book.general"),
      synopsis: item.volumeInfo.description || null,
    })),
    totalItems: data.totalItems || 0,
  };
}
