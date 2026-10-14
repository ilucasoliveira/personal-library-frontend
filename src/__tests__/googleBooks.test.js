import { afterEach, describe, expect, it, vi } from "vitest";
import { searchBooks } from "../services/googleBooks";

const googleHit = { totalItems: 1, items: [{ id: "g1", volumeInfo: { title: "Duna", authors: ["Frank Herbert"] } }] };
const olHit = { numFound: 1, docs: [{ key: "/works/OL1W", title: "Dune", author_name: ["Frank Herbert"], cover_i: 7 }] };

function mockFetch({ google, ol }) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url) => {
      const reply = url.includes("googleapis") ? google : ol;
      if (reply instanceof Error) throw reply;
      if (typeof reply === "number") return { ok: false, status: reply, json: async () => ({}) };
      return { ok: true, status: 200, json: async () => reply };
    }),
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("searchBooks", () => {
  it("usa o Google Books quando ele responde", async () => {
    mockFetch({ google: googleHit, ol: olHit });
    const result = await searchBooks("duna");
    expect(result.source).toBe("google");
    expect(result.items[0]).toMatchObject({ title: "Duna", author: "Frank Herbert" });
  });

  it("cai na Open Library quando o Google falha", async () => {
    mockFetch({ google: 503, ol: olHit });
    const result = await searchBooks("duna");
    expect(result.source).toBe("openlibrary");
    expect(result.items[0].cover).toBe("https://covers.openlibrary.org/b/id/7-L.jpg");
  });

  it("Google vazio e Open Library fora: vale o vazio do Google", async () => {
    mockFetch({ google: { totalItems: 0 }, ol: 500 });
    const result = await searchBooks("xyz");
    expect(result).toMatchObject({ source: "google", items: [] });
  });

  it("as duas fora: é erro, não 'sem resultado'", async () => {
    mockFetch({ google: new TypeError("offline"), ol: 500 });
    await expect(searchBooks("duna")).rejects.toThrow();
  });
});
