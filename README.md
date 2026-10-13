# 📚 My Own BookShelf · Personal Library Frontend

A React interface for a personal digital library, built with a fully custom design system — no UI library, every component styled from scratch. Each person creates an account, keeps their own shelf and picks their own theme, accent color and language (Portuguese or English).

**Try it:** [my-own-bookshelf.vercel.app](https://my-own-bookshelf.vercel.app). Create an account, or click **"Continue as visitor"** to explore a sample shelf.

This is the frontend counterpart to [personal-library-api](https://github.com/ilucasoliveira/personal-library-api), consuming its REST endpoints for accounts, books, reading status, ratings and settings.

---

## 🛠 Tech Stack

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

---

## ✨ Features

- Sign up and log in with email and password; the API returns a token (JWT) that stays in the browser, so you stay logged in until it expires
- **Themes**: Twilight, Paper (light), Sepia and Forest, plus an accent color (presets or any color). Applied instantly through CSS variables and saved on the account
- **Two languages**: Portuguese and English, detected from the browser on first visit and saved on the account. No i18n library: one dictionary per language and a small React hook
- Account settings: change name and password, delete the account
- Animated twilight-gradient hero on the login screen, tying into the app's visual identity
- Book search on Google Books with Open Library as a second source when Google is down or finds nothing; a search error is shown apart from "no results", with a retry button and manual entry as a fallback
- Inline field validation on manual book entry — no browser alerts, errors surface next to the relevant field
- Personal library with tab-based filtering (favorites, to-read, read, all)
- In-library search and multi-criteria sorting (title, author, genre)
- Book details view with inline editing, 5-star rating, favoriting, and personal comments
- Reading status tracking with a "currently reading" carousel on the home screen
- Time-aware greeting (good morning/afternoon/evening)
- Profile page with reading statistics and a profile photo per account
- Installable as a Progressive Web App (custom icons, standalone display, works on iOS/Android home screens)
- Fully responsive layout (mobile bottom nav + floating action button, desktop top nav)
- Custom design system built around CSS variables — no Tailwind, no component library
- **Public deployment** (`VITE_DEMO_MODE=true`): the login screen shows "Create account" and "Continue as visitor" right away (the API confirms through `/ping`); the visitor's example books carry an "Example" badge
- API errors appear as friendly, translated messages instead of failing silently
- A "waking up the server" hint when the free-tier API takes a while to answer

---

## 🏗 Project Structure

```
src/
├── App.jsx                 # Main app shell: session, routing state, navigation
├── index.css                # Design tokens + the four themes + global styles
├── i18n.js                  # Portuguese and English dictionaries + useI18n hook
├── theme.js                 # Applies theme and accent color, remembers the last one
├── components/
│   ├── BookCard.jsx          # Library grid card
│   └── BookResultCard.jsx    # Search result card
├── pages/
│   ├── Login.jsx               # Log in / sign up / visitor
│   ├── Settings.jsx            # Theme, accent color, language, account
│   ├── SearchBooks.jsx        # Google Books search + pagination
│   ├── BookDetails.jsx        # Book detail/edit view
│   ├── AddManual.jsx          # Manual book entry form
│   └── Profile.jsx            # Profile + stats
├── components/Toast.jsx       # Quick on-screen messages (success and errors)
├── config.js                 # App name and public-deployment flag
├── services/
│   ├── api.js                  # Backend REST client (bearer token, translated errors)
│   └── googleBooks.js          # Book search: Google Books, then Open Library
└── utils/
    └── coverColor.js            # Deterministic color generator for covers without an image
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

Accounts live in the API. If sign up is turned off there (`ALLOW_SIGNUP=false`), the login screen hides "Create account".

---

## ☁️ Deployment

Deployed on **[Vercel](https://vercel.com)**, consuming the [personal-library-api](https://github.com/ilucasoliveira/personal-library-api) backend hosted on Render.

### 🎭 Live app

**Try it:** [my-own-bookshelf.vercel.app](https://my-own-bookshelf.vercel.app)

Create an account to get your own shelf, or click **"Continue as visitor"** to explore a shelf of example books. On the visitor account, example books are read-only, the books you add are removed after a day, and theme and language are saved only in your browser.

---

## 📄 License

This project is licensed under the MIT License.
