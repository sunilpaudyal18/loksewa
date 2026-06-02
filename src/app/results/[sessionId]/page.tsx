"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

interface QuestionResult {
  id: string;
  number: number;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  selectedAnswer: string | null;
  isCorrect: boolean;
  isSkipped: boolean;
  language: string;
}

interface ResultData {
  sessionId: string;
  paperSetId: string;
  score: number;
  totalQ: number;
  percentage: number;
  timeTaken: number;
  paperSetTitle: string;
  breakdown: QuestionResult[];
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s}s`;
}

function ScoreRing({ pct }: { pct: number }) {
  const color = pct >= 75 ? "var(--success)" : pct >= 50 ? "var(--warning)" : "var(--error)";
  return (
    <div style={{
      width: "140px", height: "140px", borderRadius: "50%",
      background: `conic-gradient(${color} ${pct * 3.6}deg, var(--border) 0deg)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 0 32px ${color}40`,
    }}>
      <div style={{
        width: "110px", height: "110px", borderRadius: "50%",
        background: "var(--bg-card)", display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: "2rem", fontWeight: 900, color }}>{pct}%</span>
        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Score</span>
      </div>
    </div>
  );
}

export default function ResultsPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "correct" | "wrong" | "skipped">("all");

  useEffect(() => {
    fetch(`/api/results/${sessionId}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, [sessionId]);

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "12px" }} className="animate-spin">📊</div>
          <p style={{ color: "var(--text-muted)" }}>Loading results...</p>
        </div>
      </main>
    );
  }

  if (!data) return <main style={{ padding: "80px 24px", textAlign: "center" }}><p>Results not found.</p></main>;

  const filtered = data.breakdown.filter((q) => {
    if (filter === "correct") return q.isCorrect;
    if (filter === "wrong") return !q.isCorrect && !q.isSkipped;
    if (filter === "skipped") return q.isSkipped;
    return true;
  });

  const optionLabel: Record<string, string> = { A: "optionA", B: "optionB", C: "optionC", D: "optionD" };
  const getOptionText = (q: QuestionResult, opt: string) => (q as unknown as Record<string, string>)[optionLabel[opt]] || opt;

  const grade = data.percentage >= 75 ? "Excellent! 🏆" : data.percentage >= 50 ? "Good Effort 👍" : "Keep Practicing 💪";
  const scoreColor = data.percentage >= 75 ? "var(--success)" : data.percentage >= 50 ? "var(--warning)" : "var(--error)";

  return (
    <main style={{ minHeight: "100vh", padding: "0 24px 80px" }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0", marginBottom: "32px", borderBottom: "1px solid var(--border)" }}>
        <Link href="/" style={{ textDecoration: "none", color: "inherit", fontWeight: 800 }}>
          🏛️ <span className="gradient-text">LoksewaPro</span>
        </Link>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link href="/dashboard" className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.875rem" }}>Dashboard</Link>
          <Link href="/upload" className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.875rem" }}>New Paper</Link>
        </div>
      </nav>

      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        {/* Score Card */}
        <div className="card animate-fade-in" style={{ marginBottom: "32px", textAlign: "center", padding: "40px" }}>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "6px" }}>{data.paperSetTitle}</h1>
          <p style={{ color: "var(--text-muted)", marginBottom: "32px" }}>Quiz Complete</p>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
            <ScoreRing pct={data.percentage} />
          </div>

          <p style={{ fontSize: "1.4rem", fontWeight: 700, color: scoreColor, marginBottom: "24px" }}>{grade}</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", maxWidth: "600px", margin: "0 auto 32px" }}>
            {[
              { label: "Score", val: `${data.score}/${data.totalQ}`, color: "var(--primary-light)" },
              { label: "Correct", val: data.breakdown.filter(q => q.isCorrect).length, color: "var(--success)" },
              { label: "Wrong", val: data.breakdown.filter(q => !q.isCorrect && !q.isSkipped).length, color: "var(--error)" },
              { label: "Skipped", val: data.breakdown.filter(q => q.isSkipped).length, color: "var(--warning)" },
            ].map((s) => (
              <div key={s.label} style={{ background: "var(--bg)", borderRadius: "12px", padding: "16px 8px" }}>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>⏱ Time taken: {formatTime(data.timeTaken)}</p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "28px" }}>
            <Link href={`/quiz/${data.paperSetId}`} className="btn-secondary" style={{ fontSize: "0.875rem" }}>
              🔄 Retake Quiz
            </Link>
            <Link href="/upload" className="btn-primary" style={{ fontSize: "0.875rem" }}>
              📸 New Paper
            </Link>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
          {(["all", "correct", "wrong", "skipped"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: "7px 16px", borderRadius: "99px", border: "none",
                cursor: "pointer", fontWeight: 600, fontSize: "0.85rem",
                background: filter === f ? "var(--primary)" : "var(--bg-card)",
                color: filter === f ? "white" : "var(--text-muted)",
                transition: "all 0.15s",
              }}>
              {f === "all" ? `All (${data.totalQ})` :
               f === "correct" ? `✅ Correct (${data.breakdown.filter(q => q.isCorrect).length})` :
               f === "wrong" ? `❌ Wrong (${data.breakdown.filter(q => !q.isCorrect && !q.isSkipped).length})` :
               `⏭ Skipped (${data.breakdown.filter(q => q.isSkipped).length})`}
            </button>
          ))}
        </div>

        {/* Breakdown */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {filtered.map((q) => (
            <div key={q.id} className="card" style={{
              borderColor: q.isCorrect ? "rgba(16,185,129,0.3)" : q.isSkipped ? "rgba(245,158,11,0.3)" : "rgba(239,68,68,0.3)",
            }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "14px" }}>
                <div style={{
                  minWidth: "32px", height: "32px", borderRadius: "7px",
                  background: q.isCorrect ? "rgba(16,185,129,0.15)" : q.isSkipped ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: "0.85rem",
                  color: q.isCorrect ? "var(--success)" : q.isSkipped ? "var(--warning)" : "var(--error)",
                }}>
                  {q.number}
                </div>
                <p style={{ fontSize: "0.95rem", lineHeight: 1.6, fontFamily: q.language === "ne" ? "'Noto Sans Devanagari', sans-serif" : "inherit" }}>
                  {q.text}
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                {["A", "B", "C", "D"].map((opt) => {
                  const isCorrect = opt === q.correctAnswer;
                  const isSelected = opt === q.selectedAnswer;
                  let bg = "var(--bg)"; let border = "var(--border)"; let color = "var(--text-muted)";
                  if (isCorrect) { bg = "rgba(16,185,129,0.1)"; border = "rgba(16,185,129,0.4)"; color = "var(--success)"; }
                  else if (isSelected && !isCorrect) { bg = "rgba(239,68,68,0.08)"; border = "rgba(239,68,68,0.4)"; color = "var(--error)"; }
                  return (
                    <div key={opt} style={{ display: "flex", gap: "8px", padding: "7px 10px", borderRadius: "7px", background: bg, border: `1px solid ${border}`, fontSize: "0.85rem" }}>
                      <span style={{ fontWeight: 800, color, minWidth: "18px" }}>{opt}.</span>
                      <span style={{ color: isCorrect || isSelected ? "var(--text)" : "var(--text-muted)" }}>{getOptionText(q, opt)}</span>
                      {isCorrect && <span style={{ marginLeft: "auto", color: "var(--success)" }}>✓</span>}
                      {isSelected && !isCorrect && <span style={{ marginLeft: "auto", color: "var(--error)" }}>✗</span>}
                    </div>
                  );
                })}
              </div>

              {q.isSkipped && (
                <p style={{ marginTop: "10px", fontSize: "0.82rem", color: "var(--warning)" }}>
                  ⏭ Skipped — Correct answer: <strong>{q.correctAnswer}</strong>
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
