import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// fontes servidas pelo próprio site (o navegador baixa só os alfabetos que a página usa)
import "@fontsource-variable/fraunces";
import "@fontsource-variable/fraunces/wght-italic.css";
import "@fontsource-variable/inter";
import "@fontsource-variable/literata";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./index.css";
import "./components/ui/ui.css";
import App from "./App.jsx";
import { applyAppearance, readSavedAppearance } from "./theme";

// aplica o último tema usado antes do primeiro desenho, para a tela não piscar
applyAppearance(readSavedAppearance());

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
