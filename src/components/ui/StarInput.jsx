import { useRef, useState } from "react";
import { Star } from "./Stars";
import { MAX, MIN, STEP, clampRating, starFills } from "../../utils/rating";

// Escolher a nota arrastando o dedo (ou o mouse) sobre as estrelas, de 0.25 em 0.25.
// No mouse, passar por cima mostra a prévia e o clique escolhe. No teclado é um slider:
// setas mudam 0.25, PageUp/PageDown mudam 1, Home/End vão para 0.25 e 5.
export default function StarInput({ ref, value, onChange, onPreview, label, valueText }) {
  const rowRef = useRef(null);
  const dragging = useRef(false);
  const [hover, setHover] = useState(null);

  // valor no ponto x: em cima de uma estrela conta o quarto tocado; no vão entre duas, a anterior cheia
  function valueAt(clientX) {
    const stars = rowRef.current.querySelectorAll(".star");
    for (let i = 0; i < stars.length; i++) {
      const box = stars[i].getBoundingClientRect();
      if (clientX < box.left) return i === 0 ? MIN : i;
      if (clientX <= box.right) {
        const quarters = Math.max(1, Math.ceil(((clientX - box.left) / box.width) * 4));
        return i + quarters * STEP;
      }
    }
    return MAX;
  }

  function preview(next) {
    setHover(next);
    onPreview?.(next);
  }

  function handlePointerDown(event) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragging.current = true;
    preview(null);
    onChange(valueAt(event.clientX));
  }

  function handlePointerMove(event) {
    if (dragging.current) onChange(valueAt(event.clientX));
    else if (event.pointerType === "mouse") preview(valueAt(event.clientX));
  }

  function stopDragging() {
    dragging.current = false;
  }

  function handleKeyDown(event) {
    const current = value || 0;
    const keys = {
      ArrowRight: current + STEP,
      ArrowUp: current + STEP,
      ArrowLeft: current - STEP,
      ArrowDown: current - STEP,
      PageUp: current + 1,
      PageDown: current - 1,
      Home: MIN,
      End: MAX,
    };
    if (!(event.key in keys)) return;
    event.preventDefault();
    onChange(clampRating(keys[event.key]));
  }

  const shown = hover ?? value;

  return (
    <div
      ref={ref}
      className="star-input"
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={MIN}
      aria-valuemax={MAX}
      aria-valuenow={value || undefined}
      aria-valuetext={valueText}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      onPointerLeave={() => preview(null)}
      onKeyDown={handleKeyDown}
    >
      <span ref={rowRef} className="star-input__row" aria-hidden="true">
        {starFills(shown).map((fill, i) => (
          <Star key={i} fill={fill} className="star--large" />
        ))}
      </span>
    </div>
  );
}
