"use client";

import Link from "next/link";
import { useState } from "react";

const features = [
  {
    icon: "📸",
    title: "Smart OCR Upload",
    desc: "Upload scanned question papers and answer keys. Our AI reads both English and Nepali text accurately.",
  },
  {
    icon: "🧠",
    title: "Auto Question Parsing",
    desc: "Regex-powered engine extracts questions, options A–D, and matches them with answer keys automatically.",
  },
  {
    icon: "⚡",
    title: "Interactive Practice",
    desc: "Attempt questions, track time, skip and return, then get a detailed score breakdown.",
  },
  {
    icon: "📊",
    title: "Performance Analytics",
    desc: "Review every answer, see where you went wrong, and track improvement over sessions.",
  },
  {
    icon: "🌐",
    title: "Bilingual Support",
    desc: "Full support for both Nepali (Devanagari) and English questions in the same paper.",
  },
  {
    icon: "📱",
    title: "Works Everywhere",
    desc: "Optimized for low-end devices and slow connections. Practice anywhere, anytime.",
  },
];

const steps = [
  { num: "01", title: "Upload Images", desc: "Drag & drop your question paper pages and the answer key image." },
  { num: "02", title: "AI Processing", desc: "Our OCR + parser engine extracts all questions and matches answers." },
  { num: "03", title: "Review & Fix", desc: "Check extracted questions, fix any OCR errors before practicing." },
  { num: "04", title: "Start Quiz", desc: "Take the interactive quiz, submit, and get your score instantly." },
];

export default function LandingPage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <main style={{ minHeight: "100vh" }}>
      {/* ---- Nav ---- */}
      <nav className="glass" style={{
        position: "sticky", top: 0, zIndex: 50,
        padding: "0 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: "64px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.6rem" }}>🏛️</span>
          <span style={{ fontWeight: 800, fontSize: "1.2rem" }}>
            <span className="gradient-text">LoksewaPro</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link href="/dashboard" className="btn-secondary" style={{ padding: "8px 18px", fontSize: "0.875rem" }}>
            Dashboard
          </Link>
          <Link href="/upload" className="btn-primary" style={{ padding: "8px 18px", fontSize: "0.875rem" }}>
            Start Now →
          </Link>
        </div>
      </nav>

      {/* ---- Hero ---- */}
      <section style={{
        textAlign: "center", padding: "100px 24px 80px",
        maxWidth: "800px", margin: "0 auto",
      }} className="animate-fade-in">
        <div className="badge badge-primary" style={{ marginBottom: "24px", fontSize: "0.85rem" }}>
          🇳🇵 Built for Nepal's Loksewa Aspirants
        </div>
        <h1 style={{
          fontSize: "clamp(2.4rem, 6vw, 4rem)",
          fontWeight: 900, lineHeight: 1.1, marginBottom: "24px",
        }}>
          Transform Scanned Papers into{" "}
          <span className="gradient-text">Interactive Quizzes</span>
        </h1>
        <p style={{
          fontSize: "1.15rem", color: "var(--text-muted)",
          marginBottom: "40px", lineHeight: 1.7,
        }}>
          Upload your Loksewa question paper images. Our AI reads Nepali & English text,
          extracts every MCQ, matches with the answer key, and gives you a full practice quiz — instantly.
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/upload" className="btn-primary" style={{ padding: "14px 32px", fontSize: "1rem" }}>
            📸 Upload Question Paper
          </Link>
          <Link href="/dashboard" className="btn-secondary" style={{ padding: "14px 32px", fontSize: "1rem" }}>
            View My Sets
          </Link>
        </div>

        {/* Stats row */}
        <div style={{
          display: "flex", gap: "40px", justifyContent: "center",
          marginTop: "64px", flexWrap: "wrap",
        }}>
          {[
            { val: "100+", label: "Questions/paper" },
            { val: "Eng+नेपाली", label: "Bilingual OCR" },
            { val: "< 30s", label: "Processing time" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--primary-light)" }}>{s.val}</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- How it works ---- */}
      <section style={{ padding: "80px 24px", maxWidth: "1100px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 800, marginBottom: "12px" }}>
          How It Works
        </h2>
        <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: "56px" }}>
          Four simple steps to go from scanned paper to scored quiz
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "24px",
        }}>
          {steps.map((step) => (
            <div key={step.num} className="card" style={{ position: "relative", overflow: "hidden" }}>
              <div style={{
                fontSize: "3.5rem", fontWeight: 900,
                color: "rgba(99,102,241,0.12)",
                position: "absolute", top: "8px", right: "16px",
                lineHeight: 1,
              }}>{step.num}</div>
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: "rgba(99,102,241,0.15)", display: "flex",
                alignItems: "center", justifyContent: "center",
                color: "var(--primary-light)", fontWeight: 800, fontSize: "0.9rem",
                marginBottom: "16px",
              }}>{step.num}</div>
              <h3 style={{ fontWeight: 700, marginBottom: "8px" }}>{step.title}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Features ---- */}
      <section style={{ padding: "80px 24px", maxWidth: "1100px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 800, marginBottom: "12px" }}>
          Everything You Need
        </h2>
        <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: "56px" }}>
          A complete AI-powered study toolkit
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
        }}>
          {features.map((f, i) => (
            <div
              key={i}
              className="card"
              onMouseEnter={() => setHoveredFeature(i)}
              onMouseLeave={() => setHoveredFeature(null)}
              style={{
                cursor: "default",
                transform: hoveredFeature === i ? "translateY(-4px)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "12px" }}>{f.icon}</div>
              <h3 style={{ fontWeight: 700, marginBottom: "8px" }}>{f.title}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section style={{
        padding: "80px 24px 120px",
        textAlign: "center",
        maxWidth: "600px", margin: "0 auto",
      }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(245,158,11,0.08))",
          border: "1px solid rgba(99,102,241,0.3)",
          borderRadius: "24px", padding: "56px 40px",
        }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "16px" }}>
            Ready to Study Smarter?
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "32px" }}>
            Upload your first question paper and get a full interactive quiz in under 30 seconds.
          </p>
          <Link href="/upload" className="btn-primary" style={{ padding: "16px 40px", fontSize: "1.05rem" }}>
            🚀 Get Started Free
          </Link>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer style={{
        borderTop: "1px solid var(--border)",
        padding: "24px",
        textAlign: "center",
        color: "var(--text-dim)",
        fontSize: "0.85rem",
      }}>
        <span>🏛️ LoksewaPro — Built for Nepal&apos;s Loksewa aspirants</span>
      </footer>
    </main>
  );
}
