/**
 * pythonOcr.ts
 * Client for the Python FastAPI OCR microservice (PaddleOCR + OpenCV).
 * Sends image files as multipart/form-data and returns structured JSON.
 */

const OCR_SERVICE_URL =
  process.env.OCR_SERVICE_URL ?? "http://localhost:8000";

export interface ParsedQuestion {
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
  warningMessage: string | null;
}

export interface OcrServiceResponse {
  success: boolean;
  questions: ParsedQuestion[];
  /** Map of question number (as string key) → answer letter (A/B/C/D) */
  answers: Record<string, string>;
  ocrConfidence: number;
  warnings: string[];
  errors: string[];
}

/**
 * Checks if the OCR microservice is reachable.
 * Returns true if the health endpoint responds OK.
 */
export async function pingOcrService(): Promise<boolean> {
  try {
    const res = await fetch(`${OCR_SERVICE_URL}/health`, {
      signal: AbortSignal.timeout(5_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Send question images and an answer key image to the Python OCR microservice.
 *
 * @param questionBuffers - Array of raw image buffers (one per question-paper page)
 * @param questionFilenames - Matching filenames for the question buffers (for logging)
 * @param answerKeyBuffer - Raw image buffer of the answer key page
 * @param answerKeyFilename - Filename for the answer key buffer (for logging)
 * @returns Structured OCR response with parsed questions and answers
 */
export async function runPythonOcr(
  questionBuffers: Buffer[],
  questionFilenames: string[],
  answerKeyBuffer: Buffer,
  answerKeyFilename: string
): Promise<OcrServiceResponse> {
  const form = new FormData();

  // Append each question image under the field name "questions"
  for (let i = 0; i < questionBuffers.length; i++) {
    const blob = new Blob([new Uint8Array(questionBuffers[i])], { type: "image/jpeg" });
    form.append("questions", blob, questionFilenames[i] ?? `q_${i + 1}.jpg`);
  }

  // Append the answer key image
  const akBlob = new Blob([new Uint8Array(answerKeyBuffer)], { type: "image/jpeg" });
  form.append("answer_key", akBlob, answerKeyFilename ?? "answer_key.jpg");

  let res: Response;
  try {
    res = await fetch(`${OCR_SERVICE_URL}/ocr/process`, {
      method: "POST",
      body: form,
      // Allow up to 5 minutes for heavy OCR tasks
      signal: AbortSignal.timeout(300_000),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(
      `OCR microservice unreachable at ${OCR_SERVICE_URL}. Is the Python server running? (${msg})`
    );
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = body?.detail ?? detail;
    } catch {
      /* ignore parse errors */
    }
    throw new Error(`OCR microservice returned an error: ${detail}`);
  }

  const data = (await res.json()) as OcrServiceResponse;

  if (!data.success) {
    throw new Error(
      `OCR microservice reported failure. Errors: ${data.errors?.join("; ") ?? "unknown"}`
    );
  }

  return data;
}
