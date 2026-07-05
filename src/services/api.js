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

export async function getBooks() {
const response = await fetch(`${API_URL}/books`, {
    headers: authHeader(),
});

if (!response.ok) {
    throw new Error("Erro ao buscar livros");
}

return response.json();
}

export async function createBook(book) {
const response = await fetch(`${API_URL}/create`, {
    method: "POST",
    headers: {
    "Content-Type": "application/json",
    ...authHeader(),
    },
    body: JSON.stringify(book),
});

if (!response.ok) {
    throw new Error("Erro ao adicionar livro");
}

return response.json();
}

export async function updateBook(id, data) {
const response = await fetch(`${API_URL}/update/${id}`, {
    method: "PUT",
    headers: {
        "Content-Type": "application/json",
        ...authHeader(),
    },
    body: JSON.stringify(data),
});

if (!response.ok) {
    throw new Error("Erro ao atualizar livro");
}

return response.json();
}

export async function deleteBook(id) {
    const response = await fetch(`${API_URL}/delete/${id}`, {
    method: "DELETE",
    headers: authHeader(),
    });

    if (!response.ok) {
    throw new Error("Erro ao excluir livro");
    } 
}

export async function getProfile() {
    const response = await fetch(`${API_URL}/profile`, {
    headers: authHeader(),
    });
    if (!response.ok) throw new Error("Erro ao buscar perfil");
    return response.json();
}

export async function updateProfile(data) {
    const response = await fetch(`${API_URL}/profile`, {
    method: "PUT",
    headers: {
        "Content-Type": "application/json",
        ...authHeader(),
    },
    body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao atualizar perfil");
    return response.json();
}

export async function uploadProfilePhoto(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_URL}/profile/upload`, {
    method: "POST",
    headers: authHeader(),
    body: formData,
    });

    if (!response.ok) throw new Error("Erro ao enviar foto");
    return response.json();
}