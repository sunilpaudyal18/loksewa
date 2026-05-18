import {
  normalizeText,
  fixOptionLabel,
  convertNepaliNumerals,
  NEPALI_OPTIONS,
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

function detectLanguage(text: string): "en" | "ne" {
  const dev = (text.match(/[\u0900-\u097F]/g) || []).length;
  const total = text.replace(/\s/g, "").length;
  return total > 0 && dev / total > 0.3 ? "ne" : "en";
}

/** Extract options from a single line that may have A) text B) text C) text D) text */
function extractInlineOptions(line: string): Record<string, string> {
  const opts: Record<string, string> = {};
  // Match each option segment: letter followed by ) or . then text until next letter) or end
  const re = /\b([ABCDabcd])[.)]\s*(.*?)(?=\s+[ABCDabcd][.)]\s|$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    const label = m[1].toUpperCase();
    const text = m[2].trim();
    if (text && ["A","B","C","D"].includes(label)) {
      opts[label] = text;
    }
  }
  // Also try Nepali
  if (Object.keys(opts).length === 0) {
    const re2 = /([क-घ])[.)]\s*(.*?)(?=\s+[क-घ][.)]\s|$)/g;
    while ((m = re2.exec(line)) !== null) {
      const label = NEPALI_OPTIONS[m[1]];
      if (label && m[2].trim()) opts[label] = m[2].trim();
    }
  }
  return opts;
}

/** Line-by-line block splitter — more reliable than regex on full text */
function splitIntoQuestionBlocks(text: string): string[] {
  const lines = text.split("\n");
  const blocks: string[] = [];
  let current: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Detect question start: "1." "1)" "Q1." at beginning of line
    const isQStart = /^(?:Q\.?\s*)?([0-9]{1,3}|[०-९]{1,3})[.)]\s+\S/.test(line);

    if (isQStart && current.length > 0) {
      blocks.push(current.join("\n"));
      current = [];
    }
    current.push(line);
  }
  if (current.length > 0) blocks.push(current.join("\n"));
  return blocks.filter(b => b.length > 10);
}

function parseQuestionBlock(block: string): ParsedQuestion | null {
  const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
  if (!lines.length) return null;

  // Extract number from first line
  const numMatch = lines[0].match(/^(?:Q\.?\s*)?([0-9]{1,3}|[०-९]{1,3})[.)]\s*(.*)/);
  if (!numMatch) return null;

  const questionNumber = parseInt(convertNepaliNumerals(numMatch[1]));
  const questionLines: string[] = [numMatch[2]];
  const options: Record<string, string> = {};

  const lineStartsWithOption = (l: string) => /^[(\s]*[ABCDabcdक-घ][.)]\s+/.test(l);

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // STOP if this line looks like a new question start (safety against block merge)
    if (/^(?:Q\.?\s*)?[0-9]{1,3}[.)]\s+\S/.test(line) && Object.keys(options).length > 0) {
      break;
    }

    if (lineStartsWithOption(line)) {
      // Try extracting multiple options from this line
      const inlineOpts = extractInlineOptions(line);
      if (Object.keys(inlineOpts).length >= 1) {
        Object.assign(options, inlineOpts);
      } else {
        // Single option on line
        const m = line.match(/^[(\s]*([ABCDabcdक-घ])[.)]\s+(.*)/);
        if (m) {
          const label = fixOptionLabel(m[1]);
          if (["A","B","C","D"].includes(label)) options[label] = m[2].trim();
        }
      }
    } else if (Object.keys(options).length === 0) {
      // Still in question text — but check if it has embedded options
      const embedded = extractInlineOptions(line);
      if (Object.keys(embedded).length >= 2) {
        Object.assign(options, embedded);
      } else {
        questionLines.push(line);
      }
    } else {
      // Continuation of last option (but not if looks like next question)
      const lastKey = Object.keys(options).at(-1);
      if (lastKey && !/^[0-9]{1,3}[.)]\s/.test(line)) {
        options[lastKey] += " " + line;
      }
    }
  }

  // Last resort: scan full block text for inline options
  if (Object.keys(options).length < 2) {
    const fullText = lines.slice(1).join(" ");
    const embedded = extractInlineOptions(fullText);
    if (Object.keys(embedded).length >= 2) {
      Object.assign(options, embedded);
    }
  }

  const questionText = questionLines.join(" ").trim();
  const hasAll = ["A","B","C","D"].every(k => options[k]);

  return {
    number: questionNumber,
    text: questionText,
    optionA: options["A"] || "",
    optionB: options["B"] || "",
    optionC: options["C"] || "",
    optionD: options["D"] || "",
    answer: "",
    language: detectLanguage(questionText),
    confidence: hasAll ? 0.95 : 0.6,
    hasWarning: !hasAll,
    warningMessage: !hasAll
      ? `Missing: ${["A","B","C","D"].filter(k => !options[k]).join(", ")}`
      : undefined,
  };
}

export function parseQuestions(rawOcrText: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const normalizedText = normalizeText(rawOcrText);
  const blocks = splitIntoQuestionBlocks(normalizedText);

  if (!blocks.length) {
    errors.push("No questions detected. Check image quality or format.");
    return { questions: [], errors, warnings, rawText: normalizedText };
  }

  const questions: ParsedQuestion[] = [];
  for (const block of blocks) {
    const parsed = parseQuestionBlock(block);
    if (parsed) {
      questions.push(parsed);
    } else {
      warnings.push(`Could not parse: "${block.substring(0, 60)}..."`);
    }
  }

  for (let i = 1; i < questions.length; i++) {
    if (questions[i].number !== questions[i-1].number + 1) {
      warnings.push(`Gap: expected Q${questions[i-1].number+1}, got Q${questions[i].number}`);
      questions[i].hasWarning = true;
    }
  }

  return { questions, errors, warnings, rawText: normalizedText };
}

export function matchAnswers(
  questions: ParsedQuestion[],
  answerKey: Record<number, string>
): { matched: ParsedQuestion[]; mismatches: string[] } {
  const mismatches: string[] = [];
  const matched = questions.map(q => {
    const answer = answerKey[q.number];
    if (!answer) {
      mismatches.push(`Q${q.number}: No answer in key`);
      return { ...q, answer: "", hasWarning: true };
    }
    return { ...q, answer };
  });
  for (const num of Object.keys(answerKey)) {
    const n = parseInt(num);
    if (!questions.find(q => q.number === n)) {
      mismatches.push(`Answer key Q${n} has no matching question`);
    }
  }
  return { matched, mismatches };
}
