import Tesseract from "tesseract.js";

export interface OcrResult {
  text: string;
  confidence: number; // 0–100
  language: string;
}

/**
 * Tesseract page-segmentation modes relevant to MCQ papers.
 *
 * PSM 3  — Fully auto (multi-column): good for question pages with mixed layout
 * PSM 4  — Single column variable sizes: good for single-column question pages
 * PSM 6  — Single uniform block: best for answer-key tables
 * PSM 11 — Sparse text (find text anywhere): fallback for noisy answer keys
 */
const PSM = {
  AUTO_MULTI_COL: "3",
  SINGLE_COL: "4",
  SINGLE_BLOCK: "6",
  SPARSE: "11",
} as const;

/**
 * Character whitelist for answer key OCR.
 * Restricts Tesseract to only output digits, option letters, and separators.
 * Dramatically reduces garbage characters in dense answer-key tables.
 * Includes Nepali numerals and option letters for bilingual support.
 */
const ANSWER_KEY_WHITELIST = "0123456789ABCDabcd.):-/ \n०१२३४५६७८९कखगघ";

/**
 * Run Tesseract.js OCR on a Buffer or base64 string.
 * Uses eng+nep language pack for bilingual (English + Nepali) support.
 *
 * @param imageInput  Image as a Node.js Buffer or base64 data-URL string
 * @param hint        "questions" for question pages, "answers" for answer key
 */
export async function runOcr(
  imageInput: Buffer | string,
  hint: "questions" | "answers" = "questions"
): Promise<OcrResult> {
  const isAnswerKey = hint === "answers";

  // Choose page segmentation mode:
  // - Answer keys are usually a single dense block or table → PSM 6
  // - Question pages can be multi-column or single-column → PSM 3 (auto)
  const psm = isAnswerKey ? PSM.SINGLE_BLOCK : PSM.AUTO_MULTI_COL;

  const config: Record<string, string> = {
    // OEM 3 = LSTM + Legacy combined — highest accuracy
    tessedit_ocr_engine_mode: "3",
    tessedit_pageseg_mode: psm,
    // Improve word boundary detection in dense text
    preserve_interword_spaces: "1",
  };

  // For answer keys: restrict character set to reduce noise
  if (isAnswerKey) {
    config.tessedit_char_whitelist = ANSWER_KEY_WHITELIST;
  }

  const { data } = await Tesseract.recognize(imageInput, "eng+nep", {
    logger: () => {}, // suppress verbose logs in production
    ...config,
  } as any);

  // Tesseract confidence is 0–100 (higher is better)
  const confidence = Math.round(data.confidence);

  return {
    text: data.text,
    confidence,
    language: "eng+nep",
  };
}

/**
 * Process multiple question images SEQUENTIALLY to prevent OOM crashes.
 * (Parallel OCR on many images exhausts Node.js heap on low-RAM servers.)
 */
export async function runOcrBatch(
  images: (Buffer | string)[],
  hint: "questions" | "answers" = "questions"
): Promise<OcrResult[]> {
  const results: OcrResult[] = [];
  for (const img of images) {
    results.push(await runOcr(img, hint));
  }
  return results;
}

/**
 * Compute an aggregate OCR confidence from multiple results.
 * Returns a 0–100 integer.
 */
export function aggregateConfidence(results: OcrResult[]): number {
  if (results.length === 0) return 0;
  return Math.round(
    results.reduce((sum, r) => sum + r.confidence, 0) / results.length
  );
}
