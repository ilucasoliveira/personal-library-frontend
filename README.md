# 📚 Personal Library — Frontend

A React interface for a personal digital library, built with a fully custom design system — no UI library, every component styled from scratch.

This is the frontend counterpart to [personal-library-api](https://github.com/ilucasoliveira/personal-library-api), consuming its REST endpoints to manage books, reading status, ratings, and a personal profile.

---

## 🛠 Tech Stack

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/license-MIT-green)

- **React 19** — component-based UI
- **Vite** — dev server and build tooling
- **Vanilla CSS custom properties** — a hand-built design system (colors, spacing, typography scale) instead of a component library
- **Google Books API** — external book search integration

---

## ✨ Features

- Book search via Google Books API, with pagination and manual-entry fallback
- Personal library with tab-based filtering (favorites, to-read, read, all)
- In-library search and multi-criteria sorting (title, author, genre)
- Book details view with inline editing, 5-star rating, favoriting, and personal comments
- Reading status tracking with a "currently reading" carousel on the home screen
- Time-aware greeting (good morning/afternoon/evening)
- Profile page with reading statistics and photo upload
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
│   ├── SearchBooks.jsx        # Google Books search + pagination
│   ├── BookDetails.jsx        # Book detail/edit view
│   ├── AddManual.jsx          # Manual book entry form
│   └── Profile.jsx            # Profile + stats
├── services/
│   ├── api.js                  # Backend REST client
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
# then fill in VITE_API_URL, VITE_API_USER, VITE_API_PASSWORD, VITE_GOOGLE_BOOKS_KEY

# Run the development server
npm run dev
```

---

## 🌐 Live Demo

> 🔧 Deployment in progress — link coming soon.

---

## 📄 License

This project is licensed under the MIT License.