// Marca do app: três livros em pé e um encostado, sobre a prateleira.
// As cores vêm do tema (variáveis CSS), então a logo acompanha o tema escolhido.
// Desenho em unidades de 64; o viewBox recorta só a área ocupada pelos livros.
export default function Logo({ className = "" }) {
  return (
    <svg className={`logo ${className}`} viewBox="2 6 62 50" aria-hidden="true" focusable="false">
      <rect className="logo__a" x="8" y="14" width="9" height="36" rx="1.5" />
      <rect className="logo__b" x="19" y="8" width="9" height="42" rx="1.5" />
      <rect className="logo__c" x="30" y="18" width="9" height="32" rx="1.5" />
      <rect className="logo__d" x="48" y="12" width="9" height="38" rx="1.5" transform="rotate(-12 57 50)" />
      <rect className="logo__a" x="4" y="50" width="58" height="3.5" rx="1.5" />
    </svg>
  );
}
