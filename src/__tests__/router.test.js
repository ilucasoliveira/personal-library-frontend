import { describe, expect, it } from "vitest";
import { matchRoute } from "../router";

describe("matchRoute", () => {
  it.each([
    ["/", { name: "library" }],
    ["/livro/42", { name: "book", id: 42 }],
    ["/livro/42/", { name: "book", id: 42 }],
    ["/adicionar", { name: "add" }],
    ["/adicionar/manual", { name: "addManual" }],
    ["/perfil", { name: "profile" }],
    ["/configuracoes", { name: "settings" }],
  ])("%s", (path, expected) => {
    expect(matchRoute(path)).toEqual(expected);
  });

  it("rota desconhecida ou id inválido vira notFound", () => {
    expect(matchRoute("/livro/abc").name).toBe("notFound");
    expect(matchRoute("/qualquer").name).toBe("notFound");
  });
});
