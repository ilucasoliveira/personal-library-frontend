// nome do app e se este deploy é o público (variáveis de ambiente do Vite)
export const APP_NAME = "My Own BookShelf";

// true no deploy público: mostra "Entrar como visitante" e "Criar conta" já na primeira tela.
// A API confirma pelo /ping (campos demo e signup) assim que responde.
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";
