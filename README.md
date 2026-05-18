# 🏛️ LoksewaPro — AI-Powered Loksewa Exam Preparation

<div align="center">

![LoksewaPro Banner](https://img.shields.io/badge/LoksewaPro-AI%20Exam%20Prep-6366f1?style=for-the-badge&logo=graduation-cap)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=flat-square&logo=tailwindcss)

**Transform scanned Loksewa question papers into interactive digital quizzes using AI-powered OCR.**

</div>

---

## ✨ Features

- 📸 **Smart OCR Upload** — Drag & drop or snap photos directly from your phone camera. Supports JPG, PNG, WebP up to 20 images.
- 🗜️ **Auto Image Compression** — Images are automatically compressed before upload for fast processing.
- 🧠 **Bilingual AI Parser** — Understands both **English** and **Nepali (Devanagari)** scripts. Handles `A) B) C) D)` inline or multi-line option layouts.
- ✏️ **Inline Review & Edit** — Fix OCR mistakes directly on the review page. Click any field to edit, click the correct answer to mark it, delete bad questions.
- ⚡ **Flashcard Quiz Mode** — One question at a time. Click an option to reveal instantly whether you're right or wrong. Auto-advances on correct answers.
- 📊 **Performance Dashboard** — Track scores, answered/skipped, session history.
- 💾 **Persistent Progress** — Quiz state survives page refreshes using Zustand with localStorage.
- 📱 **Mobile Responsive** — Fully responsive with direct camera capture support on mobile browsers.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, Custom CSS (Glassmorphism, Dark Theme) |
| Database | SQLite (local) via **Prisma ORM v5** |
| OCR Engine | **Tesseract.js** (server-side, `eng+nep` language packs) |
| State Management | **Zustand** with localStorage persistence |
| Image Compression | **browser-image-compression** |
| Fonts | Inter + Noto Sans Devanagari (via `next/font/google`) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/sunilpaudyal18/loksewapro.git
cd loksewapro

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your settings

# 4. Set up the database
npx prisma generate
npx prisma db push

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root:

```env
# Database (SQLite for local development)
DATABASE_URL="file:./dev.db"

# NextAuth (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Google Cloud Vision API (better OCR for Nepali)
GOOGLE_CLOUD_VISION_API_KEY=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="LoksewaPro"
```

---

## 📁 Project Structure

```
loksewapro/
├── prisma/
│   └── schema.prisma         # Database models
├── src/
│   ├── app/
│   │   ├── api/              # Backend API routes
│   │   │   ├── upload/       # File upload handler
│   │   │   ├── process/      # OCR + parsing pipeline
│   │   │   ├── paperset/     # CRUD for paper sets
│   │   │   ├── quiz/         # Quiz session management
│   │   │   ├── results/      # Score calculation
│   │   │   └── dashboard/    # Analytics data
│   │   ├── upload/           # Upload page
│   │   ├── review/[id]/      # Review & edit page
│   │   ├── quiz/[id]/        # Interactive quiz
│   │   ├── results/[id]/     # Results & analytics
│   │   ├── dashboard/        # Dashboard
│   │   ├── globals.css       # Design system
│   │   └── layout.tsx        # Root layout
│   ├── lib/
│   │   ├── db.ts             # Prisma client singleton
│   │   ├── ocr/
│   │   │   └── tesseract.ts  # OCR wrapper (eng+nep)
│   │   └── parser/
│   │       ├── questionParser.ts   # MCQ extraction engine
│   │       ├── answerKeyParser.ts  # Answer key parser
│   │       └── ocrCorrections.ts  # Bilingual normalization
│   └── store/
│       ├── quizStore.ts      # Quiz state (Zustand)
│       └── uploadStore.ts    # Upload state (Zustand)
└── next.config.ts
```

---

## 🔄 How It Works

```
📸 Upload Images
      ↓
🗜️ Auto-compress (browser-image-compression)
      ↓
☁️  Save to server temp directory
      ↓
🔍 Tesseract.js OCR (eng+nep, sequential processing)
      ↓
🧠 Regex Parser (splitInlineOptions + line-by-line blocks)
      ↓
🔑 Answer Key Matching (table / separator / concat formats)
      ↓
💾 Save to SQLite via Prisma
      ↓
✏️  Review & Edit Page
      ↓
⚡ Flashcard Quiz → 📊 Results
```

---

## 📸 Supported Answer Key Formats

| Format | Example |
|---|---|
| With separator | `1. A`, `1) B`, `1-C`, `1:D` |
| Table format | `1 a  2 b  3 c  4 d` |
| Concatenated | `1a 2b 3c 4d` |
| Nepali letters | `१. क` → `1: A` |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) file for details.

---

<div align="center">
Made with ❤️ for Loksewa aspirants of Nepal 🇳🇵
</div>
