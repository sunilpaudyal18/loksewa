import { normalizeText, convertNepaliNumerals } from "./ocrCorrections";

export interface AnswerKeyResult {
  answers: Record<number, string>;
  errors: string[];
  totalParsed: number;
}

const NEPALI_OPTION_MAP: Record<string, string> = {
  क: "A", ख: "B", ग: "C", घ: "D",
};

export function parseAnswerKey(rawOcrText: string): AnswerKeyResult {
  const errors: string[] = [];
  const answers: Record<number, string> = {};

  let processed = normalizeText(rawOcrText);
  processed = convertNepaliNumerals(processed);

  // Replace Nepali option letters
  for (const [nepali, english] of Object.entries(NEPALI_OPTION_MAP)) {
    processed = processed.split(nepali).join(english);
  }

  // Pattern 1: "1. A" / "1) B" / "1-C" / "1:D" (with explicit separator)
  const withSeparator = /\b(\d{1,3})\s*[.):\-]\s*([ABCDabcd])\b/g;
  let m: RegExpExecArray | null;
  while ((m = withSeparator.exec(processed)) !== null) {
    const num = parseInt(m[1]);
    const ans = m[2].toUpperCase();
    if (num >= 1 && num <= 300 && !answers[num]) answers[num] = ans;
  }

  // Pattern 2: Table format "1 a  2 b  3 c" (number space letter)
  // Used in the book's answer key tables
  const tableFormat = /\b(\d{1,3})\s+([ABCDabcd])\b/g;
  while ((m = tableFormat.exec(processed)) !== null) {
    const num = parseInt(m[1]);
    const ans = m[2].toUpperCase();
    if (num >= 1 && num <= 300 && !answers[num]) answers[num] = ans;
  }

  // Pattern 3: Concatenated "1a 2b 3c" (no space)
  const concat = /\b(\d{1,3})([ABCDabcd])\b/g;
  while ((m = concat.exec(processed)) !== null) {
    const num = parseInt(m[1]);
    const ans = m[2].toUpperCase();
    if (num >= 1 && num <= 300 && !answers[num]) answers[num] = ans;
  }

  if (Object.keys(answers).length === 0) {
    errors.push("No answers parsed. Check image quality and format.");
  }

  return { answers, errors, totalParsed: Object.keys(answers).length };
}

export function validateAnswerKey(answers: Record<number, string>): string[] {
  const warnings: string[] = [];
  const nums = Object.keys(answers).map(Number).sort((a, b) => a - b);
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] !== nums[i - 1] + 1) {
      warnings.push(`Answer key gap between Q${nums[i-1]} and Q${nums[i]}`);
    }
  }
  return warnings;
}
