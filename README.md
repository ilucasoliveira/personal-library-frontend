# 📚 My Own BookShelf · Personal Library Frontend

A React interface for a personal digital library, built with a fully custom design system — no UI library, every component styled from scratch. Each person creates an account, keeps their own shelf and picks their own theme, accent color and language (Portuguese or English).

**Try it:** [my-own-bookshelf.vercel.app](https://my-own-bookshelf.vercel.app). Create an account, or click **"Continue as visitor"** to explore a sample shelf.

This is the frontend counterpart to [personal-library-api](https://github.com/ilucasoliveira/personal-library-api), consuming its REST endpoints for accounts, books, reading status, ratings and settings.

---

## 🛠 Tech Stack

[![CI](https://github.com/ilucasoliveira/personal-library-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/ilucasoliveira/personal-library-frontend/actions/workflows/ci.yml)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?logo=javascript&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?logo=pwa&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

- **React 19** — component-based UI
- **Vite** — dev server and build tooling
- **vite-plugin-pwa** — installable Progressive Web App support
- **Vanilla CSS custom properties** — a hand-built design system (colors, spacing, typography scale) instead of a component library
- **Google Books API + Open Library**: external book search, the second one as a fallback
- **Fontsource**: Fraunces, Inter, Literata and IBM Plex Mono served from the app itself
- **Vitest** for unit tests and **Playwright + axe-core** for end-to-end and accessibility tests, run on every push by GitHub Actions

---

## ✨ Features

**Shelf**
- Summary line (books, reading now, read this year), a "Reading now" strip and one search box that filters as you type
- Status tabs with counts (all, reading, want to read, read, favorites), sorting, and a grid or list view
- Tab, sort, view and search live in the URL (`/?aba=lidos&ordem=autor&vista=lista&q=duna`), so Back, reload and shared links keep the same shelf
- The shelf is cached in the browser: it shows up instantly and stays visible if the API is unreachable

**Book page** (`/livro/:id`, opens directly from a link)
- Status, rating and favorite side by side, all optimistic (they undo themselves if the API refuses)
- Personal note that saves itself a second after you stop typing
- Synopsis collapsed to 5 lines, a catalog-card style record (genre, added, finished)
- Edit and delete in a "⋯" menu; deleting asks in an in-app dialog and offers **Undo** for 6 seconds

**Adding books**
- Catalog search on Google Books with Open Library as a fallback; errors look different from "no results"
- Add as "want to read" or pick another status; books already on the shelf show "On your shelf"
- Manual form with validation on blur and submit, genre suggestions, cover preview, duplicate warning and a guard against losing unsaved input

**Profile and settings**
- Books read per month in the current year, three headline numbers and a "reader card"
- Themes (Twilight, Paper, Sepia, Forest), any accent color, Portuguese or English, all saved on the account

**Quality**
- Keyboard and screen reader friendly: real links for books, visible focus, skip link, labelled controls, `prefers-reduced-motion`
- Text and controls checked for WCAG AA contrast in all four themes
- Security headers on Vercel (Content Security Policy, `nosniff`, `frame-ancestors 'none'`, Referrer and Permissions policies)
- Installable PWA; an error screen with "Reload" if something breaks instead of a blank page

## 🏗 Project Structure

```
src/
├── App.jsx                # Shell: session, routes, top and bottom navigation, cache, undo delete
├── router.js              # Tiny router on the History API (no library)
├── i18n.js                # Portuguese and English dictionaries + useI18n hook
├── theme.js               # Applies theme and accent color
├── index.css              # Design tokens, the four themes and page styles
├── components/
│   ├── ui/                # Base components: Button, Cover, Dialog, MenuButton, SearchField, SelectField, Stars, StatusIcon
│   ├── BookCard.jsx       # Shelf card (link + separate favorite button)
│   ├── AccountMenu.jsx    # Avatar menu (Settings, Log out)
│   ├── ErrorBoundary.jsx  # "Something went wrong" screen
│   ├── Link.jsx           # <a> that navigates without reloading
│   └── Toast.jsx          # Short messages with an optional action ("View book", "Undo")
├── pages/                 # Library, BookDetails, AddBook (SearchBooks + AddManual), Profile, Settings, Login
├── services/
│   ├── api.js             # REST client: bearer token, errors translated by their code
│   └── googleBooks.js     # Catalog search: Google Books, then Open Library
├── utils/                 # bookKey, coverColor, notify
└── __tests__/             # Vitest unit tests
e2e/                       # Playwright tests with a mocked API (mock-api.js)
```

---

## 🚀 Running Locally

**Requirements:** Node.js 20.19+ (or 22.12+), a running instance of [personal-library-api](https://github.com/ilucasoliveira/personal-library-api).

```bash
# Clone the repository
git clone https://github.com/ilucasoliveira/personal-library-frontend.git
cd personal-library-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# then fill in VITE_API_URL and VITE_GOOGLE_BOOKS_KEY
# (and VITE_DEMO_MODE=true for the public deployment)

# Run the development server
npm run dev
```

### Tests

```bash
npm run lint        # oxlint
npm test            # unit tests (Vitest)
npm run test:e2e    # end-to-end + accessibility (Playwright and axe), with a mocked API
```

The first `test:e2e` run needs the browser: `npx playwright install chromium`. The end-to-end tests build the app into `dist-e2e` pointing at a fake API address and intercept every API call (`e2e/mock-api.js`), so they don't need the backend running. GitHub Actions runs all of this on every push (`.github/workflows/ci.yml`).

Accounts live in the API. If sign up is turned off there (`ALLOW_SIGNUP=false`), the login screen hides "Create account".

---

## ☁️ Deployment

Deployed on **[Vercel](https://vercel.com)**, consuming the [personal-library-api](https://github.com/ilucasoliveira/personal-library-api) backend hosted on Render.

`vercel.json` sends every route to `index.html` (so `/livro/12` works on reload) and sets the security headers. The Content Security Policy only lets the app talk to the API at `bookshelf-demo-api.onrender.com`, Google Books and Open Library: **if the API moves to another address, update `connect-src` in `vercel.json`**, or every request will be blocked.

Lighthouse on mobile (local build, shelf with 50 books): Performance 99, Accessibility 100, Best Practices 100, SEO 100.

### 🎭 Live app

**Try it:** [my-own-bookshelf.vercel.app](https://my-own-bookshelf.vercel.app)

Create an account to get your own shelf, or click **"Continue as visitor"** to explore a shelf of example books. On the visitor account, example books are read-only, the books you add are removed after a day, and theme and language are saved only in your browser.

---

## 📄 License

This project is licensed under the MIT License.
