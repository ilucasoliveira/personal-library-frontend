import { Component } from "react";
import { t } from "../i18n";

// Rede de segurança: se uma tela quebrar por um erro inesperado, mostra uma saída
// (recarregar ou voltar para a estante) em vez de deixar a página em branco.
export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    // a fase 5 manda isto para o Sentry; por enquanto fica no console
    console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="page empty-state" role="alert">
        <h1 className="empty-state__title">{t("crash.title")}</h1>
        <p className="empty-state__text">{t("crash.text")}</p>
        <div className="empty-state__actions">
          <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
            {t("crash.reload")}
          </button>
          <a href="/" className="btn btn--secondary">
            {t("common.backToShelf")}
          </a>
        </div>
      </div>
    );
  }
}
