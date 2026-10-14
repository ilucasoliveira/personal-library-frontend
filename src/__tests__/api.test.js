import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, SESSION_EXPIRED, getBooks, saveToken, updateBook } from "../services/api";
import { setLanguage } from "../i18n";

function reply(status, body) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok: status < 400, status, json: async () => body })),
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("request", () => {
  it("manda o token e usa PATCH em /books/{id}", async () => {
    setLanguage("pt");
    saveToken("abc");
    reply(200, { id: 3 });
    await updateBook(3, { grade: null });
    const [url, options] = fetch.mock.calls[0];
    expect(url).toMatch(/\/books\/3$/);
    expect(options.method).toBe("PATCH");
    expect(options.headers.Authorization).toBe("Bearer abc");
    expect(JSON.parse(options.body)).toEqual({ grade: null });
  });

  it("traduz o erro pelo código da API", async () => {
    reply(403, { detail: "Examples cannot be deleted or updated.", code: "example_read_only" });
    const error = await updateBook(1, { favorite: true }).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe("example_read_only");
    expect(error.message).toMatch(/livro de exemplo/);
  });

  it("código desconhecido usa a mensagem da ação", async () => {
    reply(500, { detail: "boom", code: "error" });
    await expect(getBooks()).rejects.toThrow("Não foi possível carregar seus livros.");
  });

  it("401 apaga o token e avisa o app", async () => {
    saveToken("velho");
    const listener = vi.fn();
    window.addEventListener(SESSION_EXPIRED, listener);
    reply(401, { detail: "Invalid or expired session.", code: "invalid_session" });
    await getBooks().catch(() => {});
    expect(listener).toHaveBeenCalledOnce();
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("sem rede: erro de conexão", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("offline"); }));
    const error = await getBooks().catch((e) => e);
    expect(error.status).toBe(0);
    expect(error.code).toBe("network");
  });
});
