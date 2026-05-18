/**
 * OCR Correction Dictionary
 * Maps common Tesseract misreads → correct characters
 * Covers both English and Nepali (Devanagari) contexts
 */

// Common English OCR substitutions
export const ENGLISH_CORRECTIONS: Record<string, string> = {
  // Letters confused with numbers
  "0": "O", // Only in option labels
  "|": "I",
  "1": "l",
  // Punctuation cleanup
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
 * Normalize text: fix common OCR noise, normalize whitespace
 */
export function normalizeText(text: string): string {
  let out = text;
  // Normalize Nepali digits
  out = convertNepaliNumerals(out);
  // Normalize line endings
  out = out.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  // Remove form feeds and null bytes
  out = out.replace(/[\x00\x0C]/g, "");
  // Collapse multiple spaces (but keep newlines)
  out = out.replace(/[ \t]+/g, " ");
  // Remove lines that are purely noise (short lines with no alphanumeric)
  out = out
    .split("\n")
    .filter((line) => /[a-zA-Z\u0900-\u097F0-9]/.test(line))
    .join("\n");
  return out.trim();
}

/**
 * Fix common OCR letter-level errors in option labels only
 */
export function fixOptionLabel(raw: string): string {
  const trimmed = raw.trim().toUpperCase();
  if (["A", "B", "C", "D"].includes(trimmed)) return trimmed;
  // Map Nepali option letters
  if (NEPALI_OPTIONS[raw.trim()]) return NEPALI_OPTIONS[raw.trim()];
  // Fix digit-letter confusion in option context
  if (trimmed === "0") return "D"; // rare but seen
  if (trimmed === "8") return "B";
  return trimmed;
}
