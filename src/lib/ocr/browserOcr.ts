import Tesseract from "tesseract.js";
import { parseQuestions } from "@/lib/parser/questionParser";
import { parseAnswerKey } from "@/lib/parser/answerKeyParser";
import type { ParsedQuestion } from "@/lib/parser/questionParser";

export interface BrowserOcrResult {
  questions: ParsedQuestion[];
  answers: Record<number, string>;
  ocrConfidence: number;
  warnings: string[];
  errors: string[];
}

function runOcr(
  image: Blob,
  hint: "questions" | "answers",
  onProgress?: (pct: number) => void
): Promise<{ text: string; confidence: number }> {
  const psm = hint === "answers" ? "6" : "3";
  const config: Record<string, string> = {
    tessedit_ocr_engine_mode: "3",
    tessedit_pageseg_mode: psm,
    preserve_interword_spaces: "1",
  };
  if (hint === "answers") {
    config.tessedit_char_whitelist =
      "0123456789ABCDabcd.):-/ \n०१२३४५६७८९कखगघ";
  }
  return Tesseract.recognize(image, "eng+nep", {
    ...config,
    logger: (info: any) => {
      if (info.status === "recognizing text" && onProgress) {
        onProgress(Math.round(info.progress * 100));
      }
    },
  } as any).then(({ data }: any) => ({
    text: data.text,
    confidence: Math.round(data.confidence),
  }));
}

export async function runBrowserOcr(
  questionImages: Blob[],
  answerKeyImage: Blob,
  onProgress?: (msg: string, pct: number) => void
): Promise<BrowserOcrResult> {
  const warnings: string[] = [];
  const errors: string[] = [];
  const questionResults = [];

  for (let i = 0; i < questionImages.length; i++) {
    onProgress?.(`Scanning page ${i + 1} of ${questionImages.length}...`, 0);
    const result = await runOcr(questionImages[i], "questions", (pct) => {
      onProgress?.(`Scanning page ${i + 1} of ${questionImages.length}...`, pct);
    });
    questionResults.push(result);
    if (!result.text.trim()) {
      warnings.push(`No text extracted from question page ${i + 1}`);
    }
  }

  onProgress?.("Parsing questions...", 0);
  const combinedQuestionText = questionResults.map((r) => r.text).join("\n\n");
  const parseResult = parseQuestions(combinedQuestionText);
  warnings.push(...parseResult.warnings);
  errors.push(...parseResult.errors);

  onProgress?.("Scanning answer key...", 0);
  const answerKeyResult = await runOcr(answerKeyImage, "answers", (pct) => {
    onProgress?.("Scanning answer key...", pct);
  });
  if (!answerKeyResult.text.trim()) {
    errors.push("No text extracted from answer key");
  }

  onProgress?.("Parsing answer key...", 0);
  const answerKeyParsed = parseAnswerKey(answerKeyResult.text);
  errors.push(...answerKeyParsed.errors);

  const allConfidences = [
    ...questionResults.map((r) => r.confidence),
    answerKeyResult.confidence,
  ];
  const ocrConfidence =
    allConfidences.length > 0
      ? Math.round(allConfidences.reduce((s, c) => s + c, 0) / allConfidences.length)
      : 60;

  onProgress?.("Done!", 100);

  return {
    questions: parseResult.questions,
    answers: answerKeyParsed.answers,
    ocrConfidence,
    warnings,
    errors,
  };
}
