import type { Metadata } from "next";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoSansDevanagari = Noto_Sans_Devanagari({
  weight: ["400", "500", "600", "700"],
  subsets: ["devanagari"],
  variable: "--font-noto-sans-devanagari",
});

export const metadata: Metadata = {
  title: {
    default: "LoksewaPro — AI-Powered Loksewa Exam Preparation",
    template: "%s | LoksewaPro",
  },
  description:
    "Transform scanned Loksewa question papers into interactive practice tests using AI-powered OCR. Study smarter, score higher. Free for Nepal PSC aspirants.",
  keywords: ["Loksewa", "Nepal PSC", "exam preparation", "practice test", "MCQ", "Nepali OCR", "Kharidar", "Nayab Subba", "Section Officer"],
  authors: [{ name: "Sunil Paudyal", url: "https://sunil.sajilodigital.com.np/" }],
  creator: "Sunil Paudyal",
  metadataBase: new URL("https://loksewapro.vercel.app"),
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/loksewa/convertico-loksewa.ico", type: "image/x-icon" },
      { url: "/loksewa/convertico-loksewa_32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/loksewa/convertico-loksewa_128x128.png", type: "image/png", sizes: "128x128" },
      { url: "/loksewa/convertico-loksewa_256x256.png", type: "image/png", sizes: "256x256" },
    ],
    apple: [{ url: "/loksewa/convertico-loksewa_256x256.png", sizes: "256x256" }],
  },
  appleWebApp: { capable: true, title: "LoksewaPro", statusBarStyle: "black-translucent" },
  other: { "theme-color": "#6366f1" },
  openGraph: {
    title: "LoksewaPro — AI-Powered Loksewa Exam Preparation",
    description: "Upload scanned Loksewa papers → Get interactive quiz in seconds. Bilingual OCR (Nepali + English).",
    type: "website",
    locale: "ne_NP",
    siteName: "LoksewaPro",
  },
  twitter: {
    card: "summary_large_image",
    title: "LoksewaPro — AI Loksewa Exam Prep",
    description: "Transform scanned question papers into interactive quizzes instantly.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ne">
      <body className={`${inter.variable} ${notoSansDevanagari.variable}`}>
        {children}
        <script dangerouslySetInnerHTML={{
          __html: `if("serviceWorker" in navigator){navigator.serviceWorker.register("/sw.js")}`,
        }} />
      </body>
    </html>
  );
}
