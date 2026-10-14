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

  // nota em quartos de estrela: arrastar até 3/4 da quarta estrela dá 3,75
  await page.getByRole("button", { name: "Dar nota" }).click();
  const dialog = page.getByRole("dialog", { name: "Qual a sua nota para O Nome do Vento?" });
  const slider = dialog.getByRole("slider", { name: "Nota de 0,25 a 5" });
  await expect(slider).toBeFocused();
  await expectAccessible(page);
  const first = await slider.locator(".star").nth(0).boundingBox();
  const fourth = await slider.locator(".star").nth(3).boundingBox();
  const y = fourth.y + fourth.height / 2;
  await page.mouse.move(first.x + 2, y);
  await page.mouse.down();
  await page.mouse.move(fourth.x + fourth.width * 0.7, y, { steps: 8 });
  await page.mouse.up();
  await expect(slider).toHaveAttribute("aria-valuetext", "3,75 de 5 estrelas");
  // teclado: seta para a direita sobe 0,25
  await slider.press("ArrowRight");
  await expect(slider).toHaveAttribute("aria-valuenow", "4");
  await slider.press("ArrowLeft");
  await dialog.getByRole("button", { name: "Salvar nota" }).click();
  await expect(page.getByRole("button", { name: "Nota 3,75 de 5. Mudar a nota" })).toBeVisible();

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
