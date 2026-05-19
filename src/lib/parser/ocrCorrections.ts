/**
 * OCR Correction Dictionary
 * Maps common Tesseract misreads → correct characters
 * Covers both English and Nepali (Devanagari) contexts
 */

// Common English OCR substitutions — applied ONLY in specific contexts, NOT globally.
// NOTE: "1" → "l" was intentionally removed from here; applying it globally corrupts
// question numbers, years, and formulas. It is handled contextually in fixOptionLabel().
export const ENGLISH_CORRECTIONS: Record<string, string> = {
  // Punctuation cleanup only — safe to apply globally
  ",,": ",",
  "..": ".",
  "  ": " ",
};

// Devanagari numeral map (for question numbers)
export const NEPALI_TO_ARABIC: Record<string, string> = {
  "०": "0",
  "१": "1",
  "२": "2",
  "३": "3",
  "४": "4",
  "५": "5",
  "६": "6",
  "७": "7",
  "८": "8",
  "९": "9",
};

// Nepali option letters → English
export const NEPALI_OPTIONS: Record<string, string> = {
  क: "A",
  ख: "B",
  ग: "C",
  घ: "D",
  "क)": "A",
  "ख)": "B",
  "ग)": "C",
  "घ)": "D",
};

/**
 * Converts Nepali/Devanagari numerals to Arabic numerals
 */
export function convertNepaliNumerals(text: string): string {
  return text.replace(/[०-९]/g, (d) => NEPALI_TO_ARABIC[d] || d);
}

/**
 * Normalize OCR option separators into a consistent "X)" format.
 * Handles ALL documented OCR variants:
 *   English:  A.  A:  A-  A<space>  (space-only, at line start)
 *   Nepali:   क)  क.  क:  क-  क))  (double-paren)  क<space>
 * This must be run BEFORE boundary-based option extraction.
 *
 * Examples:
 *   "A. text"     → "A) text"
 *   "A: text"     → "A) text"
 *   "A- text"     → "A) text"
 *   "A This"      → "A) This"  (line-start space separator)
 *   "क) text"     → "A) text"
 *   "क)) text"    → "A) text"  (double-paren Nepali)
 *   "ख. text"     → "B) text"
 */
export function normalizeOptionSeparators(text: string): string {
  let out = text;

  // Step 0: Common OCR Hallucinations for options
  out = out.replace(/©\s*[.):\-]?\s*/g, "C) "); // © is almost always a misread C
  out = out.replace(/छ[ेै]?\s*\)/g, "B) "); // Devanagari 'chha/chhe/chhai' is often a misread of B)
  out = out.replace(/उ\s*\)/g, "B) "); // Devanagari 'u' is often a misread of B)
  out = out.replace(/-\s*गि\s*/g, "B) "); // specific weird misread in q6
  out = out.replace(/\(९\)\s*/g, "C) "); // Devanagari 9 in parens is often a misread of C)
  out = out.replace(/\("\)\s*/g, "C) "); // (") is often C)
  out = out.replace(/\(8\)\s*/g, "C) "); // (8) is often C)
  out = out.replace(/7\s*\)/g, "D) "); // 7) is often a misread D)

  // 1D) is just D)
  out = out.replace(/\b1D\)/g, "D)");

  // '13)' and '3)' are often misread B)
  out = out.replace(/(^|\s)13\)/g, "$1B) ");
  out = out.replace(/(^|\s)3\)/g, "$1B) ");

  // A: B: C: D: format
  out = out.replace(/\bA:\s/g, "A) ");
  out = out.replace(/\bB:\s/g, "B) ");
  out = out.replace(/\bC:\s/g, "C) ");
  out = out.replace(/\bD:\s/g, "D) ");

  // 5), 6), 8) or 9) not at the start of a line is often a misread B)
  out = out.replace(/([a-zA-Z\u0900-\u097F]\s+)(5|6|8|9)\s*\)/g, "$1B) ");
  
  // (0) or 0) at the START of a line is often C)
  out = out.replace(/^[|;:\\\u0964\-\s'"]*\(?0\)\s*/gm, "C) ");

  // (') is often C) at the start of a line
  out = out.replace(/^[|;:\\\u0964\-\s'"]*\('\)\s*/gm, "C) ");

  // 1) not at the start of a line could be B) or D) but usually context implies it. 
  // We'll replace it with D) if it follows C) or another option, but 1) is too ambiguous to blindly replace.
  // We'll leave 1) alone for now except:
  out = out.replace(/([a-zA-Z\u0900-\u097F]\s+)1\s*\)/g, "$1D) ");

  // 0) not at the start of a line is often a misread D)
  out = out.replace(/([a-zA-Z\u0900-\u097F]\s+)0\s*\)/g, "$1D) ");

  // Step 1: Nepali double-paren क)) ख)) ग)) घ)) — must come BEFORE single-paren pass
  out = out.replace(
    /(क|ख|ग|घ)\)\)/g,
    (_, letter) => `${NEPALI_OPTIONS[letter] || letter}) `
  );

  // Step 2: Nepali option letter + any separator (single ) . : -)
  // Use (^|\\s) instead of \\b because \\b fails between space and Devanagari (both \\W)
  out = out.replace(
    /(^|\s)(क|ख|ग|घ)\s*[).:\-]\s*/g,
    (_, prefix, letter) => `${prefix}${NEPALI_OPTIONS[letter] || letter}) `
  );

  // Step 3: Nepali option letter + space only (e.g. "क text")
  out = out.replace(
    /(^|\s)(क|ख|ग|घ)\s+(?=[^\s])/g,
    (_, prefix, letter) => `${prefix}${NEPALI_OPTIONS[letter] || letter}) `
  );

  // Step 3.2: Nepali options in parentheses (क) [क]
  out = out.replace(
    /[({\[]\s*(क|ख|ग|घ)\s*[)}\]]\s*/g,
    (_, letter) => `${NEPALI_OPTIONS[letter] || letter}) `
  );

  // Step 3.5: Support for (A) [A] {A} format
  out = out.replace(
    /[({\[]\s*([ABCDabcd])\s*[)}\]]\s*/g,
    (_, letter) => `${letter.toUpperCase()}) `
  );

  // Step 4: English option letter + explicit separator (A. A: A-)
  out = out.replace(
    /\b([ABCDabcd])\s*[.:\-]\s*(?=\S)/g,
    (_, letter) => `${letter.toUpperCase()}) `
  );

  // Step 5: English option letter at the START OF A LINE with space separator only.
  // "^A This is option" → "A) This is option"
  // Only applies when:
  //   - The letter is at the very start of the line (multiline ^ with /m flag)
  //   - Followed by a space then a non-space character
  //   - The next character is uppercase, a digit, or Devanagari (not random word)
  // This is the most ambiguous case — we restrict it to line-start only.
  out = out.replace(
    /^([ABCDabcd]) (?=[A-Z\u0900-\u097F\d])/gm,
    (_, letter) => `${letter.toUpperCase()}) `
  );

  return out;
}

/**
 * Remove header/footer noise lines from OCR output.
 * Filters out:
 *  - Pure page numbers (lines that are just 1–3 digits)
 *  - Lines shorter than 4 chars (noise)
 *  - Lines that appear 3+ times in the document (repeated headers/footers)
 *  - Lines matching known header/footer patterns (website URLs, "Page X of Y", etc.)
 */
export function removeHeadersAndFooters(text: string): string {
  const lines = text.split("\n");

  // Count line frequencies (case-insensitive, trimmed)
  const freq = new Map<string, number>();
  for (const line of lines) {
    const key = line.trim().toLowerCase();
    if (key.length > 0) {
      freq.set(key, (freq.get(key) || 0) + 1);
    }
  }

  const filtered = lines.filter((rawLine) => {
    const line = rawLine.trim();
    if (!line) return false;

    // Remove pure page numbers
    if (/^\d{1,3}$/.test(line)) return false;

    // Remove very short noise (e.g. stray OCR glyphs)
    if (line.length < 4 && !/[a-zA-Z\u0900-\u097F]/.test(line)) return false;

    // Remove lines that repeat 3+ times (headers/footers)
    const key = line.toLowerCase();
    if ((freq.get(key) || 0) >= 3) return false;

    // Remove lines matching known header/footer patterns
    if (/^\s*(page\s+\d+|www\.|http|©|copyright|\d+\s*\/\s*\d+)\s*$/i.test(line)) return false;

    // Remove short all-caps noise lines (e.g. "MCQ", "QNO", "ANS")
    if (/^[A-Z\s]{1,6}$/.test(line) && line.length <= 6) return false;

    return true;
  });

  return filtered.join("\n");
}

/**
 * Normalize text: fix common OCR noise, normalize whitespace.
 * Does NOT apply any letter→letter substitutions globally.
 */
export function normalizeText(text: string): string {
  let out = text;
  
  // OCR Correction BEFORE Nepali numeral conversion!
  out = out.replace(/८\s*\)/g, "C) "); // Devanagari 8 is often a misread of C)
  
  // Normalize Nepali digits
  out = convertNepaliNumerals(out);
  // Normalize line endings
  out = out.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Extreme hallucination for "1." at start of block
  out = out.replace(/^[|\s\[\]]*[\|Il\]]\.\s/gm, "1. ");

  // Standardize common question separators: sometimes 1 , becomes 1.
  // Actually handled by regex now, but we can clean up spaces.
  out = out.replace(/(\d{1,3})\s+\.\s/g, "$1. ");
  // Collapse multiple spaces (but keep newlines)
  out = out.replace(/[ \t]+/g, " ");
  // Remove lines that are purely noise (no alphanumeric content)
  out = out
    .split("\n")
    .filter((line) => /[a-zA-Z\u0900-\u097F0-9]/.test(line))
    .join("\n");
  // Remove repeated headers/footers
  out = removeHeadersAndFooters(out);
  return out.trim();
}

/**
 * Fix common OCR letter-level errors in option labels ONLY.
 * Never call this on full question text.
 */
export function fixOptionLabel(raw: string): string {
  const trimmed = raw.trim().toUpperCase();
  if (["A", "B", "C", "D"].includes(trimmed)) return trimmed;
  // Map Nepali option letters
  if (NEPALI_OPTIONS[raw.trim()]) return NEPALI_OPTIONS[raw.trim()];
  // Fix digit-letter confusion in option context only
  if (trimmed === "0") return "D"; // rare but seen
  if (trimmed === "8") return "B";
  if (trimmed === "1") return "A"; // "1" mistaken for "l" → first option
  if (trimmed === "|") return "I"; // pipe → I (not used as option but safety)
  return trimmed;
}

/**
 * Validate that an answer is strictly one of A, B, C, D.
 * Returns the validated answer or null if invalid.
 */
export function validateAnswer(raw: string): "A" | "B" | "C" | "D" | null {
  if (!raw) return null;
  const upper = raw.trim().toUpperCase();
  if (upper === "A" || upper === "B" || upper === "C" || upper === "D") {
    return upper as "A" | "B" | "C" | "D";
  }
  return null;
}
