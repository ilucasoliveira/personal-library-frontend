# 📚 Personal Library — Frontend

A React interface for a personal digital library, built with a fully custom design system — no UI library, every component styled from scratch.

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
- Book search via Google Books API, with pagination and manual-entry fallback
- Personal library with tab-based filtering (favorites, to-read, read, all)
- In-library search and multi-criteria sorting (title, author, genre)
- Book details view with inline editing, 5-star rating, favoriting, and personal comments
- Reading status tracking with a "currently reading" carousel on the home screen
- Time-aware greeting (good morning/afternoon/evening)
- Profile page with reading statistics and photo upload
- Installable as a Progressive Web App (custom icons, standalone display, works on iOS/Android home screens)
- Fully responsive layout (mobile bottom nav + floating action button, desktop top nav)
- Custom design system built around CSS variables — no Tailwind, no component library

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
├── services/
│   ├── api.js                  # Backend REST client (runtime-provided auth token)
│   └── googleBooks.js          # Google Books API client
└── utils/
    └── coverColor.js            # Deterministic color generator for covers without an image
```

---

## 🚀 Running Locally

**Requirements:** Node.js 18+, a running instance of [personal-library-api](https://github.com/ilucasoliveira/personal-library-api).

```bash
# Clone the repository
git clone https://github.com/ilucasoliveira/personal-library-frontend.git
cd personal-library-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# then fill in VITE_API_URL and VITE_GOOGLE_BOOKS_KEY

# Run the development server
npm run dev
```

Login credentials are entered at runtime through the login screen — they match the backend's `MEU_USUARIO`/`MINHA_SENHA` values and are never stored in this project's source or environment files.

---

## ☁️ Deployment

Deployed on **[Vercel](https://vercel.com)**, consuming the [personal-library-api](https://github.com/ilucasoliveira/personal-library-api) backend hosted on Render.

**Live demo:** [personal-library-frontend-snowy.vercel.app](https://personal-library-frontend-snowy.vercel.app)

> This is a private, password-protected personal library — the live demo requires valid login credentials to view any data. The link is shared to demonstrate the working deployment and UI; feel free to explore the source code above to see the full implementation.

---

## 📄 License

This project is licensed under the MIT License.