"use client";

import Link from "next/link";
import { useState } from "react";
import { useInstallPWA } from "@/hooks/useInstallPWA";

const steps = [
  {
    num: "01",
    icon: "📸",
    title: "Upload Your Images",
    color: "rgba(99,102,241,0.15)",
    colorLight: "var(--primary-light)",
    desc: "Go to the Upload page and add your images in two sections:",
    details: [
      "📄 Question Pages — Upload 1 to 20 images of your question paper (JPG, PNG, WebP). Each image is automatically compressed to under 1MB.",
      "🔑 Answer Key — Upload a single image of the answer key page.",
      "📱 On mobile? Use the '📷 Take Photo' button to snap photos directly from your camera.",
      "🗜️ Images are compressed automatically on your device before upload — even 10MB photos work fine.",
    ],
  },
  {
    num: "02",
    icon: "🔍",
    title: "AI OCR Processing",
    color: "rgba(245,158,11,0.12)",
    colorLight: "var(--warning)",
    desc: "After you click 'Extract & Build Quiz', our AI pipeline runs automatically:",
    details: [
      "🧠 Tesseract OCR engine reads the text from each image using both English and Nepali (Devanagari) language models.",
      "⚙️ Images are processed one by one (sequential) to avoid server overload — each takes about 10–20 seconds.",
      "📝 The raw OCR text is passed to our custom regex parser which identifies question numbers, text, and options A, B, C, D.",
      "🔑 The answer key image is parsed separately to extract answer pairs (e.g. 1-A, 2-C, 3-B).",
      "✅ Questions and answers are automatically matched and saved to the database.",
    ],
  },
  {
    num: "03",
    icon: "✏️",
    title: "Review & Correct",
    color: "rgba(16,185,129,0.12)",
    colorLight: "var(--success)",
    desc: "The Review page shows every extracted question. Fix OCR errors here:",
    details: [
      "🖊️ Click any question text or option to edit it inline — just click, type, and click away to save.",
      "✅ Click A / B / C / D buttons (or click the entire option row) to mark the correct answer.",
      "🗑️ Delete bad/duplicate questions using the trash button on each card.",
      "💾 All changes save instantly to the database — no Save button needed.",
      "⚠️ Questions with missing options or no answer set are highlighted in orange for easy review.",
    ],
  },
  {
    num: "04",
    icon: "⚡",
    title: "Take the Quiz",
    color: "rgba(239,68,68,0.1)",
    colorLight: "var(--error)",
    desc: "Click 'Start Quiz' to enter the interactive flashcard quiz mode:",
    details: [
      "❓ One question shown at a time — no distractions.",
      "👆 Click any option to lock in your answer. The correct answer is revealed immediately.",
      "🎉 Correct answer? The card turns green and automatically moves to the next question after 1.4 seconds.",
      "❌ Wrong answer? The card turns red, shows the correct answer, and gives you a 'Next →' button.",
      "⏱️ A live timer runs throughout the quiz.",
      "📊 Use the progress grid at the bottom to jump to any question.",
    ],
  },
  {
    num: "05",
    icon: "📊",
    title: "View Your Results",
    color: "rgba(99,102,241,0.15)",
    colorLight: "var(--primary-light)",
    desc: "After submitting, get a full performance breakdown:",
    details: [
      "✅ Score: total correct, wrong, and skipped count.",
      "📈 Percentage score with a visual indicator.",
      "🔍 Full question-by-question review — see what you answered vs the correct answer.",
      "⏱ Total time taken.",
      "🔁 Retry the same paper from the Dashboard anytime.",
    ],
  },
];

const faqs = [
  {
    q: "What image formats are supported?",
    a: "JPG, JPEG, PNG, and WebP. Images are automatically compressed before processing, so file size doesn't matter.",
  },
  {
    q: "Why is OCR taking so long?",
    a: "Tesseract.js runs locally on the server and processes one image at a time to prevent crashes. Each image takes 15–30 seconds. If you have 5 images, expect 1–3 minutes total.",
  },
  {
    q: "The questions aren't parsing correctly. What do I do?",
    a: "Go to the Review page and edit any incorrect text manually. You can fix the question text, correct the options A–D, set the right answer, and delete bad questions. Everything saves instantly.",
  },
  {
    q: "Does it work with Nepali (Devanagari) text?",
    a: "Yes! The OCR engine uses both 'eng' and 'nep' language packs. Nepali numerals (१,२,३) are automatically converted and Nepali option labels (क,ख,ग,घ) are mapped to A, B, C, D.",
  },
  {
    q: "What answer key formats are supported?",
    a: "Table format (1 a  2 b  3 c), separator format (1. A, 1) B, 1-C), concatenated (1a 2b 3c), and Nepali letters (१. क → 1: A).",
  },
  {
    q: "Can I use this on my phone?",
    a: "Yes! The app is fully mobile responsive. Use the '📷 Take Photo' buttons to snap pictures of your question paper directly using your phone camera.",
  },
  {
    q: "Is my data saved?",
    a: "Yes. All paper sets and quiz sessions are saved to the local database. You can access them from the Dashboard anytime.",
  },
];

export default function HowItWorksClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function InstallPWAButton() {
    const { canInstall, install } = useInstallPWA();
    if (!canInstall) return null;
    return (
      <button onClick={install} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "var(--text-dim)", background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Install App
      </button>
    );
  }

  return (
    <main style={{ minHeight: "100vh", paddingBottom: "80px" }}>
      {/* Nav */}
      <nav className="glass" style={{ position: "sticky", top: 0, zIndex: 50, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "4rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.9rem" }}>← Back</Link>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.4rem" }}>🏛️</span>
            <span style={{ fontWeight: 800, fontSize: "1.1rem" }} className="gradient-text">LoksewaPro</span>
          </Link>
        </div>
        <Link href="/upload" className="btn-primary" style={{ fontSize: "0.875rem" }}>
          Start Now →
        </Link>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "5rem 1.5rem 3.75rem", maxWidth: "min(720px, 90vw)", margin: "0 auto" }} className="animate-fade-in">
        <div className="badge badge-primary" style={{ marginBottom: "1.25rem" }}>📖 Complete Guide</div>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 900, lineHeight: 1.15, marginBottom: "1.25rem" }}>
          How <span className="gradient-text">LoksewaPro</span> Works
        </h1>
        <p style={{ fontSize: "1.1rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
          From a scanned book page to a full interactive quiz in under a minute.
          Here&apos;s exactly what happens at each step.
        </p>
      </section>

      {/* Pipeline diagram */}
      <section style={{ maxWidth: "min(900px, 90vw)", margin: "0 auto", padding: "0 1.5rem 3.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: "0.5rem", fontSize: "0.9rem" }}>
          {["📸 Upload", "→", "🔍 OCR", "→", "🧠 Parse", "→", "✏️ Review", "→", "⚡ Quiz", "→", "📊 Results"].map((s, i) => (
            s === "→" ? (
              <span key={i} style={{ color: "var(--text-dim)", fontSize: "1.2rem" }}>→</span>
            ) : (
              <span key={i} style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: "20px", padding: "0.375rem 1rem", fontWeight: 600, color: "var(--primary-light)" }}>{s}</span>
            )
          ))}
        </div>
      </section>

      {/* Steps */}
      <section style={{ maxWidth: "min(960px, 90vw)", margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
          {steps.map((step, idx) => (
            <div key={idx} className="card animate-fade-in" style={{ borderLeft: `3px solid ${step.colorLight}`, position: "relative" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                <div style={{ width: "3.25rem", height: "3.25rem", borderRadius: "14px", background: step.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", flexShrink: 0 }}>
                  {step.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 800, color: step.colorLight, textTransform: "uppercase", letterSpacing: "0.08em" }}>Step {step.num}</span>
                  </div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.625rem" }}>{step.title}</h2>
                  <p style={{ color: "var(--text-muted)", marginBottom: "1rem", fontSize: "0.95rem" }}>{step.desc}</p>
                  <ul style={{ display: "flex", flexDirection: "column", gap: "0.625rem", paddingLeft: 0, listStyle: "none", margin: 0 }}>
                    {step.details.map((d, di) => (
                      <li key={di} style={{ fontSize: "0.9rem", lineHeight: 1.65, color: "var(--text-muted)", paddingLeft: "0.25rem" }}>{d}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section style={{ maxWidth: "min(960px, 90vw)", margin: "3rem auto 0", padding: "0 1.5rem" }}>
        <div style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "var(--radius)", padding: "1.75rem 2rem" }}>
          <h2 style={{ fontWeight: 800, marginBottom: "1rem", fontSize: "1.15rem" }}>💡 Tips for Best OCR Results</h2>
          <ul style={{ display: "flex", flexDirection: "column", gap: "0.625rem", paddingLeft: 0, listStyle: "none", margin: 0 }}>
            {[
              "📸 Take photos in good lighting — avoid shadows across the text.",
              "📐 Keep the camera parallel to the page — avoid angled shots.",
              "🔍 Make sure the text is sharp. Slightly blurry images will fail OCR.",
              "📄 One page per image is ideal. Don't include the spine/binding.",
              "🔑 The answer key image should be clear and all text visible.",
              "✏️ If OCR misreads text, use the Review page to correct it manually.",
            ].map((tip, i) => (
              <li key={i} style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{tip}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: "min(960px, 90vw)", margin: "3rem auto 0", padding: "0 1.5rem" }}>
        <h2 style={{ fontSize: "clamp(1.2rem, 2vw, 1.8rem)", fontWeight: 800, marginBottom: "1.5rem" }}>❓ Frequently Asked Questions</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: "100%", background: "none", border: "none", padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", color: "var(--text)", fontWeight: 600, fontSize: "0.95rem", textAlign: "left", gap: "0.75rem" }}>
                <span>{faq.q}</span>
                <span style={{ flexShrink: 0, color: "var(--text-muted)", transition: "transform 0.2s", transform: openFaq === i ? "rotate(180deg)" : "none" }}>▼</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: "0 1.25rem 1rem", fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.7 }} className="animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: "min(600px, 90vw)", margin: "3.5rem auto 0", padding: "0 1.5rem", textAlign: "center" }}>
        <div style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(245,158,11,0.08))", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "24px", padding: "3rem 2rem" }}>
          <h2 style={{ fontSize: "clamp(1.2rem, 2vw, 1.8rem)", fontWeight: 800, marginBottom: "0.75rem" }}>Ready to Try It?</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.75rem" }}>Upload your first paper and get a quiz in under a minute.</p>
          <Link href="/upload" className="btn-primary" style={{ fontSize: "1rem" }}>
            📸 Upload Question Paper →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "2rem 1.5rem", marginTop: "4rem" }}>
        <div style={{ maxWidth: "min(860px, 90vw)", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.625rem" }}>
          <InstallPWAButton />
          <p style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}>
            Made with ❤️ by{" "}
            <a href="https://sunil.sajilodigital.com.np/" target="_blank" rel="noopener noreferrer"
              style={{ color: "var(--primary-light)", textDecoration: "none", fontWeight: 600 }}>
              Sunil Paudyal
            </a>
            {" "}🇳🇵
          </p>
        </div>
      </footer>
    </main>
  );
}
