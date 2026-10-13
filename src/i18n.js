// Tradução do app (português e inglês) sem biblioteca: um dicionário por idioma
// e um hook que faz os componentes renderizarem de novo quando o idioma muda.
import { useSyncExternalStore } from "react";

const pt = {
  "app.footer": "© 2026 Lucas de Oliveira · Feito com ♥.",
  "app.visitorFooter":
    "Conta de visitante: os livros de exemplo são só para leitura e os que você adicionar somem depois de um dia.",

  "greeting.morning": "Bom dia",
  "greeting.afternoon": "Boa tarde",
  "greeting.evening": "Boa noite",
  "home.subtitle": "O que vamos ler hoje?",
  "home.quickSearch": "Buscar título ou autor...",
  "home.continueReading": "Continuando a leitura",
  "home.filter": "Buscar na sua estante...",
  "tabs.favorites": "Favoritos",
  "tabs.toRead": "Na lista",
  "tabs.read": "Lidos",
  "tabs.all": "Todos",
  "sort.titleAsc": "Título A-Z",
  "sort.titleDesc": "Título Z-A",
  "sort.author": "Autor",
  "sort.gender": "Gênero",
  "empty.search": 'Nenhum livro encontrado para "{q}" nessa lista.',
  "empty.favorites": "Nenhuma estrela nesse céu ainda. Favorite um livro para começar.",
  "empty.toRead": "Nada na fila por enquanto. Que tal buscar algo novo?",
  "empty.read": "As primeiras páginas de uma nova jornada de leitura.",
  "empty.all": "Sua estante ainda está esperando o primeiro capítulo.",
  "empty.cta": "Buscar um livro",

  "common.loading": "Carregando...",
  "common.back": "← Voltar",
  "common.save": "Salvar",
  "common.cancel": "Cancelar",

  "nav.home": "Início",
  "nav.search": "Buscar",
  "nav.profile": "Perfil",
  "nav.settings": "Configurações",
  "nav.add": "Adicionar livro",

  "card.example": "Exemplo",
  "card.addFavorite": "Adicionar aos favoritos",
  "card.removeFavorite": "Remover dos favoritos",

  "details.exampleNote": "Livro de exemplo da demo: só para leitura.",
  "details.edit": "Editar livro",
  "details.titlePh": "Título:",
  "details.authorPh": "Autor:",
  "details.genderPh": "Gênero:",
  "details.coverPh": "URL da capa (https://...)",
  "details.synopsisPh": "Sinopse:",
  "details.comment": "Seu comentário",
  "details.commentPh": "seu comentário aqui...",
  "details.delete": "Excluir livro",
  "details.confirmDelete": 'Tem certeza que quer excluir "{title}"? Essa ação não pode ser desfeita.',
  "status.toRead": "🌙 Quero ler",
  "status.reading": "🌗 Lendo agora",
  "status.read": "🌕 Lido",

  "search.placeholder": "Buscar por título, autor...",
  "search.button": "Buscar",
  "search.searching": "Buscando...",
  "search.prev": "← Anterior",
  "search.next": "Próxima →",
  "search.page": "Página {page} de {total}",
  "search.notFound":
    "Esse título não está no nosso banco de dados, mas isso não significa que ele não mereça um lugar na sua estante.",
  "search.addManual": "Adicionar manualmente",
  "search.add": "Adicionar",
  "search.added": '"{title}" adicionado à estante!',
  "search.error": "Não foi possível buscar agora. Tente de novo em instantes.",
  "book.untitled": "Sem título",
  "book.unknownAuthor": "Autor desconhecido",
  "book.general": "Geral",

  "manual.title": "Conte-me sobre esse livro",
  "manual.name": "Nome do livro *",
  "manual.author": "Autor *",
  "manual.gender": "Gênero *",
  "manual.required": "obrigatório",
  "manual.titleError": "Escreva o título para continuar.",
  "manual.authorError": "Escreva o autor para continuar.",
  "manual.genderError": "Escolha um gênero para continuar.",
  "manual.cover": "URL da capa (opcional)",
  "manual.synopsis": "Sinopse (opcional)",
  "manual.submit": "Salvar na estante",

  "profile.favoriteBook": "Livro favorito: {title}",
  "profile.choosePhoto": "Escolher foto",
  "profile.photoUpdated": "Foto atualizada!",
  "profile.visitorPhoto": "Na conta de visitante a foto fica desativada.",
  "profile.settings": "Configurações",
  "profile.logout": "Sair da conta",
  "profile.confirmLogout": "Tem certeza que deseja sair?",
  "stats.read": "Livros lidos",
  "stats.reading": "Lendo agora",
  "stats.topAuthor": "Autor mais lido",
  "stats.topGenre": "Gênero favorito",
  "stats.total": "Total na estante",
  "stats.avg": "Nota média",
  "stats.month": "Lidos este mês",
  "stats.year": "Lidos este ano",
  "reader.title": "Ficha do leitor",
  "reader.lastRead": "Último livro lido: {value}",
  "reader.favorites": "Favoritos na estante: {value}",
  "reader.queue": "Na fila para ler: {value}",

  "settings.title": "Configurações",
  "settings.appearance": "Aparência",
  "settings.theme": "Tema",
  "settings.accent": "Cor de destaque",
  "settings.accentDefault": "Usar a cor do tema",
  "settings.accentCustom": "Escolher outra cor",
  "settings.language": "Idioma",
  "settings.account": "Conta",
  "settings.name": "Nome",
  "settings.email": "Email",
  "settings.saveName": "Salvar nome",
  "settings.saved": "Salvo!",
  "settings.password": "Trocar senha",
  "settings.currentPassword": "Senha atual",
  "settings.newPassword": "Nova senha",
  "settings.changePassword": "Trocar senha",
  "settings.passwordChanged": "Senha alterada!",
  "settings.delete": "Excluir conta",
  "settings.deleteText": "Apaga sua conta e todos os seus livros. Não dá para desfazer.",
  "settings.deletePassword": "Digite sua senha para confirmar",
  "settings.deleteButton": "Excluir minha conta",
  "settings.deleteConfirm": "Excluir a conta e todos os livros para sempre?",
  "settings.visitorNote":
    "Na conta de visitante, tema, cor e idioma ficam salvos só neste navegador. Crie uma conta para guardar tudo.",
  "theme.twilight": "Crepúsculo",
  "theme.paper": "Papel",
  "theme.sepia": "Sépia",
  "theme.forest": "Floresta",

  "auth.tagline": "Sua estante de livros, do seu jeito.",
  "auth.login": "Entrar",
  "auth.register": "Criar conta",
  "auth.name": "Nome",
  "auth.email": "Email",
  "auth.password": "Senha",
  "auth.passwordHint": "Mínimo de 8 caracteres.",
  "auth.loggingIn": "Entrando...",
  "auth.creating": "Criando conta...",
  "auth.showPassword": "Mostrar senha",
  "auth.hidePassword": "Ocultar senha",
  "auth.demoTitle": "Só quer dar uma olhada?",
  "auth.demoText":
    "Entre como visitante para ver uma estante de exemplo. O que você adicionar lá some depois de um dia.",
  "auth.visitor": "Entrar como visitante",
  "auth.waking": "Acordando o servidor... na primeira vez pode levar até um minuto.",
  "auth.sessionExpired": "Sua sessão expirou. Entre de novo.",
  "auth.closed": "O cadastro está fechado neste site.",

  "err.network": "Não foi possível falar com o servidor. Verifique a conexão e tente de novo.",
  "err.example":
    "Este é um livro de exemplo da demo: ele não pode ser editado nem excluído. Adicione um livro seu para testar à vontade.",
  "err.visitorLocked": "A conta de visitante não pode ser alterada. Crie uma conta para personalizar a sua.",
  "err.notFound": "Livro não encontrado. Ele pode ter sido removido.",
  "err.login": "Email ou senha incorretos.",
  "err.emailTaken": "Já existe uma conta com esse email.",
  "err.tooMany": "Muitas tentativas. Espere alguns minutos e tente de novo.",
  "err.signupDisabled": "O cadastro está fechado neste site.",
  "err.wrongPassword": "Senha incorreta.",
  "err.bookLimit": "Você chegou ao limite de livros da sua conta.",
  "err.photoType": "A foto precisa ser JPG, PNG, WEBP ou GIF.",
  "err.photoSize": "A foto pode ter no máximo 2 MB.",
  "err.photoUnavailable": "O envio de fotos não está disponível agora.",
  "err.demoNotReady": "A conta de visitante ainda não está pronta.",
  "err.invalidEmail": "Esse email não parece válido.",
  "err.shortPassword": "A senha precisa ter pelo menos 8 caracteres.",
  "err.longPassword": "A senha está longa demais.",
  "err.nameRequired": "Escreva seu nome.",
  "err.loadBooks": "Não foi possível carregar seus livros.",
  "err.createBook": "Não foi possível adicionar o livro.",
  "err.updateBook": "Não foi possível atualizar o livro.",
  "err.deleteBook": "Não foi possível excluir o livro.",
  "err.save": "Não foi possível salvar. Tente de novo.",
  "err.uploadPhoto": "Não foi possível enviar a foto.",
  "err.generic": "Algo deu errado. Tente de novo.",
};

const en = {
  "app.footer": "© 2026 Lucas de Oliveira · Built with ♥.",
  "app.visitorFooter":
    "Visitor account: example books are read-only and anything you add is removed after a day.",

  "greeting.morning": "Good morning",
  "greeting.afternoon": "Good afternoon",
  "greeting.evening": "Good evening",
  "home.subtitle": "What are we reading today?",
  "home.quickSearch": "Search title or author...",
  "home.continueReading": "Continue reading",
  "home.filter": "Search your shelf...",
  "tabs.favorites": "Favorites",
  "tabs.toRead": "To read",
  "tabs.read": "Read",
  "tabs.all": "All",
  "sort.titleAsc": "Title A-Z",
  "sort.titleDesc": "Title Z-A",
  "sort.author": "Author",
  "sort.gender": "Genre",
  "empty.search": 'No books found for "{q}" in this list.',
  "empty.favorites": "No stars in this sky yet. Favorite a book to start.",
  "empty.toRead": "Nothing in the queue yet. How about finding something new?",
  "empty.read": "The first pages of a new reading journey.",
  "empty.all": "Your shelf is still waiting for its first chapter.",
  "empty.cta": "Find a book",

  "common.loading": "Loading...",
  "common.back": "← Back",
  "common.save": "Save",
  "common.cancel": "Cancel",

  "nav.home": "Home",
  "nav.search": "Search",
  "nav.profile": "Profile",
  "nav.settings": "Settings",
  "nav.add": "Add book",

  "card.example": "Example",
  "card.addFavorite": "Add to favorites",
  "card.removeFavorite": "Remove from favorites",

  "details.exampleNote": "Demo example book: read-only.",
  "details.edit": "Edit book",
  "details.titlePh": "Title:",
  "details.authorPh": "Author:",
  "details.genderPh": "Genre:",
  "details.coverPh": "Cover URL (https://...)",
  "details.synopsisPh": "Synopsis:",
  "details.comment": "Your comment",
  "details.commentPh": "your comment here...",
  "details.delete": "Delete book",
  "details.confirmDelete": 'Are you sure you want to delete "{title}"? This can\'t be undone.',
  "status.toRead": "🌙 Want to read",
  "status.reading": "🌗 Reading",
  "status.read": "🌕 Read",

  "search.placeholder": "Search by title, author...",
  "search.button": "Search",
  "search.searching": "Searching...",
  "search.prev": "← Previous",
  "search.next": "Next →",
  "search.page": "Page {page} of {total}",
  "search.notFound":
    "This title isn't in our database, but that doesn't mean it doesn't deserve a spot on your shelf.",
  "search.addManual": "Add manually",
  "search.add": "Add",
  "search.added": '"{title}" added to your shelf!',
  "search.error": "Search is not available right now. Try again in a moment.",
  "book.untitled": "Untitled",
  "book.unknownAuthor": "Unknown author",
  "book.general": "General",

  "manual.title": "Tell me about this book",
  "manual.name": "Book title *",
  "manual.author": "Author *",
  "manual.gender": "Genre *",
  "manual.required": "required",
  "manual.titleError": "Write the title to continue.",
  "manual.authorError": "Write the author to continue.",
  "manual.genderError": "Pick a genre to continue.",
  "manual.cover": "Cover URL (optional)",
  "manual.synopsis": "Synopsis (optional)",
  "manual.submit": "Save to shelf",

  "profile.favoriteBook": "Favorite book: {title}",
  "profile.choosePhoto": "Choose photo",
  "profile.photoUpdated": "Photo updated!",
  "profile.visitorPhoto": "The photo is disabled on the visitor account.",
  "profile.settings": "Settings",
  "profile.logout": "Log out",
  "profile.confirmLogout": "Are you sure you want to log out?",
  "stats.read": "Books read",
  "stats.reading": "Reading now",
  "stats.topAuthor": "Most read author",
  "stats.topGenre": "Favorite genre",
  "stats.total": "Books on shelf",
  "stats.avg": "Average rating",
  "stats.month": "Read this month",
  "stats.year": "Read this year",
  "reader.title": "Reader card",
  "reader.lastRead": "Last book read: {value}",
  "reader.favorites": "Favorites on shelf: {value}",
  "reader.queue": "In the reading queue: {value}",

  "settings.title": "Settings",
  "settings.appearance": "Appearance",
  "settings.theme": "Theme",
  "settings.accent": "Accent color",
  "settings.accentDefault": "Use the theme color",
  "settings.accentCustom": "Pick another color",
  "settings.language": "Language",
  "settings.account": "Account",
  "settings.name": "Name",
  "settings.email": "Email",
  "settings.saveName": "Save name",
  "settings.saved": "Saved!",
  "settings.password": "Change password",
  "settings.currentPassword": "Current password",
  "settings.newPassword": "New password",
  "settings.changePassword": "Change password",
  "settings.passwordChanged": "Password changed!",
  "settings.delete": "Delete account",
  "settings.deleteText": "Deletes your account and all your books. This can't be undone.",
  "settings.deletePassword": "Type your password to confirm",
  "settings.deleteButton": "Delete my account",
  "settings.deleteConfirm": "Delete your account and all your books forever?",
  "settings.visitorNote":
    "On the visitor account, theme, color and language are saved only in this browser. Create an account to keep them.",
  "theme.twilight": "Twilight",
  "theme.paper": "Paper",
  "theme.sepia": "Sepia",
  "theme.forest": "Forest",

  "auth.tagline": "Your bookshelf, your way.",
  "auth.login": "Log in",
  "auth.register": "Sign up",
  "auth.name": "Name",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.passwordHint": "At least 8 characters.",
  "auth.loggingIn": "Logging in...",
  "auth.creating": "Creating account...",
  "auth.showPassword": "Show password",
  "auth.hidePassword": "Hide password",
  "auth.demoTitle": "Just want a look?",
  "auth.demoText":
    "Continue as a visitor to explore a sample shelf. Anything you add there is removed after a day.",
  "auth.visitor": "Continue as visitor",
  "auth.waking": "Waking up the server... the first time can take up to a minute.",
  "auth.sessionExpired": "Your session expired. Please log in again.",
  "auth.closed": "Sign up is closed on this site.",

  "err.network": "Could not reach the server. Check your connection and try again.",
  "err.example": "This is a demo example book: it can't be edited or deleted. Add a book of your own to try things out.",
  "err.visitorLocked": "The visitor account can't be changed. Create an account to customize yours.",
  "err.notFound": "Book not found. It may have been removed.",
  "err.login": "Incorrect email or password.",
  "err.emailTaken": "An account with this email already exists.",
  "err.tooMany": "Too many attempts. Wait a few minutes and try again.",
  "err.signupDisabled": "Sign up is closed on this site.",
  "err.wrongPassword": "Incorrect password.",
  "err.bookLimit": "You reached the book limit for your account.",
  "err.photoType": "The photo must be JPG, PNG, WEBP or GIF.",
  "err.photoSize": "The photo can be at most 2 MB.",
  "err.photoUnavailable": "Photo upload is not available right now.",
  "err.demoNotReady": "The visitor account is not ready yet.",
  "err.invalidEmail": "This email doesn't look valid.",
  "err.shortPassword": "The password must have at least 8 characters.",
  "err.longPassword": "The password is too long.",
  "err.nameRequired": "Write your name.",
  "err.loadBooks": "Could not load your books.",
  "err.createBook": "Could not add the book.",
  "err.updateBook": "Could not update the book.",
  "err.deleteBook": "Could not delete the book.",
  "err.save": "Could not save. Try again.",
  "err.uploadPhoto": "Could not upload the photo.",
  "err.generic": "Something went wrong. Try again.",
};

const DICTIONARIES = { pt, en };
export const LANGUAGES = ["pt", "en"];

function detectLanguage() {
  try {
    const saved = localStorage.getItem("lang");
    if (DICTIONARIES[saved]) return saved;
  } catch {
    // navegador sem acesso ao localStorage
  }
  return navigator.language?.toLowerCase().startsWith("pt") ? "pt" : "en";
}

let current = detectLanguage();
const listeners = new Set();

function syncDocument() {
  document.documentElement.lang = current === "pt" ? "pt-BR" : "en";
}
syncDocument();

export function getLanguage() {
  return current;
}

export function setLanguage(lang) {
  if (!DICTIONARIES[lang] || lang === current) return;
  current = lang;
  try {
    localStorage.setItem("lang", lang);
  } catch {
    // sem localStorage o idioma vale só nesta aba
  }
  syncDocument();
  listeners.forEach((listener) => listener());
}

// t("search.added", { title: "Duna" }) troca {title} pelo valor
export function t(key, vars) {
  let text = DICTIONARIES[current][key] ?? pt[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, value);
    }
  }
  return text;
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useI18n() {
  const lang = useSyncExternalStore(subscribe, getLanguage);
  return { lang, t, setLanguage };
}
