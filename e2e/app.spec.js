import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { enterAsVisitor } from "./mock-api";

// falha se o axe achar problema de acessibilidade crítico ou sério
async function expectAccessible(page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  const serious = violations.filter((v) => ["critical", "serious"].includes(v.impact));
  expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  await enterAsVisitor(page);
});

test("estante: resumo, abas e busca na URL", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1, name: "Estante" })).toBeVisible();
  await expect(page.locator(".page-summary")).toContainText("4 livros");
  await expectAccessible(page);

  await page.getByRole("button", { name: /^Lidos/ }).click();
  await expect(page).toHaveURL(/aba=lidos/);
  await expect(page.locator(".book-card")).toHaveCount(2);

  await page.getByRole("searchbox", { name: "Buscar na estante" }).fill("orwell");
  await expect(page).toHaveURL(/q=orwell/);
  await expect(page.locator(".book-card")).toHaveCount(1);
});

test("livro: abre pelo teclado, Voltar e link direto", async ({ page }) => {
  const card = page.getByRole("link", { name: /Duna/ }).first();
  await card.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/livro\/2$/);
  await expect(page.getByRole("heading", { level: 1, name: "Duna" })).toBeVisible();
  await expectAccessible(page);

  await page.goBack();
  await expect(page).toHaveURL(/\/$/);

  await page.goto("/livro/3");
  await expect(page.getByRole("heading", { level: 1, name: "1984" })).toBeVisible();
});

test("adicionar do catálogo, mudar a nota e desfazer a exclusão", async ({ page }) => {
  await page.goto("/adicionar?q=vento");
  await expect(page.locator(".result")).toHaveCount(1);
  await expectAccessible(page);
  await page.getByRole("button", { name: "Adicionar “O Nome do Vento” como Quero ler" }).click();
  await page.getByRole("link", { name: "Ver livro" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "O Nome do Vento" })).toBeVisible();

  await page.getByRole("button", { name: "Nota 4 de 5" }).click();
  await expect(page.getByRole("button", { name: "Nota 4 de 5" })).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Mais ações" }).click();
  await page.getByRole("button", { name: "Excluir livro" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Excluir" }).click();
  // excluir volta para a tela anterior (aqui, a busca); o aviso com "Desfazer" vem junto
  await expect(page).toHaveURL(/\/adicionar\?q=vento/);
  await page.getByRole("link", { name: "Estante" }).first().click();
  await expect(page.locator(".book-card", { hasText: "O Nome do Vento" })).toHaveCount(0);
  await page.getByRole("button", { name: "Desfazer" }).click();
  await expect(page.locator(".book-card", { hasText: "O Nome do Vento" })).toHaveCount(1);
});

test("livro de exemplo é só leitura e o aviso vem do código do erro", async ({ page }) => {
  await page.getByRole("button", { name: "Favorito: Duna" }).click();
  await expect(page.locator(".toast")).toContainText("livro de exemplo");
  await expect(page.getByRole("button", { name: "Favorito: Duna" })).toHaveAttribute("aria-pressed", "false");
});

test("perfil e configurações sem problemas de acessibilidade", async ({ page }) => {
  await page.goto("/perfil");
  await expect(page.locator(".profile-numbers")).toContainText("Lidos em");
  await expectAccessible(page);
  await page.goto("/configuracoes");
  await expect(page.getByRole("heading", { level: 1, name: "Configurações" })).toBeVisible();
  await expectAccessible(page);
});
