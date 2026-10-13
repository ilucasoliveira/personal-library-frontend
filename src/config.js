// nome do app e modo demonstração (definidos por variáveis de ambiente do Vite)
export const APP_NAME = "My Own BookShelf";

export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

// credenciais públicas da demo (só aparecem quando VITE_DEMO_MODE=true)
export const DEMO_USERNAME = import.meta.env.VITE_DEMO_USERNAME || "visitante";
export const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || "biblioteca2026";
