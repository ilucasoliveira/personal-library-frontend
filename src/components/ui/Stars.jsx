import { starFills } from "../../utils/rating";

// estrela que ocupa a largura toda do quadrado 24x24: assim 25% da largura é 1/4 da estrela
export const STAR_PATH =
  "M12 1.7L15.35 8.49L22.84 9.58L17.42 14.86L18.7 22.32L12 18.8L5.3 22.32L6.58 14.86L1.16 9.58L8.65 8.49Z";

// Uma estrela com uma parte pintada (fill de 0 a 1): a de cima é cortada na largura certa.
export function Star({ fill, className = "" }) {
  return (
    <span className={`star ${className}`}>
      <svg className="star__off" viewBox="0 0 24 24" focusable="false">
        <path d={STAR_PATH} />
      </svg>
      {fill > 0 && (
        <span className="star__on" style={{ width: `${fill * 100}%` }}>
          <svg viewBox="0 0 24 24" focusable="false">
            <path d={STAR_PATH} />
          </svg>
        </span>
      )}
    </span>
  );
}

// Nota só para ver (a edição fica na página do livro), com quartos de estrela.
// O valor vai em texto escondido. empty: mostra as 5 estrelas vazias quando não há nota.
export default function Stars({ rating, label, empty = false, className = "" }) {
  if (!rating && !empty) return null;
  return (
    <span className={`stars ${className}`}>
      <span className="stars__row" aria-hidden="true">
        {starFills(rating).map((fill, i) => (
          <Star key={i} fill={fill} />
        ))}
      </span>
      {label && <span className="sr-only">{label}</span>}
    </span>
  );
}
