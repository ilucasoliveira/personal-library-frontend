// Status de leitura como um livro que vai se enchendo, na mesma linha da logo:
// vazio (quero ler), metade (lendo), cheio (lido).
// Só desenho: o texto do status vai sempre ao lado ou num rótulo para leitor de tela.
export default function StatusIcon({ status, size = 16 }) {
  return (
    <svg
      className={`status-icon status-icon--${status}`}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="3.75" y="1.75" width="8.5" height="12.5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {status === "reading" && <rect x="4.5" y="8" width="7" height="5.5" rx="0.75" fill="currentColor" />}
      {status === "read" && <rect x="4.5" y="2.5" width="7" height="11" rx="0.75" fill="currentColor" />}
    </svg>
  );
}
