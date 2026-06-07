"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";

interface Question {
  id: string;
  number: number;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: string;
  language: string;
  confidence: number;
  hasWarning: boolean;
  warningMessage?: string | null;
}

interface PaperSet {
  id: string;
  title: string;
  subject: string | null;
  year: string | null;
  totalQ: number;
  questions: Question[];
}

function EditableField({ value, onSave, multiline, placeholder }: {
  value: string; onSave: (v: string) => void; multiline?: boolean; placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  useEffect(() => { setVal(value); }, [value]);

  const commit = () => { setEditing(false); if (val !== value) onSave(val); };
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) commit();
    if (e.key === "Escape") { setVal(value); setEditing(false); }
  };

  if (editing) {
    return multiline ? (
      <textarea value={val} onChange={(e) => setVal(e.target.value)} onBlur={commit}
        onKeyDown={handleKey} autoFocus placeholder={placeholder}
        style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--primary)", borderRadius: "6px", padding: "6px 8px", color: "var(--text)", fontSize: "inherit", fontFamily: "inherit", resize: "vertical", minHeight: "64px" }} />
    ) : (
      <input value={val} onChange={(e) => setVal(e.target.value)} onBlur={commit}
        onKeyDown={handleKey} autoFocus placeholder={placeholder}
        style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--primary)", borderRadius: "6px", padding: "4px 8px", color: "var(--text)", fontSize: "inherit", fontFamily: "inherit" }} />
    );
  }
  return (
    <span onClick={() => setEditing(true)}
      style={{ cursor: "text", borderBottom: "1px dashed var(--border)", paddingBottom: "1px", display: "inline-block", width: "100%" }}
      title="Click to edit">
      {value || <span style={{ color: "var(--text-dim)", fontStyle: "italic" }}>{placeholder || "Empty — click to edit"}</span>}
    </span>
  );
}

export default function ReviewPage({ params }: { params: Promise<{ paperSetId: string }> }) {
  const { paperSetId } = use(params);
  const router = useRouter();
  const [paperSet, setPaperSet] = useState<PaperSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/paperset/${paperSetId}`)
      .then((r) => r.json())
      .then((data) => { setPaperSet(data); setLoading(false); });
  }, [paperSetId]);

  const saveField = useCallback(async (questionId: string, field: string, value: string) => {
    await fetch(`/api/paperset/${paperSetId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, [field]: value }),
    });
    // Flash save indicator
    setSavedId(questionId);
    setTimeout(() => setSavedId(null), 1500);

    setPaperSet((prev) => prev ? {
      ...prev,
      questions: prev.questions.map((q) => q.id === questionId ? { ...q, [field]: value } : q),
    } : prev);
  }, [paperSetId]);

  const deleteQuestion = useCallback(async (questionId: string) => {
    if (!confirm("Delete this question? This cannot be undone.")) return;
    setDeletingId(questionId);
    await fetch(`/api/paperset/${paperSetId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, _delete: true }),
    });
    setPaperSet((prev) => prev ? {
      ...prev,
      questions: prev.questions.filter((q) => q.id !== questionId),
      totalQ: prev.totalQ - 1,
    } : prev);
    setDeletingId(null);
  }, [paperSetId]);

  if (loading) return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "16px" }} className="animate-spin">⚙️</div>
        <p style={{ color: "var(--text-muted)" }}>Loading questions...</p>
      </div>
    </main>
  );

  if (!paperSet) return (
    <main style={{ minHeight: "100vh", padding: "80px 24px", textAlign: "center" }}>
      <p>Paper set not found.</p>
      <Link href="/dashboard" className="btn-primary" style={{ marginTop: "16px" }}>Go to Dashboard</Link>
    </main>
  );

  const warnings = paperSet.questions.filter(q => q.hasWarning || !q.answer);

  return (
    <main style={{ minHeight: "100vh", padding: "0 16px 80px" }}>
      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", marginBottom: "24px", borderBottom: "1px solid var(--border)", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "1.1rem" }}>← Back</button>
          <Link href="/" style={{ textDecoration: "none", color: "inherit", fontWeight: 800 }}>
            🏛️ <span className="gradient-text">LoksewaPro</span>
          </Link>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link href="/dashboard" className="btn-secondary" style={{ fontSize: "0.85rem" }}>Dashboard</Link>
          <button className="btn-primary" style={{ fontSize: "0.85rem" }}
            onClick={() => router.push(`/quiz/${paperSetId}`)}>
            🚀 Start Quiz
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: "min(1400px, 95vw)", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "clamp(1.2rem, 2vw, 2rem)", fontWeight: 800, marginBottom: "6px" }}>{paperSet.title}</h1>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            {paperSet.subject && <span className="badge badge-primary">{paperSet.subject}</span>}
            {paperSet.year && <span className="badge badge-primary">📅 {paperSet.year}</span>}
            <span className="badge badge-primary">📝 {paperSet.questions.length} Questions</span>
            {warnings.length > 0 && <span className="badge badge-warning">⚠️ {warnings.length} need review</span>}
          </div>
        </div>

        {/* Tip */}
        <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "var(--radius)", padding: "12px 16px", marginBottom: "24px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
          💡 <strong>How to fix OCR errors:</strong> Click any text field to edit inline. Click <strong>A / B / C / D</strong> to set the correct answer. Use the 🗑️ button to remove bad questions. Changes save instantly.
        </div>

        {/* Question cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {paperSet.questions.map((q) => (
            <div key={q.id} className="card animate-fade-in" style={{
              borderColor: savedId === q.id ? "var(--success)" : q.hasWarning || !q.answer ? "rgba(245,158,11,0.4)" : undefined,
              position: "relative", transition: "border-color 0.3s",
              opacity: deletingId === q.id ? 0.4 : 1,
            }}>
              {/* Save flash */}
              {savedId === q.id && (
                <div style={{ position: "absolute", top: "10px", right: "10px", fontSize: "0.75rem", color: "var(--success)", fontWeight: 700 }}>
                  ✓ Saved
                </div>
              )}

              {/* Question header */}
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "12px" }}>
                <div style={{
                  minWidth: "34px", height: "34px", borderRadius: "8px",
                  background: q.hasWarning || !q.answer ? "rgba(245,158,11,0.15)" : "rgba(99,102,241,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: "0.9rem",
                  color: q.hasWarning || !q.answer ? "var(--warning)" : "var(--primary-light)",
                  flexShrink: 0,
                }}>
                  {q.number}
                </div>
                <div style={{ flex: 1, fontSize: "clamp(0.9rem, 1.2vw, 1.1rem)", lineHeight: 1.65 }}>
                  <EditableField value={q.text} multiline placeholder="Enter question text..."
                    onSave={(v) => saveField(q.id, "text", v)} />
                </div>
                <button onClick={() => deleteQuestion(q.id)} title="Delete question"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--error)", fontSize: "1rem", padding: "4px", flexShrink: 0, opacity: 0.6 }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "0.6")}>
                  🗑️
                </button>
              </div>

              {/* Options grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px" }}>
                {(["A", "B", "C", "D"] as const).map((opt) => {
                  const field = `option${opt}` as keyof Question;
                  const isCorrect = q.answer === opt;
                  return (
                    <div key={opt} style={{
                      display: "flex", gap: "8px", alignItems: "center",
                      padding: "8px 12px", borderRadius: "8px",
                      background: isCorrect ? "rgba(16,185,129,0.1)" : "var(--bg)",
                      border: `1px solid ${isCorrect ? "rgba(16,185,129,0.4)" : "var(--border)"}`,
                      fontSize: "0.88rem", transition: "all 0.2s",
                      cursor: "pointer",
                    }}
                      onClick={() => saveField(q.id, "answer", opt)}
                      title={`Mark ${opt} as correct answer`}
                    >
                      <span style={{
                        fontWeight: 800, minWidth: "22px", height: "22px", borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem",
                        background: isCorrect ? "var(--success)" : "var(--border)",
                        color: isCorrect ? "white" : "var(--text-muted)",
                        flexShrink: 0,
                      }}>{opt}</span>
                      <span style={{ flex: 1 }} onClick={e => e.stopPropagation()}>
                        <EditableField value={String(q[field] || "")} placeholder={`Option ${opt}...`}
                          onSave={(v) => saveField(q.id, `option${opt}`, v)} />
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.82rem", flexWrap: "wrap" }}>
                <span style={{ color: "var(--text-muted)" }}>Correct:</span>
                {["A","B","C","D"].map((opt) => (
                  <button key={opt} onClick={() => saveField(q.id, "answer", opt)}
                    style={{
                      width: "28px", height: "28px", borderRadius: "6px", border: "none",
                      cursor: "pointer", fontWeight: 700, fontSize: "0.82rem",
                      background: q.answer === opt ? "var(--success)" : "var(--border)",
                      color: q.answer === opt ? "white" : "var(--text)",
                      transition: "all 0.15s",
                    }}>{opt}</button>
                ))}
                {!q.answer && <span style={{ color: "var(--error)", fontSize: "0.78rem" }}>⚠ No answer set</span>}

                {/* Confidence meter */}
                <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>OCR</span>
                  <span style={{
                    fontSize: "0.75rem", fontWeight: 700,
                    color: q.confidence >= 0.85 ? "var(--success)" : q.confidence >= 0.6 ? "var(--warning)" : "var(--error)",
                  }}>
                    {Math.round(q.confidence * 100)}%
                  </span>
                  <span className={`badge ${q.language === "ne" ? "badge-warning" : "badge-primary"}`}>
                    {q.language === "ne" ? "🇳🇵 Nepali" : "🇬🇧 English"}
                  </span>
                </span>
              </div>

              {/* Warning detail message */}
              {q.hasWarning && q.warningMessage && (
                <div style={{
                  marginTop: "10px", padding: "7px 10px",
                  background: "rgba(245,158,11,0.08)", borderRadius: "6px",
                  fontSize: "0.76rem", color: "var(--warning)", lineHeight: 1.5,
                }}>
                  ℹ️ {q.warningMessage}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ marginTop: "36px", display: "flex", gap: "12px", justifyContent: "center" }}>
          <button className="btn-primary" style={{ fontSize: "1rem" }}
            onClick={() => router.push(`/quiz/${paperSetId}`)}>
            ✅ Start Quiz →
          </button>
        </div>
      </div>
    </main>
  );
}
