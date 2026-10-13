# 📚 My Own BookShelf · Personal Library Frontend

A React interface for a personal digital library, built with a fully custom design system — no UI library, every component styled from scratch.

**Live demo:** [my-own-bookshelf.vercel.app](https://my-own-bookshelf.vercel.app) (user `visitante`, password `biblioteca2026`)

This is the frontend counterpart to [personal-library-api](https://github.com/ilucasoliveira/personal-library-api), consuming its REST endpoints to manage books, reading status, ratings, and a personal profile.

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
- **Google Books API** — external book search integration

---

## ✨ Features

- Login screen backed by the API's HTTP Basic Auth — no credentials are baked into the client bundle, only entered at runtime and kept in the browser session
- Animated twilight-gradient hero on the login screen, tying into the app's visual identity
- Book search via Google Books API, with pagination and manual-entry fallback
- Inline field validation on manual book entry — no browser alerts, errors surface next to the relevant field
- Personal library with tab-based filtering (favorites, to-read, read, all)
- In-library search and multi-criteria sorting (title, author, genre)
- Book details view with inline editing, 5-star rating, favoriting, and personal comments
- Reading status tracking with a "currently reading" carousel on the home screen
- Time-aware greeting (good morning/afternoon/evening)
- Profile page with reading statistics and photo upload
- Installable as a Progressive Web App (custom icons, standalone display, works on iOS/Android home screens)
- Fully responsive layout (mobile bottom nav + floating action button, desktop top nav)
- Custom design system built around CSS variables — no Tailwind, no component library
- **Demo mode** (`VITE_DEMO_MODE=true`): the login screen shows the public credentials and a "log in as visitor" button, example books carry an "Example" badge, and API errors (such as editing an example book) appear as friendly messages instead of failing silently

---

## 🏗 Project Structure

```
src/
├── App.jsx                 # Main app shell, routing state, navigation
├── index.css                # Design tokens (colors, spacing, typography) + global styles
├── components/
│   ├── BookCard.jsx          # Library grid card
│   └── BookResultCard.jsx    # Search result card
├── pages/
│   ├── Login.jsx               # Login screen (HTTP Basic Auth)
│   ├── SearchBooks.jsx        # Google Books search + pagination
│   ├── BookDetails.jsx        # Book detail/edit view
│   ├── AddManual.jsx          # Manual book entry form
│   └── Profile.jsx            # Profile + stats
├── components/Toast.jsx       # Quick on-screen messages (success and errors)
├── config.js                 # App name and demo mode settings
├── services/
│   ├── api.js                  # Backend REST client (runtime-provided auth token)
│   └── googleBooks.js          # Google Books API client
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
# (and VITE_DEMO_MODE=true for a demo deployment)

# Run the development server
npm run dev
```

Login credentials are entered at runtime through the login screen. They match the backend's `APP_USERNAME`/`APP_PASSWORD` values and are never stored in this project's source. The only exception is the public demo, whose credentials are public on purpose.

---

## ☁️ Deployment

Deployed on **[Vercel](https://vercel.com)**, consuming the [personal-library-api](https://github.com/ilucasoliveira/personal-library-api) backend hosted on Render.

### 🎭 Live demo

**Try it:** [my-own-bookshelf.vercel.app](https://my-own-bookshelf.vercel.app)

| | |
|---|---|
| Username | `visitante` |
| Password | `biblioteca2026` |

Or just click **"Entrar como visitante"** on the login screen. The demo is a separate deployment (its own API and database), so you can explore a shelf of example books and add, rate and delete your own. Example books are read-only and the books you add are removed after a day.

The main deployment is a private, password-protected personal library.

---

## 📄 License

This project is licensed under the MIT License.
