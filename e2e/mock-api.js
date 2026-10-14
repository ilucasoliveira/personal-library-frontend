// API falsa para os testes de ponta a ponta: guarda os livros em memória e responde
// no mesmo formato da API real (inclusive {"detail", "code"} nos erros).
const API = "http://api.test";
const today = () => new Date().toISOString().slice(0, 10);

const visitor = {
  id: 1,
  name: "Visitante",
  email: "visitor@demo.local",
  photo_url: null,
  theme: "twilight",
  accent: null,
  language: "pt",
  is_visitor: true,
  created_at: "2026-01-10T12:00:00Z",
};

function example(id, title, author, gender, extra = {}) {
  return {
    id,
    title,
    author,
    gender,
    cover_url: null,
    synopsis: `Sinopse de ${title}.`,
    grade: null,
    comment: null,
    reading_status: "toRead",
    favorite: false,
    add_date: "2026-03-01",
    finished_date: null,
    is_example: true,
    ...extra,
  };
}

export async function mockApi(page) {
  let nextId = 100;
  const books = [
    example(1, "Dom Casmurro", "Machado de Assis", "Romance", { reading_status: "read", grade: 5, finished_date: "2026-03-20", favorite: true }),
    example(2, "Duna", "Frank Herbert", "Ficção científica", { reading_status: "reading" }),
    example(3, "1984", "George Orwell", "Distopia", { reading_status: "read", grade: 4, finished_date: "2026-07-02" }),
    example(4, "Frankenstein", "Mary Shelley", "Terror"),
  ];

  const json = (route, status, body) =>
    route.fulfill({
      status,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: body === undefined ? "" : JSON.stringify(body),
    });
  const fail = (route, status, code, detail) => json(route, status, { detail, code });

  await page.route(`${API}/**`, async (route) => {
    const request = route.request();
    const method = request.method();
    const path = new URL(request.url()).pathname;

    if (method === "OPTIONS") {
      return route.fulfill({
        status: 204,
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "*",
          "access-control-allow-headers": "*",
        },
      });
    }
    if (path === "/ping") return json(route, 200, { status: "ok", demo: true, signup: false });
    if (path === "/auth/visitor") return json(route, 200, { access_token: "e2e-token", user: visitor });
    if (path === "/me") return json(route, 200, visitor);
    if (path === "/books" && method === "GET") return json(route, 200, books);
    if (path === "/books" && method === "POST") {
      const book = {
        ...example(nextId++, "", "", ""),
        ...request.postDataJSON(),
        is_example: false,
        add_date: today(),
      };
      if (book.reading_status === "read") book.finished_date = today();
      books.push(book);
      return json(route, 201, book);
    }

    const match = path.match(/^\/books\/(\d+)$/);
    if (match) {
      const book = books.find((b) => b.id === Number(match[1]));
      if (!book) return fail(route, 404, "book_not_found", "Book not found.");
      if (method === "GET") return json(route, 200, book);
      if (book.is_example) return fail(route, 403, "example_read_only", "Examples cannot be deleted or updated.");
      if (method === "PATCH" || method === "PUT") {
        const changes = request.postDataJSON();
        if ("reading_status" in changes && changes.reading_status !== book.reading_status) {
          book.finished_date = changes.reading_status === "read" ? today() : null;
        }
        Object.assign(book, changes);
        return json(route, 200, book);
      }
      if (method === "DELETE") {
        books.splice(books.indexOf(book), 1);
        return json(route, 204);
      }
    }
    return fail(route, 404, "not_found", "Not Found");
  });

  // catálogos externos e capas também ficam fora da rede
  await page.route("https://www.googleapis.com/**", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        totalItems: 1,
        items: [{ id: "g1", volumeInfo: { title: "O Nome do Vento", authors: ["Patrick Rothfuss"], publishedDate: "2007" } }],
      }),
    }),
  );
  await page.route("https://openlibrary.org/**", (route) =>
    route.fulfill({ contentType: "application/json", body: JSON.stringify({ numFound: 0, docs: [] }) }),
  );
  await page.route("https://covers.openlibrary.org/**", (route) => route.abort());

  return { books };
}

export async function enterAsVisitor(page) {
  await mockApi(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Entrar como visitante" }).click();
  await page.locator(".book-card").first().waitFor();
}
