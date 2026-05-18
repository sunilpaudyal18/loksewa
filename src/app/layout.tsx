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
  title: "LoksewaPro — AI-Powered Exam Preparation",
  description:
    "Transform scanned Loksewa question papers into interactive practice tests using AI-powered OCR. Study smarter, score higher.",
  keywords: "Loksewa, Nepal, exam preparation, PSC, practice test, MCQ, Nepali",
  openGraph: {
    title: "LoksewaPro",
    description: "AI-powered Loksewa exam preparation platform",
    type: "website",
  },
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
      </body>
    </html>
  );
}
