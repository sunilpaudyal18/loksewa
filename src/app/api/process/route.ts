import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300; // Allow up to 5 minutes on Vercel/Next.js for heavy OCR tasks
import { readFile, readdir } from "fs/promises";
import path from "path";
import { runOcr } from "@/lib/ocr/tesseract";
import { parseQuestions, matchAnswers } from "@/lib/parser/questionParser";
import { parseAnswerKey, validateAnswerKey } from "@/lib/parser/answerKeyParser";
import { prisma } from "@/lib/db";

const UPLOAD_DIR = path.join(process.cwd(), "tmp", "uploads");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId, title, subject, year } = body;

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    const jobDir = path.join(UPLOAD_DIR, jobId);

    // Read all files in job directory
    const files = await readdir(jobDir);
    const questionFiles = files
      .filter((f) => f.startsWith("q_"))
      .sort((a, b) => {
        const na = parseInt(a.match(/\d+/)?.[0] || "0");
        const nb = parseInt(b.match(/\d+/)?.[0] || "0");
        return na - nb;
      });
    const answerKeyFile = files.find((f) => f.startsWith("answerkey"));

    if (questionFiles.length === 0) {
      return NextResponse.json({ error: "No question files found for this job" }, { status: 404 });
    }
    if (!answerKeyFile) {
      return NextResponse.json({ error: "Answer key file not found" }, { status: 404 });
    }

    // --- Step 1: OCR all question images (sequential to save memory) ---
    const questionBuffers = await Promise.all(
      questionFiles.map((f) => readFile(path.join(jobDir, f)))
    );
    const answerKeyBuffer = await readFile(path.join(jobDir, answerKeyFile));

    // Process questions one by one instead of Promise.all to prevent OOM crash
    const questionOcrResults = [];
    for (const buf of questionBuffers) {
      questionOcrResults.push(await runOcr(buf, "questions"));
    }
    
    // Process answer key
    const answerKeyOcr = await runOcr(answerKeyBuffer, "answers");

    // --- Step 2: Combine all question OCR text ---
    const combinedQuestionText = questionOcrResults.map((r) => r.text).join("\n\n");
    const avgConfidence =
      questionOcrResults.reduce((s, r) => s + r.confidence, 0) /
      questionOcrResults.length;

    // --- Step 3: Parse questions and answer key ---
    const parseResult = parseQuestions(combinedQuestionText);
    const answerKeyResult = parseAnswerKey(answerKeyOcr.text);
    const answerKeyWarnings = validateAnswerKey(answerKeyResult.answers);

    // --- Step 4: Match questions with answers ---
    const { matched, mismatches } = matchAnswers(
      parseResult.questions,
      answerKeyResult.answers
    );

    // --- Step 5: Save to DB ---
    // Use a demo userId for now (replace with session user in auth flow)
    const demoUser = await prisma.user.upsert({
      where: { email: "demo@loksewa.local" },
      update: {},
      create: {
        email: "demo@loksewa.local",
        name: "Demo User",
      },
    });

    const paperSet = await prisma.paperSet.create({
      data: {
        userId: demoUser.id,
        title: title || `Paper Set (${new Date().toLocaleDateString()})`,
        subject: subject || null,
        year: year || null,
        totalQ: matched.length,
        questions: {
          create: matched.map((q) => ({
            number: q.number,
            text: q.text,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            answer: q.answer,
            language: q.language,
            confidence: q.confidence,
            hasWarning: q.hasWarning,
          })),
        },
      },
      include: { questions: true },
    });

    return NextResponse.json({
      success: true,
      paperSetId: paperSet.id,
      totalQuestions: matched.length,
      ocrConfidence: Math.round(avgConfidence),
      warnings: [
        ...parseResult.warnings,
        ...parseResult.errors,
        ...answerKeyResult.errors,
        ...answerKeyWarnings,
        ...mismatches,
      ],
      answerKeyParsed: answerKeyResult.totalParsed,
    });
  } catch (err) {
    console.error("[Process Error]", err);
    return NextResponse.json(
      { error: "Processing failed. Please try again." },
      { status: 500 }
    );
  }
}
