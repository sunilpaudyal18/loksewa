import { runOcr } from "./src/lib/ocr/tesseract.ts";
import { parseQuestions } from "./src/lib/parser/questionParser.ts";
import { parseAnswerKey } from "./src/lib/parser/answerKeyParser.ts";
import fs from "fs";

async function main() {
  // Test q6 as questions
  const qBuf = fs.readFileSync("./public/test/q6.jpeg");
  const qResult = await runOcr(qBuf, "questions");
  console.log("=== RAW OCR (q6) ===");
  console.log(qResult.text);
  console.log("\n=== PARSED QUESTIONS ===");
  const parsed = parseQuestions(qResult.text);
  console.log(JSON.stringify(parsed.questions, null, 2));
  if (parsed.warnings.length) {
    console.log("\nWARNINGS:", parsed.warnings);
  }

  // Test ans1 as answer key
  const aBuf = fs.readFileSync("./public/test/ans1.jpeg");
  const aResult = await runOcr(aBuf, "answers");
  console.log("\n=== RAW OCR (ans1) ===");
  console.log(aResult.text);
  const key = parseAnswerKey(aResult.text);
  console.log("\n=== PARSED ANSWER KEY ===");
  console.log(JSON.stringify(key, null, 2));
}

main().catch(console.error);
