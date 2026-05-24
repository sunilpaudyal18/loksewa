import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300; // Allow up to 5 minutes for heavy OCR tasks
import { readFile, readdir } from "fs/promises";
import path from "path";
import { runPythonOcr, pingOcrService } from "@/lib/ocr/pythonOcr";
import { runTesseractFallback } from "@/lib/ocr/tesseractFallback";
import { validateAnswer } from "@/lib/parser/ocrCorrections";
import { prisma } from "@/lib/db";

const UPLOAD_DIR = path.join(process.cwd(), "tmp", "uploads");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId, title, subject, year } = body;

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    // --- Pre-flight: verify OCR service is reachable ---
    const serviceUp = await pingOcrService();
    // If the Python service is down we continue with the Tesseract.js fallback
    // so the user never sees a hard error about a missing microservice.

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

    // --- Step 1: Read image files from disk ---
    const questionBuffers = await Promise.all(
      questionFiles.map((f) => readFile(path.join(jobDir, f)))
    );
    const answerKeyBuffer = await readFile(path.join(jobDir, answerKeyFile));

    // --- Step 2: Send to OCR engine (Python service → Tesseract fallback) ---
    const ocrResult = serviceUp
      ? await runPythonOcr(questionBuffers, questionFiles, answerKeyBuffer, answerKeyFile)
      : await runTesseractFallback(questionBuffers, questionFiles, answerKeyBuffer, answerKeyFile);

    const { questions: parsedQuestions, answers: parsedAnswers, ocrConfidence } = ocrResult;

    // --- Step 3: Match answer key into questions ---
    const matched = parsedQuestions.map((q) => {
      const answerKey = parsedAnswers[String(q.number)];
      return {
        ...q,
        answer: answerKey ?? "",
        hasWarning: q.hasWarning || !answerKey,
        warningMessage:
          !answerKey && !q.hasWarning
            ? "No answer key match found"
            : q.warningMessage,
      };
    });

    // --- Step 4: Runtime answer validation (A/B/C/D only) ---
    // Last line of defence before writing to the database.
    const invalidAnswerWarnings: string[] = [];
    const validated = matched.map((q) => {
      const clean = validateAnswer(q.answer);
      if (q.answer && !clean) {
        invalidAnswerWarnings.push(
          `Q${q.number}: Invalid answer "${q.answer}" rejected — question saved without answer`
        );
        return {
          ...q,
          answer: "",
          hasWarning: true,
          warningMessage: q.warningMessage
            ? `${q.warningMessage}; Invalid answer rejected`
            : "Invalid answer rejected",
        };
      }
      return { ...q, answer: clean || q.answer };
    });

    // --- Step 5: Deduplicate question numbers before DB insert ---
    const uniqueValidated: typeof validated = [];
    const usedNumbers = new Set<number>();
    let maxNumber = Math.max(0, ...validated.map((q) => q.number));

    for (const q of validated) {
      if (usedNumbers.has(q.number)) {
        maxNumber++;
        q.number = maxNumber;
        q.hasWarning = true;
        q.warningMessage = q.warningMessage
          ? `${q.warningMessage}; Auto-renumbered due to duplicate`
          : "Auto-renumbered due to duplicate";
      }
      usedNumbers.add(q.number);
      uniqueValidated.push(q);
    }

    // --- Step 6: Save to DB ---
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
        totalQ: uniqueValidated.length,
        questions: {
          create: uniqueValidated.map((q) => ({
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
            explanation: q.warningMessage ?? undefined,
          })),
        },
      },
      include: { questions: true },
    });

    return NextResponse.json({
      success: true,
      paperSetId: paperSet.id,
      totalQuestions: uniqueValidated.length,
      ocrConfidence: Math.round(ocrConfidence),
      warnings: [
        ...ocrResult.warnings,
        ...ocrResult.errors,
        ...invalidAnswerWarnings,
      ],
      answerKeyParsed: Object.keys(parsedAnswers).length,
    });
  } catch (err) {
    console.error("[Process Error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Processing failed. Please try again." },
      { status: 500 }
    );
  }
}
