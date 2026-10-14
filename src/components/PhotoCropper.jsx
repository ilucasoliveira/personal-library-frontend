import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useI18n } from "../i18n";
import Button from "./ui/Button";
import Dialog from "./ui/Dialog";

const OUTPUT = 512; // a foto salva é um quadrado de 512 px; o círculo é só a máscara na tela
const MAX_ZOOM = 4;

// Ajustar a foto antes de enviar: arrastar para posicionar o rosto no círculo e aproximar
// com a barra, a roda do mouse ou dois dedos (pinça). O resultado sai em JPEG 512x512,
// então qualquer foto do celular cabe no limite de 2 MB da API.
export default function PhotoCropper({ file, busy, onCancel, onConfirm }) {
  const { t } = useI18n();
  const [image, setImage] = useState(null);
  const [failed, setFailed] = useState(false);
  const [size, setSize] = useState(0); // lado do quadro de recorte, em px
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const frame = useRef(null);
  const pointers = useRef(new Map());
  const pinch = useRef(null);

  // abre o arquivo escolhido como imagem
  useEffect(() => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => setImage({ el: img, url, width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => setFailed(true);
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // mede o quadro (ele muda de tamanho com a tela)
  useLayoutEffect(() => {
    const el = frame.current;
    if (!el) return;
    const measure = () => setSize(el.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [image]);

  // escala em que o lado menor da foto cobre o quadro inteiro
  const base = image && size ? size / Math.min(image.width, image.height) : 0;
  const scale = base * zoom;
  const shownW = image ? image.width * scale : 0;
  const shownH = image ? image.height * scale : 0;

  // a foto nunca deixa espaço vazio dentro do quadro
  function clamp(next, nextScale = scale) {
    const maxX = Math.max(0, (image.width * nextScale - size) / 2);
    const maxY = Math.max(0, (image.height * nextScale - size) / 2);
    return { x: Math.min(maxX, Math.max(-maxX, next.x)), y: Math.min(maxY, Math.max(-maxY, next.y)) };
  }

  // aproxima mantendo o centro do quadro no mesmo ponto da foto
  function zoomTo(nextZoom) {
    const z = Math.min(MAX_ZOOM, Math.max(1, nextZoom));
    const ratio = z / zoom;
    setZoom(z);
    setOffset((prev) => clamp({ x: prev.x * ratio, y: prev.y * ratio }, base * z));
  }

  function handlePointerDown(event) {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), zoom };
    }
  }

  function handlePointerMove(event) {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) return;
    const current = { x: event.clientX, y: event.clientY };
    pointers.current.set(event.pointerId, current);
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      zoomTo(pinch.current.zoom * (Math.hypot(a.x - b.x, a.y - b.y) / pinch.current.distance));
    } else if (pointers.current.size === 1) {
      setOffset((prev) => clamp({ x: prev.x + current.x - previous.x, y: prev.y + current.y - previous.y }));
    }
  }

  function handlePointerUp(event) {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  }

  // roda do mouse aproxima; o listener precisa ser "não passivo" para não rolar a página
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    function onWheel(event) {
      event.preventDefault();
      zoomTo(zoom * (event.deltaY < 0 ? 1.1 : 1 / 1.1));
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  });

  function handleKeyDown(event) {
    const step = 10;
    const moves = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    if (moves[event.key]) {
      event.preventDefault();
      const [dx, dy] = moves[event.key];
      setOffset((prev) => clamp({ x: prev.x + dx, y: prev.y + dy }));
    } else if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      zoomTo(zoom + 0.1);
    } else if (event.key === "-") {
      event.preventDefault();
      zoomTo(zoom - 0.1);
    }
  }

  // recorta o quadrado visível e devolve um JPEG
  function handleSave() {
    const left = size / 2 + offset.x - shownW / 2;
    const top = size / 2 + offset.y - shownH / 2;
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff"; // PNG com fundo transparente não fica preto no JPEG
    ctx.fillRect(0, 0, OUTPUT, OUTPUT);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image.el, -left / scale, -top / scale, size / scale, size / scale, 0, 0, OUTPUT, OUTPUT);
    canvas.toBlob((blob) => blob && onConfirm(blob), "image/jpeg", 0.9);
  }

  return (
    <Dialog
      open
      className="dialog--crop"
      title={t("photo.title")}
      onClose={busy ? () => {} : onCancel}
      actions={
        <>
          <Button variant="secondary" disabled={busy} onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button disabled={!image || !size} busy={busy} busyText={t("profile.uploading")} onClick={handleSave}>
            {t("photo.save")}
          </Button>
        </>
      }
    >
      {failed ? (
        <p role="alert">{t("photo.unreadable")}</p>
      ) : (
        <div className="cropper">
          <div
            ref={frame}
            className="cropper__frame"
            tabIndex={0}
            role="group"
            aria-label={t("photo.frameLabel")}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onKeyDown={handleKeyDown}
          >
            {image && size > 0 && (
              <img
                className="cropper__image"
                src={image.url}
                alt=""
                draggable="false"
                style={{
                  width: shownW,
                  height: shownH,
                  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                }}
              />
            )}
            <span className="cropper__mask" aria-hidden="true" />
          </div>

          <div className="cropper__zoom">
            <button type="button" className="cropper__zoom-btn" aria-label={t("photo.zoomOut")} onClick={() => zoomTo(zoom - 0.25)}>
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M5 12h14" />
              </svg>
            </button>
            <input
              type="range"
              min="1"
              max={MAX_ZOOM}
              step="0.01"
              value={zoom}
              aria-label={t("photo.zoom")}
              onChange={(e) => zoomTo(Number(e.target.value))}
            />
            <button type="button" className="cropper__zoom-btn" aria-label={t("photo.zoomIn")} onClick={() => zoomTo(zoom + 0.25)}>
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M5 12h14M12 5v14" />
              </svg>
            </button>
          </div>
          <p className="cropper__hint">{t("photo.hint")}</p>
        </div>
      )}
    </Dialog>
  );
}
