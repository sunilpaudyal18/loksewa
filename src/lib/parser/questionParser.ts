import {
  normalizeText,
  normalizeOptionSeparators,
  convertNepaliNumerals,
} from "./ocrCorrections";

export interface ParsedQuestion {
  number: number;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: string;
  language: "en" | "ne";
  confidence: number;
  hasWarning: boolean;
  warningMessage?: string;
}

export interface ParseResult {
  questions: ParsedQuestion[];
  errors: string[];
  warnings: string[];
  rawText: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function detectLanguage(text: string): "en" | "ne" {
  const dev = (text.match(/[\u0900-\u097F]/g) || []).length;
  const total = text.replace(/\s/g, "").length;
  return total > 0 && dev / total > 0.3 ? "ne" : "en";
}

/**
 * Flexible question-start pattern.
 * Matches all of: 1. 1) 1  Q1 Q1. Q1) १. १) १ (1)
 * The key change from the old pattern: separator [.):\s] is optional,
 * and Q-prefix is also optional.
 */
const QUESTION_START_RE =
  /^[|;:\\\u0964\-\s'"]{0,5}(?:Q\.?\s*)?\(?([1-9][0-9]{0,2}|[१-९][०-९]{0,2})\)?\s*[.):,]\s+\S/;

/**
 * A stricter variant used inside option parsing to detect accidental block merges.
 * Requires an explicit separator like . ) or : to avoid truncating options starting with numbers.
 */
const NEW_Q_IN_OPTION_RE =
  /(?:\n|^)[|;:\\\u0964\-\s'"]{0,5}(?:Q\.?\s*)?\(?([1-9][0-9]{0,2})\)?\s*[.):,]\s+\S/m;

/**
 * Detect OCR garbage: repeated special characters, very long unbroken tokens,
 * or lines that are mostly non-alphanumeric.
 */
function isOcrGarbage(text: string): boolean {
  if (!text || text.length === 0) return false;
  // Repeated special chars: |||, ----, ====, ####
  if (/([|=\-#*~])\1{3,}/.test(text)) return true;
  // Very long unbroken token (no space for > 60 chars)
  if (/\S{60,}/.test(text)) return true;
  // Mostly non-alphanumeric (< 30% alphanumeric)
  const alnum = (text.match(/[a-zA-Z0-9\u0900-\u097F]/g) || []).length;
  if (text.length > 10 && alnum / text.length < 0.3) return true;
  return false;
}

/**
 * Compute a dynamic confidence score for a parsed question.
 * Starts at 1.0, subtracts for each quality issue found.
 */
function computeConfidence(
  options: Record<string, string>,
  questionText: string,
  hasNumberingGap: boolean
): { score: number; warnings: string[] } {
  let score = 1.0;
  const warnings: string[] = [];

  const missing = ["A", "B", "C", "D"].filter((k) => !options[k]);
  if (missing.length > 0) {
    score -= missing.length * 0.15;
    warnings.push(`Missing options: ${missing.join(", ")}`);
  }

  if (hasNumberingGap) {
    score -= 0.1;
    warnings.push("Numbering gap detected");
  }

  // Penalise if any option is suspiciously long (likely OCR merge)
  for (const [key, val] of Object.entries(options)) {
    if (val.length > 250) {
      score -= 0.15;
      warnings.push(`Option ${key} is unusually long (${val.length} chars) — possible OCR merge`);
    }
  }

  // Penalise if question text has OCR garbage patterns
  if (isOcrGarbage(questionText)) {
    score -= 0.1;
    warnings.push("Question text contains suspected OCR noise");
  }

  // Clamp between 0.1 and 1.0
  score = Math.max(0.1, Math.min(1.0, score));
  return { score, warnings };
}

// ---------------------------------------------------------------------------
// Boundary-based option extraction (core algorithm)
// ---------------------------------------------------------------------------

/**
 * Global boundary regex that finds the START POSITION of every option marker.
 * After normalizeOptionSeparators() all markers are in the form "X) " so this
 * pattern is simple and reliable.
 *
 * Matches: A) B) C) D) (also lowercase, also Nepali already converted)
 */
const OPTION_BOUNDARY_RE = /\b([ABCDabcd])\)\s*/g;

/**
 * Extract options from a question block using boundary-based slicing.
 *
 * Algorithm:
 * 1. Normalize all separator variants (A. A: A- etc.) to "A) " form first.
 * 2. Find every option marker position using a global regex.
 * 3. Slice the text between consecutive markers.
 * 4. Each slice belongs exclusively to its own option — no greedy appending.
 *
 * Returns: { options, questionText }
 * questionText = everything BEFORE the first option marker.
 */
function extractOptionsFromBlock(rawBlock: string): {
  options: Record<string, string>;
  questionBodyText: string;
} {
  // Normalize separators first so A. A: A- all become A)
  const block = normalizeOptionSeparators(rawBlock);

  const options: Record<string, string> = {};
  const boundaries: Array<{ label: string; start: number; end: number }> = [];

  // Reset lastIndex before exec loop
  OPTION_BOUNDARY_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = OPTION_BOUNDARY_RE.exec(block)) !== null) {
    const label = m[1].toUpperCase();
    if (["A", "B", "C", "D"].includes(label)) {
      // Avoid duplicates — keep first occurrence of each label
      if (!boundaries.find((b) => b.label === label)) {
        boundaries.push({
          label,
          start: m.index,
          end: m.index + m[0].length, // end of the marker itself
        });
      }
    }
  }

  // Sort by position in text
  boundaries.sort((a, b) => a.start - b.start);

  if (boundaries.length === 0) {
    // No option markers found at all
    return { options, questionBodyText: block.trim() };
  }

  // Question body text = everything before the first option marker
  const questionBodyText = block.slice(0, boundaries[0].start).trim();

  // Slice text between consecutive boundaries
  for (let i = 0; i < boundaries.length; i++) {
    const { label, end } = boundaries[i];
    const nextStart = i + 1 < boundaries.length ? boundaries[i + 1].start : block.length;
    let optionContent = block.slice(end, nextStart).trim();

    // Safety: strip any trailing new-question pattern (accidental block merge)
    const newQMatch = optionContent.match(NEW_Q_IN_OPTION_RE);
    if (newQMatch) {
      optionContent = optionContent.slice(0, newQMatch.index).trim();
    }

    // Reject if content looks like OCR garbage
    if (isOcrGarbage(optionContent)) {
      optionContent = optionContent.slice(0, 200); // truncate rather than discard
    }

    if (optionContent) {
      options[label] = optionContent;
    }
  }

  return { options, questionBodyText };
}

// ---------------------------------------------------------------------------
// Block splitter
// ---------------------------------------------------------------------------

/**
 * Split OCR text into per-question blocks using the flexible question-start regex.
 */
function splitIntoQuestionBlocks(text: string): string[] {
  const lines = text.split("\n");
  const blocks: string[] = [];
  let current: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const isQStart = QUESTION_START_RE.test(line);

    if (isQStart && current.length > 0) {
      blocks.push(current.join("\n"));
      current = [];
    }
    current.push(line);
  }
  if (current.length > 0) blocks.push(current.join("\n"));
  return blocks.filter((b) => b.length > 10);
}

// ---------------------------------------------------------------------------
// Single-block parser
// ---------------------------------------------------------------------------

function parseQuestionBlock(
  block: string,
  hasNumberingGap: boolean
): ParsedQuestion | null {
  const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return null;

  // Flexible: matches "1." "1)" "1," "Q1." "Q1)" "1 What" "(1)" etc.
  const numMatch = lines[0].match(
    /^[|;:\\\u0964\-\s'"]{0,5}(?:Q\.?\s*)?\(?([1-9][0-9]{0,2}|[१-९][०-९]{0,2})\)?\s*[.):,]\s+(.*)/
  );
  if (!numMatch) return null;

  const questionNumber = parseInt(convertNepaliNumerals(numMatch[1]));
  if (isNaN(questionNumber) || questionNumber <= 0 || questionNumber > 500) return null;

  // Reconstruct the block text (first-line remainder + rest of lines)
  // We pass the FULL block to the boundary extractor so it can find options
  // across all layouts (vertical, horizontal, multiline, inline-mixed).
  const blockWithoutNumber = [numMatch[2], ...lines.slice(1)].join("\n");

  const { options, questionBodyText } = extractOptionsFromBlock(blockWithoutNumber);

  // If boundary extraction found no options, try a last-resort full-text inline scan
  // on the raw (pre-normalized) block text
  if (Object.keys(options).length < 2) {
    const fullText = blockWithoutNumber.replace(/\n/g, " ");
    const fallback = extractOptionsFromBlock(fullText);
    if (Object.keys(fallback.options).length >= 2) {
      Object.assign(options, fallback.options);
    }
  }

  const questionText = questionBodyText || numMatch[2].trim();
  const { score, warnings } = computeConfidence(options, questionText, hasNumberingGap);

  const warningMsg =
    warnings.length > 0 ? warnings.join("; ") : undefined;

  return {
    number: questionNumber,
    text: questionText,
    optionA: options["A"] || "",
    optionB: options["B"] || "",
    optionC: options["C"] || "",
    optionD: options["D"] || "",
    answer: "",
    language: detectLanguage(questionText),
    confidence: score,
    hasWarning: warnings.length > 0,
    warningMessage: warningMsg,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function parseQuestions(rawOcrText: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const normalizedText = normalizeText(rawOcrText);
  const blocks = splitIntoQuestionBlocks(normalizedText);

  if (!blocks.length) {
    errors.push("No questions detected. Check image quality or format.");
    return { questions: [], errors, warnings, rawText: normalizedText };
  }

  // First pass: parse all blocks (without gap info yet)
  const rawQuestions: ParsedQuestion[] = [];
  for (const block of blocks) {
    const parsed = parseQuestionBlock(block, false);
    if (parsed) {
      rawQuestions.push(parsed);
    } else {
      warnings.push(`Could not parse block: "${block.substring(0, 60)}..."`);
    }
  }

  // Duplicate number detection
  const seenNumbers = new Set<number>();
  const duplicates = new Set<number>();
  for (const q of rawQuestions) {
    if (seenNumbers.has(q.number)) {
      duplicates.add(q.number);
    }
    seenNumbers.add(q.number);
  }
  if (duplicates.size > 0) {
    const dupeList = [...duplicates].sort((a, b) => a - b).join(", ");
    warnings.push(`Duplicate question numbers detected: Q${dupeList}`);
    for (const q of rawQuestions) {
      if (duplicates.has(q.number)) {
        q.hasWarning = true;
        q.warningMessage = [q.warningMessage, `Duplicate number Q${q.number}`]
          .filter(Boolean)
          .join("; ");
      }
    }
  }

  // Numbering gap detection — re-score with gap flag
  const questions: ParsedQuestion[] = [];
  for (let i = 0; i < rawQuestions.length; i++) {
    const q = rawQuestions[i];
    const hasGap =
      i > 0 && q.number !== rawQuestions[i - 1].number + 1;

    if (hasGap) {
      warnings.push(
        `Numbering gap: expected Q${rawQuestions[i - 1].number + 1}, got Q${q.number}`
      );
      // Re-compute confidence including gap penalty
      const { score, warnings: confWarnings } = computeConfidence(
        {
          A: q.optionA,
          B: q.optionB,
          C: q.optionC,
          D: q.optionD,
        },
        q.text,
        true
      );
      q.confidence = score;
      q.hasWarning = true;
      q.warningMessage = confWarnings.join("; ");
    }

    questions.push(q);
  }

  return { questions, errors, warnings, rawText: normalizedText };
}

export function matchAnswers(
  questions: ParsedQuestion[],
  answerKey: Record<number, string>
): { matched: ParsedQuestion[]; mismatches: string[] } {
  const mismatches: string[] = [];
  const matched = questions.map((q) => {
    const answer = answerKey[q.number];
    if (!answer) {
      mismatches.push(`Q${q.number}: No answer in key`);
      return { ...q, answer: "", hasWarning: true };
    }
    return { ...q, answer };
  });
  for (const num of Object.keys(answerKey)) {
    const n = parseInt(num);
    if (!questions.find((q) => q.number === n)) {
      mismatches.push(`Answer key Q${n} has no matching question`);
    }
  }
  return { matched, mismatches };
}
