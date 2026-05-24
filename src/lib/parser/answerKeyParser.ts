import { normalizeText, convertNepaliNumerals, validateAnswer } from "./ocrCorrections";

export interface AnswerKeyResult {
  answers: Record<number, string>;
  errors: string[];
  totalParsed: number;
}

const NEPALI_OPTION_MAP: Record<string, string> = {
  क: "A", ख: "B", ग: "C", घ: "D",
};

// ---------------------------------------------------------------------------
// Dense-region detection
// ---------------------------------------------------------------------------

/**
 * Scan a text string and return only the substrings that are "dense answer-key
 * regions" — areas where at least MIN_CONSECUTIVE answer patterns occur within
 * a sliding window of WINDOW_SIZE characters.
 *
 * This prevents false positives like "question 2 B was..." from being parsed
 * as answer key entries, because such isolated occurrences never form a dense
 * cluster.
 */
const WINDOW_SIZE = 600; // characters – wider window catches sparsely-formatted keys
const MIN_CONSECUTIVE = 2; // lower threshold so keys with ~50 Qs are still detected

function extractDenseAnswerRegions(text: string): string[] {
  // A loose "any answer-key-like token" pattern
  // Allow optional spaces and any standard separator: ) . : - = ] } >
  const tokenRe = /(?:^|\b|\s)(\d{1,3})\s*[.):\-=\]}>]?\s*([ABCDabcd])(?:\b|\s|$)/g;
  const matches: Array<{ index: number; raw: string }> = [];

  let m: RegExpExecArray | null;
  while ((m = tokenRe.exec(text)) !== null) {
    matches.push({ index: m.index, raw: m[0] });
  }

  if (matches.length < MIN_CONSECUTIVE) {
    // Not enough matches anywhere — return empty (no valid answer key found)
    return [];
  }

  const regions: string[] = [];
  let i = 0;
  while (i < matches.length) {
    // Find how many consecutive matches fit in a window starting at matches[i]
    const windowStart = matches[i].index;
    let j = i;
    while (j < matches.length && matches[j].index - windowStart <= WINDOW_SIZE) {
      j++;
    }
    const count = j - i;
    if (count >= MIN_CONSECUTIVE) {
      // Extract the region from text
      const regionStart = matches[i].index;
      const regionEnd = matches[j - 1].index + matches[j - 1].raw.length;
      // Expand slightly for safety
      const safeStart = Math.max(0, regionStart - 10);
      const safeEnd = Math.min(text.length, regionEnd + 10);
      regions.push(text.slice(safeStart, safeEnd));
      i = j; // skip past this window
    } else {
      i++;
    }
  }

  return regions;
}

// ---------------------------------------------------------------------------
// Core parser
// ---------------------------------------------------------------------------

export function parseAnswerKey(rawOcrText: string): AnswerKeyResult {
  const errors: string[] = [];
  const answers: Record<number, string> = {};
  let processed = rawOcrText;
  
  // Fix cross-language hallucination (English digit + Nepali zero = number + c)
  processed = processed.replace(/(\d{1,3})०/g, "$1c ");
  // Fix Devanagari 8 (often 'c') before it gets converted to English 8
  processed = processed.replace(/(\d{1,3})८/g, "$1c ");
  // Fix Devanagari 7 (often 'c') before it gets converted to English 7
  processed = processed.replace(/(\d{1,3})७/g, "$1c ");
  
  processed = normalizeText(processed);
  processed = convertNepaliNumerals(processed);

  // Replace Nepali option letters
  for (const [nepali, english] of Object.entries(NEPALI_OPTION_MAP)) {
    processed = processed.split(nepali).join(english);
  }

  // Pre-process OCR garbage commonly found in dense tables
  processed = processed.replace(/[\[\]|{}]/g, " "); // Remove table borders misread as brackets/pipes
  processed = processed.replace(/\b(\d{1,3})e\b/gi, "$1c"); // 'e' is almost always a misread 'c' in options
  processed = processed.replace(/\b(\d{1,3})o\b/gi, "$1d"); // 'o' is often a misread 'd' or 'c'
  processed = processed.replace(/\bs([abcdABCD])\b/gi, "5$1"); // 's' at start is often '5' (e.g. sb -> 5b)
  processed = processed.replace(/\bl([abcdABCD])\b/gi, "1$1"); // 'l' at start is often '1'
  processed = processed.replace(/\bI([abcdABCD])\b/gi, "1$1"); // 'I' at start is often '1'
  processed = processed.replace(/\b(\d{1,2})8\b/gi, "$1a"); // e.g. 118 -> 11a (8 misread for a or B)
  processed = processed.replace(/\b(\d{1,2})6\b/gi, "$1b"); // e.g. 116 -> 11b (6 misread for b)
  processed = processed.replace(/\b(\d{1,2})0\b/gi, "$1d"); // e.g. 810 -> 81d (0 misread for d)
  processed = processed.replace(/\b(\d{1,2})2\b/gi, "$1a"); // e.g. 612 -> 61a (2 misread for a)

  // Extract only dense answer-key regions to prevent false positives
  const regions = extractDenseAnswerRegions(processed);

  // If no dense region found, fall back to scanning the full text
  // (some answer keys have one answer per line, which is already "dense" per line)
  const textsToScan =
    regions.length > 0 ? regions : [processed];

  // Helper: scan a chunk of text with the unified pattern
  const scanText = (text: string) => {
    // Unified Pattern: captures virtually all valid answer key formats.
    // Matches: "1. A", "1) B", "1-C", "1:D", "1=A", "1 A", "1A", "01 a", "100.d"
    // Also captures with leading/trailing non-word chars to avoid JS \b bugs with Devanagari/spaces.
    const unifiedPattern = /(?:^|\b|\s|[^a-zA-Z0-9])(\d{1,3})\s*[.):\-=\]}>]?\s*([ABCDabcd])(?:\b|\s|[^a-zA-Z0-9]|$)/g;
    let m: RegExpExecArray | null;
    while ((m = unifiedPattern.exec(text)) !== null) {
      const num = parseInt(m[1]);
      const ans = validateAnswer(m[2]);
      if (ans && num >= 1 && num <= 300 && !answers[num]) {
        answers[num] = ans;
      }
    }
  };

  for (const regionText of textsToScan) {
    scanText(regionText);
  }

  // --- Supplementary per-line scan (always runs) ---
  // This catches answers that the sliding-window detector or dense-region
  // approach missed because the answer key is sparse or has a header.
  // Keeping first-found wins (answers already set above are NOT overwritten).
  const linePattern = /(?:^|[^a-zA-Z0-9])(\d{1,3})\s*[.):\-=\]}>]?\s*([ABCDabcd])(?:[^a-zA-Z0-9]|$)/g;
  for (const line of processed.split(/\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    linePattern.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = linePattern.exec(trimmed)) !== null) {
      const num = parseInt(m[1]);
      const ans = validateAnswer(m[2]);
      if (ans && num >= 1 && num <= 300 && !answers[num]) {
        answers[num] = ans;
      }
    }
  }

  if (Object.keys(answers).length === 0) {
    errors.push("No answers parsed. Check image quality and format.");
  }

  return { answers, errors, totalParsed: Object.keys(answers).length };
}

// ---------------------------------------------------------------------------
// Validators
// ---------------------------------------------------------------------------

export function validateAnswerKey(answers: Record<number, string>): string[] {
  const warnings: string[] = [];
  const nums = Object.keys(answers).map(Number).sort((a, b) => a - b);

  // Gap detection
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] !== nums[i - 1] + 1) {
      warnings.push(`Answer key gap between Q${nums[i - 1]} and Q${nums[i]}`);
    }
  }

  // Invalid answer values (should never happen after validateAnswer() above,
  // but belt-and-suspenders check)
  for (const [num, ans] of Object.entries(answers)) {
    if (!["A", "B", "C", "D"].includes(ans)) {
      warnings.push(`Q${num}: Invalid answer value "${ans}" — will be rejected`);
      delete answers[Number(num)];
    }
  }

  return warnings;
}
