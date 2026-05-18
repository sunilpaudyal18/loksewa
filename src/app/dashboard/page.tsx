"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PaperSet {
  id: string;
  title: string;
  subject: string | null;
  year: string | null;
  createdAt: string;
  _count: { questions: number; sessions: number };
}

interface Session {
  id: string;
  score: number;
  totalQ: number;
  timeTaken: number;
  completedAt: string;
  paperSet: { title: string };
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s}s`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NP", { day: "numeric", month: "short", year: "numeric" });
}

export default function DashboardPage() {
  const [paperSets, setPaperSets] = useState<PaperSet[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { setPaperSets(d.paperSets || []); setSessions(d.sessions || []); setLoading(false); });
  }, []);

  const avgScore = sessions.length
    ? Math.round(sessions.reduce((s, sess) => s + (sess.score / sess.totalQ) * 100, 0) / sessions.length)
    : 0;

  return (
    <main style={{ minHeight: "100vh", padding: "0 24px 80px" }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0", marginBottom: "40px", borderBottom: "1px solid var(--border)" }}>
        <Link href="/" style={{ textDecoration: "none", color: "inherit", fontWeight: 800, fontSize: "1.1rem" }}>
          🏛️ <span className="gradient-text">LoksewaPro</span>
        </Link>
        <Link href="/upload" className="btn-primary" style={{ padding: "8px 20px", fontSize: "0.875rem" }}>
          + Upload Paper
        </Link>
      </nav>

      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "8px" }}>Dashboard</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "36px" }}>Your saved papers and quiz history</p>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "48px" }}>
          {[
            { icon: "📚", label: "Paper Sets", val: paperSets.length },
            { icon: "✅", label: "Quizzes Taken", val: sessions.length },
            { icon: "📊", label: "Avg Score", val: sessions.length ? `${avgScore}%` : "—" },
            { icon: "📝", label: "Total Questions", val: paperSets.reduce((s, p) => s + p._count.questions, 0) },
          ].map((stat) => (
            <div key={stat.label} className="card" style={{ textAlign: "center", padding: "20px 16px" }}>
              <div style={{ fontSize: "1.8rem", marginBottom: "6px" }}>{stat.icon}</div>
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--primary-light)" }}>{stat.val}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Paper Sets */}
        <div style={{ marginBottom: "48px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>📂 Your Paper Sets</h2>
            <Link href="/upload" className="btn-secondary" style={{ padding: "7px 14px", fontSize: "0.82rem" }}>+ New</Link>
          </div>

          {loading ? (
            <div style={{ display: "grid", gap: "12px" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ height: "80px", borderRadius: "var(--radius-lg)" }} />
              ))}
            </div>
          ) : paperSets.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
              <div style={{ fontSize: "3rem", marginBottom: "12px" }}>📭</div>
              <p style={{ fontWeight: 600, marginBottom: "8px" }}>No paper sets yet</p>
              <p style={{ color: "var(--text-muted)", marginBottom: "24px", fontSize: "0.9rem" }}>
                Upload your first Loksewa question paper to get started.
              </p>
              <Link href="/upload" className="btn-primary">📸 Upload Paper</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {paperSets.map((ps) => (
                <div key={ps.id} className="card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px" }}>
                  <div style={{
                    width: "44px", height: "44px", borderRadius: "10px",
                    background: "rgba(99,102,241,0.15)", display: "flex",
                    alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0,
                  }}>📄</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {ps.title}
                    </p>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {ps.subject && <span className="badge badge-primary">{ps.subject}</span>}
                      {ps.year && <span className="badge badge-primary">{ps.year}</span>}
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        {ps._count.questions} questions • {ps._count.sessions} attempt{ps._count.sessions !== 1 ? "s" : ""}
                      </span>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>{formatDate(ps.createdAt)}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    <Link href={`/review/${ps.id}`} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>Review</Link>
                    <Link href={`/quiz/${ps.id}`} className="btn-primary" style={{ padding: "6px 14px", fontSize: "0.8rem" }}>Start →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sessions */}
        {sessions.length > 0 && (
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "20px" }}>🕐 Recent Sessions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {sessions.map((sess) => {
                const pct = Math.round((sess.score / sess.totalQ) * 100);
                const color = pct >= 75 ? "var(--success)" : pct >= 50 ? "var(--warning)" : "var(--error)";
                return (
                  <div key={sess.id} className="card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "14px 20px" }}>
                    <div style={{
                      width: "52px", height: "52px", borderRadius: "50%",
                      background: `conic-gradient(${color} ${pct * 3.6}deg, var(--border) 0deg)`,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <div style={{
                        width: "40px", height: "40px", borderRadius: "50%",
                        background: "var(--bg-card)", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        fontSize: "0.75rem", fontWeight: 800, color,
                      }}>{pct}%</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {sess.paperSet.title}
                      </p>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        {sess.score}/{sess.totalQ} correct • {formatTime(sess.timeTaken)} • {formatDate(sess.completedAt)}
                      </p>
                    </div>
                    <Link href={`/results/${sess.id}`} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "0.8rem", flexShrink: 0 }}>
                      View →
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
