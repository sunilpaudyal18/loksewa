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
const WINDOW_SIZE = 300; // characters
const MIN_CONSECUTIVE = 3; // minimum matches in the window

function extractDenseAnswerRegions(text: string): string[] {
  // A loose "any answer-key-like token" pattern
  const tokenRe = /\b(\d{1,3})\s*[.):\-\s]?\s*([ABCDabcd])\b/g;
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

  let processed = normalizeText(rawOcrText);
  processed = convertNepaliNumerals(processed);

  // Replace Nepali option letters
  for (const [nepali, english] of Object.entries(NEPALI_OPTION_MAP)) {
    processed = processed.split(nepali).join(english);
  }

  // Extract only dense answer-key regions to prevent false positives
  const regions = extractDenseAnswerRegions(processed);

  // If no dense region found, fall back to scanning the full text
  // (some answer keys have one answer per line, which is already "dense" per line)
  const textsToScan =
    regions.length > 0 ? regions : [processed];

  for (const regionText of textsToScan) {
    // Pattern 1: "1. A" / "1) B" / "1-C" / "1:D" (explicit separator)
    const withSeparator = /\b(\d{1,3})\s*[.):\-]\s*([ABCDabcd])\b/g;
    let m: RegExpExecArray | null;
    while ((m = withSeparator.exec(regionText)) !== null) {
      const num = parseInt(m[1]);
      const ans = validateAnswer(m[2]);
      if (ans && num >= 1 && num <= 300 && !answers[num]) {
        answers[num] = ans;
      }
    }

    // Pattern 2: Table format "1 A  2 B  3 C" (number space letter)
    // Only within dense regions so false positives are already blocked
    const tableFormat = /\b(\d{1,3})\s+([ABCDabcd])\b/g;
    while ((m = tableFormat.exec(regionText)) !== null) {
      const num = parseInt(m[1]);
      const ans = validateAnswer(m[2]);
      if (ans && num >= 1 && num <= 300 && !answers[num]) {
        answers[num] = ans;
      }
    }

    // Pattern 3: Concatenated "1a 2b 3c" (no separator)
    const concat = /\b(\d{1,3})([ABCDabcd])\b/g;
    while ((m = concat.exec(regionText)) !== null) {
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
