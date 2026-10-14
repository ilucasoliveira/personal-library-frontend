import { t } from "../i18n";

const API_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = "token";

// ---------- sessão (token JWT guardado no navegador) ----------

let token = null;
try {
  token = localStorage.getItem(TOKEN_KEY);
  // a versão antiga guardava usuário e senha (Basic Auth) nesta chave
  localStorage.removeItem("authToken");
} catch {
  // sem localStorage o login vale só nesta aba
}

export function getToken() {
  return token;
}

export function saveToken(newToken) {
  token = newToken;
  try {
    localStorage.setItem(TOKEN_KEY, newToken);
  } catch {
    // ignora
  }
}

export function clearToken() {
  token = null;
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignora
  }
}

// o App escuta este evento para voltar à tela de login quando o token vence
export const SESSION_EXPIRED = "app:session-expired";

// ---------- erros da API traduzidos ----------

// a API manda um código fixo em cada erro ({"detail": "...", "code": "book_not_found"});
// o texto mostrado sai daqui, no idioma escolhido
const ERROR_KEYS = {
  example_read_only: "err.example",
  visitor_locked: "err.visitorLocked",
  book_not_found: "err.notFound",
  invalid_credentials: "err.login",
  email_taken: "err.emailTaken",
  signup_disabled: "err.signupDisabled",
  wrong_password: "err.wrongPassword",
  book_limit: "err.bookLimit",
  photo_type: "err.photoType",
  photo_upload_failed: "err.photoUploadFailed",
  photo_size: "err.photoSize",
  photo_unavailable: "err.photoUnavailable",
  demo_not_ready: "err.demoNotReady",
  name_required: "err.nameRequired",
  too_many_requests: "err.tooMany",
};

export class ApiError extends Error {
  constructor(message, status, code = null) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request(path, { method = "GET", json, form, body, auth = true, keepalive = false } = {}, fallbackKey = "err.generic") {
  const headers = {};
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  } else if (form) {
    body = new URLSearchParams(form);
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { method, headers, body, keepalive });
  } catch {
    throw new ApiError(t("err.network"), 0, "network");
  }

  if (!response.ok) {
    let code = null;
    try {
      code = (await response.json()).code ?? null;
    } catch {
      // resposta sem corpo JSON
    }

    if (response.status === 401 && auth) {
      clearToken();
      window.dispatchEvent(new Event(SESSION_EXPIRED));
    }

    throw new ApiError(t(ERROR_KEYS[code] || fallbackKey), response.status, code);
  }

  return response.status === 204 ? null : response.json();
}

// ---------- servidor e contas ----------

export function ping() {
  return request("/ping", { auth: false });
}

export function login(email, password) {
  return request("/auth/login", { method: "POST", form: { username: email, password }, auth: false }, "err.login");
}

export function register(data) {
  return request("/auth/register", { method: "POST", json: data, auth: false });
}

export function loginAsVisitor() {
  return request("/auth/visitor", { method: "POST", auth: false });
}

export function getMe() {
  return request("/me");
}

export function updateMe(data) {
  return request("/me", { method: "PUT", json: data }, "err.save");
}

export function changePassword(currentPassword, newPassword) {
  return request(
    "/me/password",
    { method: "PUT", json: { current_password: currentPassword, new_password: newPassword } },
    "err.save",
  );
}

export function deleteAccount(password) {
  return request("/me", { method: "DELETE", json: { password } }, "err.save");
}

export function uploadProfilePhoto(file) {
  const formData = new FormData();
  formData.append("file", file);
  return request("/me/photo", { method: "POST", body: formData }, "err.uploadPhoto");
}

export function deleteProfilePhoto() {
  return request("/me/photo", { method: "DELETE" }, "err.save");
}

// ---------- livros ----------

export function getBooks() {
  return request("/books", {}, "err.loadBooks");
}

export function getBook(id) {
  return request(`/books/${id}`, {}, "err.notFound");
}

export function createBook(book) {
  return request("/books", { method: "POST", json: book }, "err.createBook");
}

// só os campos enviados mudam; null apaga nota, comentário, sinopse ou capa
export function updateBook(id, data) {
  return request(`/books/${id}`, { method: "PATCH", json: data }, "err.updateBook");
}

export function deleteBook(id, { keepalive = false } = {}) {
  return request(`/books/${id}`, { method: "DELETE", keepalive }, "err.deleteBook");
}
