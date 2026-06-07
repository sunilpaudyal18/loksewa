import type { Metadata } from "next";
import LandingPage from "./_home";

export const metadata: Metadata = {
  title: "LoksewaPro — AI-Powered Loksewa Exam Preparation Platform",
  description:
    "Upload scanned Loksewa question papers and get instant interactive quizzes. AI OCR reads Nepali & English MCQs, auto-matches answer keys, and gives you a complete practice test in seconds. Free for all Nepal Public Service Commission aspirants.",
  keywords: [
    "Loksewa exam preparation",
    "Nepal PSC practice test",
    "Loksewa MCQ quiz",
    "AI OCR question paper",
    "Nepali exam quiz",
    "Public Service Commission Nepal",
    "Loksewa practice",
    "Kharidar exam",
    "Nayab Subba practice",
    "Section Officer exam Nepal",
  ],
  authors: [{ name: "Sunil Paudyal", url: "https://sunil.sajilodigital.com.np/" }],
  creator: "Sunil Paudyal",
  openGraph: {
    title: "LoksewaPro — AI-Powered Loksewa Exam Preparation",
    description:
      "Transform scanned Loksewa papers into interactive quizzes instantly. Bilingual OCR (Nepali + English), auto answer matching, flashcard quiz mode.",
    type: "website",
    locale: "ne_NP",
    siteName: "LoksewaPro",
  },
  twitter: {
    card: "summary_large_image",
    title: "LoksewaPro — AI Loksewa Exam Prep",
    description: "Upload scanned question papers → Get interactive practice quiz in seconds.",
    creator: "@sunilpaudyal",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default LandingPage;
