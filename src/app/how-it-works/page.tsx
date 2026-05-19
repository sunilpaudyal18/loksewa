import type { Metadata } from "next";
import HowItWorksClient from "./_how-it-works-client";

export const metadata: Metadata = {
  title: "How It Works — LoksewaPro AI Exam Preparation",
  description:
    "Learn how LoksewaPro uses AI and OCR technology to convert scanned Loksewa question papers into interactive digital quizzes. Step-by-step guide for Nepal PSC aspirants.",
  keywords: ["how loksewapro works", "AI OCR exam", "Loksewa quiz generator", "Nepal PSC exam tool"],
  openGraph: {
    title: "How LoksewaPro Works — AI Loksewa Exam Prep",
    description: "Step-by-step guide: Upload → OCR → Parse → Review → Quiz. Convert any scanned paper in seconds.",
    type: "website",
  },
};

export default function HowItWorksPage() {
  return <HowItWorksClient />;
}
