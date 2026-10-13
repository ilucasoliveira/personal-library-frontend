// Nota de 1 a 5 só para ver (a edição fica na página do livro). O valor vai em texto escondido.
export default function Stars({ rating, label }) {
  if (!rating) return null;
  return (
    <span className="stars">
      <span aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={i <= rating ? "stars__on" : "stars__off"}>
            ★
          </span>
        ))}
      </span>
      {label && <span className="sr-only">{label}</span>}
    </span>
  );
}
