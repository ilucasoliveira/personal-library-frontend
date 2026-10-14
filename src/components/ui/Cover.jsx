import { useState } from "react";
import { getCoverColor } from "../../utils/coverColor";

// capas da Open Library vêm em -L (~500 px); na grade e nas miniaturas o -M (~180 px) basta
function sized(url, size) {
  if (size === "large" || !url?.includes("covers.openlibrary.org")) return url;
  return url.replace(/-L\.jpg$/, "-M.jpg");
}

// Capa 2:3 com sombra de lombada. Sem imagem (ou se ela falhar), vira uma capa
// tipográfica com o título, na cor que o título sorteia.
export default function Cover({ url, title, size = "grid", className = "" }) {
  const [broken, setBroken] = useState(false);
  const showImage = url && !broken;

  return (
    <span
      className={`cover cover--${size} ${className}`}
      style={showImage ? undefined : { background: getCoverColor(title) }}
    >
      {showImage ? (
        <img
          src={sized(url, size)}
          alt=""
          loading="lazy"
          decoding="async"
          width={size === "grid" || size === "large" ? 180 : 64}
          height={size === "grid" || size === "large" ? 270 : 96}
          onError={() => setBroken(true)}
        />
      ) : (
        // nas miniaturas não cabe texto legível: fica só a cor
        (size === "grid" || size === "large") && (
          <span className="cover__title" aria-hidden="true">
            {title}
          </span>
        )
      )}
    </span>
  );
}
