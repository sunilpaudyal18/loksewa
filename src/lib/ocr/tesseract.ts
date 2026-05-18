import Tesseract from "tesseract.js";

export interface OcrResult {
  text: string;
  confidence: number;
  language: string;
}

/**
 * Run Tesseract.js OCR on a Buffer or base64 string.
 * Uses eng+nep language pack for bilingual support.
 * Runs server-side only.
 */
export async function runOcr(
  imageInput: Buffer | string,
  hint: "questions" | "answers" = "questions"
): Promise<OcrResult> {
  // For answer keys, use simpler page seg mode (single column)
  const psm = hint === "answers" ? "6" : "3";

  const { data } = await Tesseract.recognize(imageInput, "eng+nep", {
    logger: () => {}, // suppress logs in production
    tessedit_pageseg_mode: psm,
  } as any);

  return {
    text: data.text,
    confidence: data.confidence,
    language: data.hocr ? "detected" : "eng+nep",
  };
}

/**
 * Process multiple question images in parallel
 */
export async function runOcrBatch(
  images: (Buffer | string)[]
): Promise<OcrResult[]> {
  return Promise.all(images.map((img) => runOcr(img, "questions")));
}
