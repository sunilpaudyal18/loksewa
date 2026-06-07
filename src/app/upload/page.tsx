"use client";

import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { useUploadStore } from "@/store/uploadStore";
import Link from "next/link";
import imageCompression from "browser-image-compression";
import { runBrowserOcr } from "@/lib/ocr/browserOcr";

function FilePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "10px",
      background: "var(--bg)", border: "1px solid var(--border)",
      borderRadius: "8px", padding: "8px 12px",
    }}>
      <span style={{ fontSize: "1.1rem" }}>📄</span>
      <span style={{ fontSize: "0.85rem", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {file.name}
      </span>
      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
        {(file.size / 1024).toFixed(0)}KB
      </span>
      <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--error)", fontSize: "1.1rem" }}>×</button>
    </div>
  );
}

export default function UploadPage() {
  const router = useRouter();
  const { status, setStatus, setProgress, setError, setResult } = useUploadStore();
  const progress = useUploadStore((s) => s.progress);
  const errorMessage = useUploadStore((s) => s.errorMessage);

  const [questionFiles, setQuestionFiles] = useState<File[]>([]);
  const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");

  useEffect(() => {
    const { reset } = useUploadStore.getState();
    reset();
  }, []);

  const [isCompressing, setIsCompressing] = useState(false);

  const compressFiles = async (files: File[]) => {
    const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
    return Promise.all(files.map(f => imageCompression(f, options)));
  };

  const onDropQuestions = useCallback(async (accepted: File[]) => {
    setIsCompressing(true);
    try {
      const compressed = await compressFiles(accepted);
      setQuestionFiles((prev) => [...prev, ...compressed].slice(0, 20));
    } catch {
      setQuestionFiles((prev) => [...prev, ...accepted].slice(0, 20));
    } finally {
      setIsCompressing(false);
    }
  }, []);

  const onDropAnswerKey = useCallback(async (accepted: File[]) => {
    if (!accepted[0]) return;
    setIsCompressing(true);
    try {
      const compressed = await compressFiles([accepted[0]]);
      setAnswerKeyFile(compressed[0]);
    } catch {
      setAnswerKeyFile(accepted[0]);
    } finally {
      setIsCompressing(false);
    }
  }, []);

  const { getRootProps: getQProps, getInputProps: getQInput, isDragActive: isQDrag } =
    useDropzone({ onDrop: onDropQuestions, accept: { "image/*": [] }, multiple: true });

  const { getRootProps: getAKProps, getInputProps: getAKInput, isDragActive: isAKDrag } =
    useDropzone({ onDrop: onDropAnswerKey, accept: { "image/*": [] }, multiple: false });

  const isProcessing = status === "processing";

  const handleSubmit = async () => {
    if (!questionFiles.length || !answerKeyFile) return;
    try {
      setStatus("processing");
      setProgress(5);

      const result = await runBrowserOcr(questionFiles, answerKeyFile, (msg, pct) => {
        setProgress(Math.max(5, Math.min(85, Math.round(pct * 0.8))));
      });

      const warnings = [...result.warnings, ...result.errors];

      setProgress(90);
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || undefined,
          subject: subject || undefined,
          year: year || undefined,
          questions: result.questions,
          answers: result.answers,
          ocrConfidence: result.ocrConfidence,
        }),
      });

      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "Save failed");
      }

      setProgress(100);
      const data = await res.json();
      setResult({
        paperSetId: data.paperSetId,
        warnings,
        totalQuestions: data.totalQuestions,
        ocrConfidence: data.ocrConfidence,
      });
      router.push(`/review/${data.paperSetId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <main style={{ minHeight: "100vh", padding: "0 24px 60px" }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0", marginBottom: "40px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button onClick={() => router.back()} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "0.85rem", border: "none", background: "rgba(255,255,255,0.05)" }}>
            ← Back
          </button>
          <Link href="/" style={{ textDecoration: "none", color: "inherit", fontWeight: 800, fontSize: "1.1rem" }}>
            🏛️ <span className="gradient-text">LoksewaPro</span>
          </Link>
        </div>
        <Link href="/dashboard" className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.875rem" }}>Dashboard</Link>
      </nav>

      <div style={{ maxWidth: "min(900px, 95vw)", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "8px" }}>Upload Question Paper</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "36px" }}>
          Upload all question pages and the answer key. OCR runs in your browser — nothing leaves your machine.
        </p>

        <div className="card" style={{ marginBottom: "24px" }}>
          <h2 style={{ fontWeight: 700, marginBottom: "16px", fontSize: "1rem" }}>📋 Paper Details (Optional)</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
            {[
              { id: "paper-title", label: "Title", placeholder: "e.g. Kharidar 2080", val: title, set: setTitle },
              { id: "paper-subject", label: "Subject", placeholder: "e.g. General Knowledge", val: subject, set: setSubject },
              { id: "paper-year", label: "Year", placeholder: "e.g. 2080", val: year, set: setYear },
            ].map((f) => (
              <div key={f.id}>
                <label htmlFor={f.id} style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "5px" }}>{f.label}</label>
                <input id={f.id} className="input" placeholder={f.placeholder} value={f.val} onChange={(e) => f.set(e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginBottom: "24px" }}>
          <h2 style={{ fontWeight: 700, marginBottom: "12px", fontSize: "1rem" }}>
            📄 Question Pages <span style={{ color: "var(--error)" }}>*</span>
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "14px" }}>
            <div {...getQProps()} id="question-dropzone" style={{
              flex: 1, border: `2px dashed ${isQDrag ? "var(--primary)" : "var(--border)"}`,
              borderRadius: "var(--radius)", padding: "36px", textAlign: "center",
              cursor: "pointer", background: isQDrag ? "rgba(99,102,241,0.07)" : "transparent",
              transition: "all 0.2s"
            }}>
              <input {...getQInput()} />
              <div style={{ fontSize: "2.2rem", marginBottom: "6px" }}>📸</div>
              <p style={{ fontWeight: 600, marginBottom: "3px" }}>{isQDrag ? "Drop here!" : "Drag & drop or Click"}</p>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Up to 20 images • Auto-compressed</p>
            </div>

            <label className="btn-secondary" style={{ justifyContent: "center", cursor: "pointer", background: "rgba(255,255,255,0.03)" }}>
              <input type="file" accept="image/*" capture="environment" multiple onChange={(e) => e.target.files && onDropQuestions(Array.from(e.target.files))} style={{ display: "none" }} />
              📷 Take Photo (Camera)
            </label>
          </div>
          {questionFiles.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "4px" }}>{questionFiles.length} file(s)</p>
              {questionFiles.map((f, i) => (
                <FilePreview key={i} file={f} onRemove={() => setQuestionFiles((p) => p.filter((_, j) => j !== i))} />
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ marginBottom: "28px" }}>
          <h2 style={{ fontWeight: 700, marginBottom: "12px", fontSize: "1rem" }}>
            🔑 Answer Key Image <span style={{ color: "var(--error)" }}>*</span>
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div {...getAKProps()} id="answerkey-dropzone" style={{
              flex: 1, border: `2px dashed ${answerKeyFile ? "var(--success)" : isAKDrag ? "var(--accent)" : "var(--border)"}`,
              borderRadius: "var(--radius)", padding: "32px", textAlign: "center",
              cursor: "pointer", background: answerKeyFile ? "rgba(16,185,129,0.05)" : "transparent",
              transition: "all 0.2s",
            }}>
              <input {...getAKInput()} />
              {answerKeyFile ? (
                <div>
                  <div style={{ fontSize: "1.8rem", marginBottom: "6px" }}>✅</div>
                  <p style={{ fontWeight: 600, color: "var(--success)" }}>{answerKeyFile.name}</p>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Click to replace</p>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: "2.2rem", marginBottom: "6px" }}>🔑</div>
                  <p style={{ fontWeight: 600, marginBottom: "3px" }}>Drop answer key image</p>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Auto-compressed on upload</p>
                </div>
              )}
            </div>

            <label className="btn-secondary" style={{ justifyContent: "center", cursor: "pointer", background: "rgba(255,255,255,0.03)" }}>
              <input type="file" accept="image/*" capture="environment" onChange={(e) => e.target.files && onDropAnswerKey(Array.from(e.target.files))} style={{ display: "none" }} />
              📷 Snap Answer Key
            </label>
          </div>
        </div>

        {errorMessage && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius)", padding: "12px 16px", color: "var(--error)", marginBottom: "18px", fontSize: "0.9rem" }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {isProcessing && (
          <div className="card" style={{ marginBottom: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                {progress < 90 ? "📷 Running OCR in browser..." : "💾 Saving to database..."}
              </span>
              <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>{progress}%</span>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "6px" }}>
              {progress < 90
                ? "OCR runs in your browser — no data is sent to any server. Processing time depends on your device."
                : "Sending parsed results to save..."}
            </p>
          </div>
        )}

        <div style={{ display: "flex", gap: "12px" }}>
          <button id="process-btn" className="btn-primary" onClick={handleSubmit}
            disabled={isProcessing || isCompressing || !questionFiles.length || !answerKeyFile}
            style={{ flex: 1, justifyContent: "center", padding: "14px" }}>
            {isProcessing ? "⚙️ Processing..." : isCompressing ? "⏳ Compressing..." : "🚀 Extract & Build Quiz"}
          </button>
          {(questionFiles.length > 0 || answerKeyFile) && !isProcessing && (
            <button className="btn-secondary" onClick={() => { setQuestionFiles([]); setAnswerKeyFile(null); setTitle(""); setSubject(""); setYear(""); setStatus("idle"); setProgress(0); setError(""); }}>
              Reset
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
