const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_KEY;

export async function searchGoogleBooks(query, startIndex = 0, maxResults = 10) {
    const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${maxResults}&key=${API_KEY}`
    );
    const data = await response.json();

    return {
        items: (data.items || []).map((item) => ({
            googleId: item.id,
            title: item.volumeInfo.title || "Sem título",
            author: item.volumeInfo.authors?.[0] || "Autor desconhecido",
            year: item.volumeInfo.publishedDate?.slice(0, 4) || "",
            cover: item.volumeInfo.imageLinks?.thumbnail || null,
            gender: item.volumeInfo.categories?.[0] || "Geral",
            synopsis: item.volumeInfo.description || null,
        })),
        totalItems: data.totalItems || 0,
    };
}