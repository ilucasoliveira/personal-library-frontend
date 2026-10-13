import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { applyAppearance, readSavedAppearance } from "./theme";

// aplica o último tema usado antes do primeiro desenho, para a tela não piscar
applyAppearance(readSavedAppearance());

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
