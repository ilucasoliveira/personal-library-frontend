import { useEffect, useState } from "react";
import { onNotify } from "../utils/notify";

// aviso no rodapé da tela; some sozinho depois de alguns segundos
export default function Toast() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let timer = 0;
    const stop = onNotify((detail) => {
      clearTimeout(timer);
      setToast({ ...detail, key: Date.now() });
      timer = setTimeout(() => setToast(null), 5000);
    });
    return () => {
      stop();
      clearTimeout(timer);
    };
  }, []);

  if (!toast) return null;

  return (
    <div
      key={toast.key}
      role={toast.type === "error" ? "alert" : "status"}
      className={`toast toast--${toast.type}`}
      onClick={() => setToast(null)}
    >
      {toast.message}
    </div>
  );
}
