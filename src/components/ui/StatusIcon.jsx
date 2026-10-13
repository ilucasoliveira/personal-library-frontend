// Luas desenhadas no lugar do emoji: crescente vazia (quero ler), meia (lendo), cheia (lido).
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
      <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {status === "reading" && <path d="M8 1.75a6.25 6.25 0 0 1 0 12.5Z" fill="currentColor" />}
      {status === "read" && <circle cx="8" cy="8" r="6.25" fill="currentColor" />}
    </svg>
  );
}
