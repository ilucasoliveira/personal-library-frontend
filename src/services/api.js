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

const ERROR_KEYS = {
  "Examples cannot be deleted or updated.": "err.example",
  "The visitor account cannot be changed.": "err.visitorLocked",
  "Book not found.": "err.notFound",
  "Incorrect email or password.": "err.login",
  "Email already registered.": "err.emailTaken",
  "Sign up is disabled.": "err.signupDisabled",
  "Incorrect password.": "err.wrongPassword",
  "Book limit reached.": "err.bookLimit",
  "Photo must be JPG, PNG, WEBP or GIF.": "err.photoType",
  "Photo must be at most 2 MB.": "err.photoSize",
  "Photo upload is not configured.": "err.photoUnavailable",
  "The demo account is not ready yet.": "err.demoNotReady",
};

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = "GET", json, form, body, auth = true } = {}, fallbackKey = "err.generic") {
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
    response = await fetch(`${API_URL}${path}`, { method, headers, body });
  } catch {
    throw new ApiError(t("err.network"), 0);
  }

  if (!response.ok) {
    let detail = "";
    try {
      detail = (await response.json()).detail;
    } catch {
      // resposta sem corpo JSON
    }

    if (response.status === 401 && auth) {
      clearToken();
      window.dispatchEvent(new Event(SESSION_EXPIRED));
    }

    const key =
      (typeof detail === "string" && ERROR_KEYS[detail]) || (response.status === 429 ? "err.tooMany" : fallbackKey);
    throw new ApiError(t(key), response.status);
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

// ---------- livros ----------

export function getBooks() {
  return request("/books", {}, "err.loadBooks");
}

export function createBook(book) {
  return request("/create", { method: "POST", json: book }, "err.createBook");
}

export function updateBook(id, data) {
  return request(`/update/${id}`, { method: "PUT", json: data }, "err.updateBook");
}

export function deleteBook(id) {
  return request(`/delete/${id}`, { method: "DELETE" }, "err.deleteBook");
}
