/**
 * tesseractFallback.ts
 *
 * Drop-in replacement for runPythonOcr() that uses the built-in Tesseract.js
 * engine when the Python FastAPI microservice is not reachable.
 *
 * Produces exactly the same OcrServiceResponse shape so the caller
 * (process/route.ts) does not need any changes to consume the result.
 */

import { runOcr, runOcrBatch } from "./tesseract";
import { parseQuestions } from "@/lib/parser/questionParser";
import { parseAnswerKey, validateAnswerKey } from "@/lib/parser/answerKeyParser";
import type { OcrServiceResponse, ParsedQuestion } from "./pythonOcr";

/**
 * Tesseract-based fallback for the Python OCR microservice.
 *
 * @param questionBuffers   - Raw image buffers for each question-paper page
 * @param questionFilenames - Matching filenames (used only for warnings)
 * @param answerKeyBuffer   - Raw image buffer of the answer key page
 * @param answerKeyFilename - Filename for the answer key (used only for warnings)
 */
export async function runTesseractFallback(
  questionBuffers: Buffer[],
  questionFilenames: string[],
  answerKeyBuffer: Buffer,
  answerKeyFilename: string
): Promise<OcrServiceResponse> {
  const warnings: string[] = [
    "⚠️ Python OCR service unavailable — using built-in Tesseract.js engine (accuracy may be lower).",
  ];
  const errors: string[] = [];

  // ------------------------------------------------------------------
  // Step 1: OCR all question images
  // ------------------------------------------------------------------
  const questionOcrResults = await runOcrBatch(questionBuffers, "questions");

  // Combine OCR text from all pages (separated by newlines)
  const combinedQuestionText = questionOcrResults
    .map((r, i) => {
      if (!r.text.trim()) {
        warnings.push(`No text extracted from question page: ${questionFilenames[i] ?? `q_${i + 1}`}`);
      }
      return r.text;
    })
    .join("\n\n");

  // ------------------------------------------------------------------
  // Step 2: Parse questions from combined OCR text
  // ------------------------------------------------------------------
  const parseResult = parseQuestions(combinedQuestionText);
  warnings.push(...parseResult.warnings);
  errors.push(...parseResult.errors);

  // ------------------------------------------------------------------
  // Step 3: OCR the answer key
  // ------------------------------------------------------------------
  const answerKeyOcr = await runOcr(answerKeyBuffer, "answers");

  if (!answerKeyOcr.text.trim()) {
    errors.push(`No text extracted from answer key: ${answerKeyFilename}`);
  }

  // ------------------------------------------------------------------
  // Step 4: Parse answer key
  // ------------------------------------------------------------------
  const answerKeyResult = parseAnswerKey(answerKeyOcr.text);
  const answerKeyWarnings = validateAnswerKey(answerKeyResult.answers);
  warnings.push(...answerKeyWarnings);
  errors.push(...answerKeyResult.errors);

  // Convert answer key from Record<number, string> → Record<string, string>
  // (Python service uses string keys)
  const answers: Record<string, string> = {};
  for (const [num, ans] of Object.entries(answerKeyResult.answers)) {
    answers[String(num)] = ans;
  }

  // ------------------------------------------------------------------
  // Step 5: Build OcrServiceResponse-compatible question list
  // ------------------------------------------------------------------
  const questions: ParsedQuestion[] = parseResult.questions.map((q) => ({
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
    warningMessage: q.warningMessage ?? null,
  }));

  // ------------------------------------------------------------------
  // Step 6: Aggregate OCR confidence
  // ------------------------------------------------------------------
  const allConfidences = [
    ...questionOcrResults.map((r) => r.confidence),
    answerKeyOcr.confidence,
  ];
  const ocrConfidence =
    allConfidences.length > 0
      ? Math.round(allConfidences.reduce((s, c) => s + c, 0) / allConfidences.length)
      : 60;

  return {
    success: true,
    questions,
    answers,
    ocrConfidence,
    warnings,
    errors,
  };
}
