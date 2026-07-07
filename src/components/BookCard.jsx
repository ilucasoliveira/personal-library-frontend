import { getCoverColor, getGenderColor } from "../utils/coverColor";

export default function BookCard({
  title,
  author,
  gender = null,
  coverColor = "var(--color-primary)",
  coverUrl = null,
  rating = 0,
  favorite = false,
  status = "reading",
  onClick,
  onToggleFavorite,
}) {
  const statusIcon = {
    toRead: "🌙",
    reading: "🌗",
    read: "🌕",
  }[status];

  return (
    <div
      onClick={onClick}
      className="book-card"
      style={{
        background: "var(--color-card)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        boxShadow: "var(--shadow-card)",
        width: "100%",
        fontFamily: "var(--font-ui)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        style={{
          background: coverUrl ? "none" : coverColor,
          height: "220px",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {coverUrl && (
          <img
            src={coverUrl}
            alt={title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
        <div
          style={{
            position: "absolute",
            top: "8px",
            left: "8px",
            width: "22px",
            height: "22px",
            borderRadius: "50%",
            background: "rgba(20,21,43,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
          }}
        >
          {statusIcon}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.();
          }}
          aria-label={
            favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"
          }
          style={{
            position: "absolute",
            top: "4px",
            right: "8px",
            fontSize: "26px",
            color: favorite ? "var(--color-favorite)" : "rgba(255,255,255,0.7)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            lineHeight: 1,
          }}
        >
          {favorite ? "♥" : "♡"}
        </button>
      </div>
      <div
        style={{
          padding: "var(--space-3)",
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        <p
          style={{
            margin: 0,
            color: "var(--color-text-primary)",
            fontSize: "var(--text-small)",
            fontWeight: "var(--font-weight-semibold)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: "1.3em",
          }}
        >
          {title}
        </p>
        {gender && (
          <span
            style={{
              display: "block",
              marginTop: "4px",
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              textTransform: "uppercase",
              letterSpacing: "0.03em",
              padding: "2px 8px",
              borderRadius: "var(--radius-pill)",
              background: getGenderColor(gender).bg,
              color: getGenderColor(gender).text,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "fit-content",
            }}
          >
            {gender}
          </span>
        )}
        <p
          style={{
            margin: "4px 0 0",
            color: "var(--color-text-muted)",
            fontSize: "var(--text-caption)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {author}
        </p>
        <div
          style={{
            marginTop: "auto",
            paddingTop: "6px",
            display: "flex",
            gap: "2px",
          }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              style={{
                fontSize: "12px",
                color:
                  i <= rating
                    ? "var(--color-star-filled)"
                    : "var(--color-star-empty)",
              }}
            >
              ★
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
