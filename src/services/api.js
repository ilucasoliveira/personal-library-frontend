const API_URL = import.meta.env.VITE_API_URL;
let AUTH = null;

export function setAuth(token) {
  AUTH = token;
}

export function clearAuth() {
  AUTH = null;
}

function authHeader() {
  return { Authorization: `Basic ${AUTH}` };
}

// mensagens em português para as respostas de erro da API
const ERROR_MESSAGES = {
  "Examples cannot be deleted or updated.":
    "Este é um livro de exemplo da demo: ele não pode ser editado nem excluído. Adicione um livro seu para testar à vontade.",
  "The profile cannot be changed in the demo.":
    "Na demo o perfil não pode ser alterado.",
  "Book not found.": "Livro não encontrado. Ele pode ter sido removido.",
};

async function request(path, options, fallbackMessage) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch {
    throw new Error(
      "Não foi possível falar com o servidor. Verifique a conexão e tente de novo.",
    );
  }

  if (!response.ok) {
    let detail = "";
    try {
      detail = (await response.json()).detail;
    } catch {
      // resposta sem corpo JSON
    }
    throw new Error(ERROR_MESSAGES[detail] || fallbackMessage);
  }

  return response.status === 204 ? null : response.json();
}

export function getBooks() {
  return request("/books", { headers: authHeader() }, "Erro ao buscar livros");
}

export function createBook(book) {
  return request(
    "/create",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(book),
    },
    "Erro ao adicionar livro",
  );
}

export function updateBook(id, data) {
  return request(
    `/update/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(data),
    },
    "Erro ao atualizar livro",
  );
}

export function deleteBook(id) {
  return request(
    `/delete/${id}`,
    { method: "DELETE", headers: authHeader() },
    "Erro ao excluir livro",
  );
}

export function getProfile() {
  return request("/profile", { headers: authHeader() }, "Erro ao buscar perfil");
}

export function updateProfile(data) {
  return request(
    "/profile",
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(data),
    },
    "Erro ao atualizar perfil",
  );
}

export function uploadProfilePhoto(file) {
  const formData = new FormData();
  formData.append("file", file);

  return request(
    "/profile/upload",
    { method: "POST", headers: authHeader(), body: formData },
    "Erro ao enviar foto",
  );
}
