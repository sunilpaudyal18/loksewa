"use client";

import { use, useEffect, useRef, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuizStore } from "@/store/quizStore";

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

function formatTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function QuizPage({ params }: { params: Promise<{ paperSetId: string }> }) {
  const { paperSetId } = use(params);
  const router = useRouter();
  const {
    questions, answers, currentIndex, timeElapsed, isSubmitted, sessionId,
    paperSetTitle, initQuiz, selectAnswer, navigate, nextQuestion, prevQuestion, tickTimer, submitQuiz,
  } = useQuizStore();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialized = useRef(false);

  // Flashcard state: null = unanswered, string = chosen option
  const [chosen, setChosen] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Reset flashcard state when question changes
  useEffect(() => {
    setChosen(null);
    setShowResult(false);
  }, [currentIndex]);

  // Fetch questions if not already loaded for this paperSet
  useEffect(() => {
    if (initialized.current && questions.length > 0) return;
    fetch(`/api/paperset/${paperSetId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.questions) {
          initQuiz(paperSetId, data.title, data.questions);
          initialized.current = true;
        }
      });
  }, [paperSetId, initQuiz, questions.length]);

  // Timer
  useEffect(() => {
    if (isSubmitted) { if (timerRef.current) clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(tickTimer, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isSubmitted, tickTimer]);

  // Redirect on submit
  useEffect(() => {
    if (isSubmitted && sessionId) {
      router.push(`/results/${sessionId}`);
    }
  }, [isSubmitted, sessionId, router]);

  const handleSubmit = useCallback(async () => {
    const answered = Object.keys(answers).length;
    const unanswered = questions.length - answered;
    if (unanswered > 0) {
      const ok = confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`);
      if (!ok) return;
    }
    await submitQuiz();
  }, [answers, questions.length, submitQuiz]);

  // Handle option click in flashcard mode
  const handleOptionClick = (opt: string) => {
    if (showResult) return; // already revealed
    setChosen(opt);
    selectAnswer(q.id, opt);

    // Only reveal result immediately if this question has a known correct answer
    if (q.answer) {
      setShowResult(true);
      // Auto-advance to next question after 1.4s if correct
      if (opt === q.answer) {
        setTimeout(() => {
          if (currentIndex < questions.length - 1) {
            nextQuestion();
          }
        }, 1400);
      }
    }
  };

  if (!questions.length) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "12px" }} className="animate-spin">⚙️</div>
          <p style={{ color: "var(--text-muted)" }}>Loading quiz...</p>
        </div>
      </main>
    );
  }

  const q = questions[currentIndex];
  const answered = Object.keys(answers).length;
  const progressPct = Math.round((answered / questions.length) * 100);
  const optionField: Record<string, string> = {
    A: q.optionA, B: q.optionB, C: q.optionC, D: q.optionD,
  };
  const isLastQuestion = currentIndex >= questions.length - 1;

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ---- Top Bar ---- */}
      <div className="glass" style={{ position: "sticky", top: 0, zIndex: 40, padding: "0 20px" }}>
        <div style={{ maxWidth: "min(1400px, 95vw)", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", height: "3.75rem" }}>
            <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "1.2rem", padding: "4px", flexShrink: 0 }} title="Back">←</button>
            <Link href="/" style={{ textDecoration: "none", color: "inherit", fontWeight: 800, fontSize: "1rem", flexShrink: 0 }}>
              🏛️
            </Link>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {paperSetTitle}
              </p>
              <div className="progress-bar" style={{ height: "4px" }}>
                <div className="progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexShrink: 0 }}>
              <div style={{
                background: "var(--bg)", border: "1px solid var(--border)",
                borderRadius: "8px", padding: "0.25rem 0.625rem",
                fontFamily: "monospace", fontSize: "0.9rem", fontWeight: 700,
                color: timeElapsed > 3600 ? "var(--error)" : "var(--text)",
              }}>
                ⏱ {formatTime(timeElapsed)}
              </div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                {answered}/{questions.length}
              </span>
              <button id="submit-btn" className="btn-primary" style={{ fontSize: "0.8rem" }} onClick={handleSubmit}>
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Main Content ---- */}
      <div style={{ maxWidth: "min(1400px, 95vw)", margin: "0 auto", padding: "2rem 1.25rem 3.75rem", flex: 1, width: "100%" }}>

        {/* Question card */}
        <div className="card animate-fade-in" key={q.id} style={{ marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.125rem" }}>
            <div style={{
              background: "rgba(99,102,241,0.2)", color: "var(--primary-light)",
              borderRadius: "8px", padding: "0.25rem 0.875rem", fontWeight: 800, fontSize: "0.95rem",
            }}>
              Q{q.number}
            </div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>of {questions.length}</span>
            {q.hasWarning && <span className="badge badge-warning" style={{ marginLeft: "auto" }}>⚠️ OCR Warning</span>}
          </div>
          {/* No-answer warning */}
          {!q.answer && (
            <div style={{
              background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: "8px", padding: "10px 14px", marginBottom: "12px",
              fontSize: "0.82rem", color: "var(--warning)",
            }}>
              ⚠️ This question has no answer set. <a href={`/review/${paperSetId}`} style={{ color: "var(--primary-light)", fontWeight: 600 }}>Fix in Review</a>
            </div>
          )}
          <p style={{
            fontSize: "clamp(1rem, 1.5vw, 1.35rem)", lineHeight: 1.75, fontWeight: 500,
            fontFamily: q.language === "ne" ? "var(--font-noto-sans-devanagari), sans-serif" : "inherit",
          }}>
            {q.text}
          </p>
        </div>

        {/* Options — Flashcard style */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
          {OPTION_LABELS.map((opt) => {
            const isChosen = chosen === opt;
            const isCorrectAnswer = q.answer === opt;

            // Determine button state
            let btnClass = "option-btn";
            let iconEl: string | null = null;

            if (showResult) {
              if (isCorrectAnswer) {
                btnClass += " correct";
                iconEl = "✅";
              } else if (isChosen && !isCorrectAnswer) {
                btnClass += " wrong";
                iconEl = "❌";
              }
            } else if (isChosen) {
              btnClass += " selected";
            }

            return (
              <button
                key={opt}
                id={`option-${opt}`}
                className={btnClass}
                onClick={() => handleOptionClick(opt)}
                disabled={showResult && !isCorrectAnswer && !isChosen}
                style={{
                  transition: "all 0.25s ease",
                  transform: showResult && isCorrectAnswer ? "scale(1.02)" : "scale(1)",
                  cursor: showResult ? "default" : "pointer",
                }}
              >
                <span className="option-label">{opt}</span>
                <span style={{
                  flex: 1,
                  fontFamily: q.language === "ne" ? "var(--font-noto-sans-devanagari), sans-serif" : "inherit",
                  lineHeight: 1.5,
                  textAlign: "left",
                }}>
                  {optionField[opt] || <span style={{ color: "var(--text-dim)", fontStyle: "italic" }}>No text</span>}
                </span>
                {iconEl && <span style={{ fontSize: "1.1rem" }}>{iconEl}</span>}
              </button>
            );
          })}
        </div>

        {/* Feedback message */}
        {showResult && q.answer && (
          <div className="animate-fade-in" style={{
            background: chosen === q.answer ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${chosen === q.answer ? "var(--success)" : "var(--error)"}`,
            borderRadius: "var(--radius)", padding: "14px 18px", marginBottom: "20px",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
          }}>
            <div>
              <p style={{ fontWeight: 700, color: chosen === q.answer ? "var(--success)" : "var(--error)", marginBottom: "3px" }}>
                {chosen === q.answer ? "🎉 Correct!" : "❌ Incorrect"}
              </p>
              {chosen !== q.answer && (
                <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
                  Correct answer: <strong style={{ color: "var(--success)" }}>{q.answer}. {optionField[q.answer]}</strong>
                </p>
              )}
            </div>
            {!isLastQuestion ? (
              <button className="btn-primary" onClick={nextQuestion} style={{ whiteSpace: "nowrap" }}>
                Next →
              </button>
            ) : (
              <button className="btn-primary" onClick={handleSubmit} style={{ whiteSpace: "nowrap", background: "linear-gradient(135deg, var(--success), #059669)" }}>
                ✅ Finish
              </button>
            )}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn-secondary" onClick={prevQuestion} disabled={currentIndex === 0} style={{ flex: 1, justifyContent: "center" }}>
            ← Prev
          </button>
          {!showResult && (
            isLastQuestion ? (
              <button className="btn-primary" onClick={handleSubmit} style={{ flex: 1, justifyContent: "center", background: "linear-gradient(135deg, var(--success), #059669)" }}>
                ✅ Submit Quiz
              </button>
            ) : (
              <button className="btn-primary" onClick={nextQuestion} style={{ flex: 1, justifyContent: "center" }}>
                Skip →
              </button>
            )
          )}
        </div>

        {/* Question grid (compact at bottom on mobile) */}
        <div style={{ marginTop: "2.25rem", padding: "1rem", background: "var(--bg-card)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.625rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Progress
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {questions.map((question, i) => {
              const isAnswered = !!answers[question.id];
              const isCurrent = i === currentIndex;
              return (
                <button
                  key={question.id}
                  id={`nav-q${question.number}`}
                  onClick={() => navigate(i)}
                  style={{
                    width: "2rem", height: "2rem", borderRadius: "6px", border: "none",
                    cursor: "pointer", fontSize: "0.75rem", fontWeight: 700,
                    background: isCurrent ? "var(--primary)" : isAnswered ? "rgba(16,185,129,0.3)" : "var(--border)",
                    color: isCurrent ? "white" : isAnswered ? "var(--success)" : "var(--text-muted)",
                    outline: isCurrent ? "2px solid var(--primary-light)" : "none",
                    outlineOffset: "2px",
                    transition: "all 0.1s",
                  }}
                >
                  {question.number}
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--success)" }}>✅ {answered} answered</span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>⬜ {questions.length - answered} remaining</span>
          </div>
        </div>
      </div>
    </main>
  );
}
