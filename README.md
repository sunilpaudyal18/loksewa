# 🏛️ LoksewaPro — AI-Powered Loksewa Exam Preparation

<div align="center">

Transform scanned Loksewa question papers into interactive digital quizzes using AI-powered OCR. Runs entirely in your browser.

</div>

---

## Features

- 📸 **Smart OCR Upload** — Drag & drop or snap photos from your camera. Supports JPG, PNG, WebP up to 20 images.
- 🗜️ **Auto Compression** — Images compressed automatically on-device before processing.
- 🧠 **Browser OCR** — Tesseract.js WASM runs entirely in the browser. No upload to servers.
- 🌐 **Bilingual** — Handles both English and Nepali (Devanagari) scripts.
- ✏️ **Inline Review** — Fix OCR mistakes directly on the review page.
- ⚡ **Flashcard Quiz** — One question at a time with instant feedback.
- 📊 **Dashboard** — Track scores, session history, and performance.
- 📱 **PWA** — Installable on mobile and desktop.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, Custom CSS (Dark Theme) |
| Database | PostgreSQL (Neon serverless) via Prisma ORM |
| OCR Engine | Tesseract.js WASM (browser-side) |
| State | Zustand with localStorage persistence |
| PWA | Web App Manifest + Service Worker |

## Getting Started

```bash
git clone https://github.com/sunilpaudyal18/loksewa.git
cd loksewa
npm install
cp .env.example .env.local
npx prisma generate
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="LoksewaPro"
```

## How It Works

```
📸 Upload Images → 🗜️ Compress → 🧠 Browser OCR (Tesseract WASM)
→ 🧠 Parser (Regex) → 🔑 Answer Key Matching → 💾 Save to PostgreSQL
→ ✏️ Review → ⚡ Quiz → 📊 Results
```
