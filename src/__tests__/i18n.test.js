import { afterEach, expect, it } from "vitest";
import { setLanguage, t } from "../i18n";

afterEach(() => setLanguage("pt"));

it("troca {variáveis} pelo valor", () => {
  setLanguage("pt");
  expect(t("search.added", { title: "Duna" })).toBe('"Duna" adicionado à estante!');
});

it("muda de idioma e atualiza o lang da página", () => {
  setLanguage("en");
  expect(t("nav.library")).toBe("Shelf");
  expect(document.documentElement.lang).toBe("en");
});

it("chave que não existe volta a própria chave", () => {
  expect(t("nao.existe")).toBe("nao.existe");
});

it("os dois idiomas têm as mesmas chaves", async () => {
  const source = await import("../i18n.js?raw");
  const blocks = source.default.split("const en = {");
  const keys = (text) => new Set([...text.matchAll(/^\s+"([\w.]+)":/gm)].map((m) => m[1]));
  const pt = keys(blocks[0]);
  const en = keys(blocks[1]);
  expect([...pt].filter((k) => !en.has(k))).toEqual([]);
  expect([...en].filter((k) => !pt.has(k))).toEqual([]);
});
