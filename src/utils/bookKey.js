// "Dom Casmurro" e "dom  casmurro " são o mesmo livro: sem acento, minúsculo, espaço único
export function bookKey(title, author) {
  const clean = (text) =>
    (text || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  return `${clean(title)}|${clean(author)}`;
}
