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

  // -----------------------------------------------------------------------
  // Step 0: Broad Devanagari syllable OCR hallucinations for option labels
  // Tesseract often reads 'C)' as Devanagari syllables like 'लो)', 'जि)', 'गि)', etc.
  // and 'D)' as 'जि)', 'दि)', etc. We normalise ALL known cases here FIRST.
  // -----------------------------------------------------------------------

  // --- C) look-alikes ---
  out = out.replace(/©\s*[.):\-]?\s*/g, "C) ");            // © misread of C
  out = out.replace(/\([९9]\)\s*/g, "C) ");                 // (९) / (9) → C)
  out = out.replace(/\("\)\s*/g, "C) ");                    // (") → C)
  out = out.replace(/\([८8]\)\s*/g, "C) ");                 // (८) / (8) → C)
  // (0) / 0) anywhere in the line (not just line-start) → C)
  out = out.replace(/\s*\([०0]\)\s*/g, " C) ");             // (०) / (0) → C)
  out = out.replace(/\s*\(c\)\s*/gi, " C) ");              // (c) → C)
  out = out.replace(/\s*\(o\)\s*/gi, " C) ");              // (o) → C) — 'o' often misread for '0' or 'c'
  
  // --- A) and B) look-alikes ---
  out = out.replace(/\([१1]\)\s*/g, "A) ");                 // (१) / (1) → A)
  out = out.replace(/\([२2]\)\s*/g, "B) ");                 // (२) / (2) → B)
  out = out.replace(/\([३3]\)\s*/g, "B) ");                 // (३) / (3) → B)
  out = out.replace(/^[|;:\\\u0964\-\s'"]*\(?0\)\s*/gm, "C) "); // line-start 0)
  out = out.replace(/^[|;:\\\u0964\-\s'"]*\('\)\s*/gm, "C) ");  // line-start (')

  // Devanagari syllables that Tesseract confuses with 'C)'
  // Covers: ल) लो) ला) लि) ले) लो) लु) ल्) + ज) जि) जा) जे) + ग misreads
  out = out.replace(/\s+(?:ल[ोािेुू]?|जि|जा|जे|गि|गा|गे|गु|से|सि|सा|ती|ति|ता|नि|ना|ने|रो|रि|वि|वा|वे|श्री|श्र|ची|चि|चा|चे)\s*\)\s*/g, " C) ");

  // --- D) look-alikes ---
  out = out.replace(/7\s*\)/g, "D) ");                      // 7) → D)
  out = out.replace(/\b1D\)/g, "D)");                       // 1D) → D)
  // Devanagari syllables that Tesseract confuses with 'D)'
  out = out.replace(/\s+(?:जी|जो|दि|दा|दे|दो|ड[ािोेु]?|ध[ािोेु]?)\s*\)\s*/g, " D) ");

  // --- B) look-alikes ---
  out = out.replace(/छ[ेै]?\s*\)/g, "B) ");               // chha variants → B)
  out = out.replace(/उ\s*\)/g, "B) ");                      // उ → B)
  out = out.replace(/-\s*गि\s*/g, "B) ");                  // -गि → B)
  // '13)' and '3)' are often misread B)
  out = out.replace(/(^|\s)13\)/g, "$1B) ");
  out = out.replace(/(^|\s)3\)/g, "$1B) ");
  // 5), 6), 8), 9) mid-line → B)
  out = out.replace(/([a-zA-Z\u0900-\u097F]\s+)(5|6|8|9)\s*\)/g, "$1B) ");

  // A: B: C: D: format
  out = out.replace(/\bA:\s/g, "A) ");
  out = out.replace(/\bB:\s/g, "B) ");
  out = out.replace(/\bC:\s/g, "C) ");
  out = out.replace(/\bD:\s/g, "D) ");

  // Mid-line digit) → D) when preceded by letter/Devanagari text
  out = out.replace(/([a-zA-Z\u0900-\u097F]\s+)1\s*\)/g, "$1D) ");
  out = out.replace(/([a-zA-Z\u0900-\u097F]\s+)0\s*\)/g, "$1D) ");

  // Line-start digit/misread to option letter
  out = out.replace(/^[|;:\\\u0964\-\s'"]*[१1]\s*\)/gm, "A) ");
  out = out.replace(/^[|;:\\\u0964\-\s'"]*[२2३3]\s*\)/gm, "B) ");
  out = out.replace(/^[|;:\\\u0964\-\s'"]*[८8९9]\s*\)/gm, "C) ");
  out = out.replace(/^[|;:\\\u0964\-\s'"]*[०0७7]\s*\)/gm, "D) ");

  // -----------------------------------------------------------------------
  // Step 1: Nepali double-paren क)) ख)) ग)) घ)) — must come BEFORE single-paren pass
  // -----------------------------------------------------------------------
  out = out.replace(
    /(क|ख|ग|घ)\)\)/g,
    (_, letter) => `${NEPALI_OPTIONS[letter] || letter}) `
  );

  // Step 2: Nepali option letter + any separator (single ) . : -)
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

  // Step 4: English option letter + explicit separator (A. A: A- A' A" A’ A′)
  out = out.replace(
    /\b([ABCDabcd])\s*[.:\-'"’′]\s*(?=\S)/g,
    (_, letter) => `${letter.toUpperCase()}) `
  );

  // Step 5: English option letter at the START OF A LINE with space separator only.
  out = out.replace(
    /^([ABCDabcd]) (?=[A-Z\u0900-\u097F\d])/gm,
    (_, letter) => `${letter.toUpperCase()}) `
  );

  // Step 6: Fix glued option markers — OCR sometimes omits the space before an
  // inline option marker, e.g. "MauchlyD) All" or "CrayC) Simur".
  // Pattern: lowercase/Devanagari letter immediately followed by [ABCD]) + uppercase/digit
  out = out.replace(
    /([a-z\u0900-\u097F])([ABCD])\)\s*([A-Z\u0900-\u097F\d])/g,
    (_, pre, opt, next) => `${pre} ${opt}) ${next}`
  );

  // Step 7: Strip stray visual separators between inline options
  // e.g. "Allen Turing - B)" → "Allen Turing B)" — the dash is just decoration
  out = out.replace(/\s+[-–—]\s+(?=[ABCD]\))/g, " ");

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
