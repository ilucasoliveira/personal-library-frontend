import { defineConfig, devices } from "@playwright/test";

// Testes de ponta a ponta: o app de verdade (build de produção) com a API simulada
// em e2e/mock-api.js. Não precisa de banco nem de servidor Python.
export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:4180",
    locale: "pt-BR",
    trace: "retain-on-failure",
    // na máquina sem o Chromium do Playwright, aponte CHROMIUM_PATH para outro Chromium
    launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    { name: "celular", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    // o build aponta para uma API inexistente (http://api.test), que o e2e/mock-api.js intercepta
    command: "npx vite build --outDir dist-e2e && npx vite preview --outDir dist-e2e --port 4180 --strictPort",
    env: { VITE_API_URL: "http://api.test", VITE_DEMO_MODE: "true" },
    port: 4180,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
