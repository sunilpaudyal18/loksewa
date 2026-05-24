import { readFile } from "fs/promises";
import path from "path";
import { runOcr } from "./src/lib/ocr/tesseract";
import { parseQuestions, matchAnswers } from "./src/lib/parser/questionParser";
import { parseAnswerKey } from "./src/lib/parser/answerKeyParser";

async function run() {
  const jobDir = path.join(process.cwd(), "tmp", "uploads", "2725e6fd-d2ca-48ba-9133-d010dfe2d009");
  console.log("Loading images from", jobDir);

  const qBuf = await readFile(path.join(jobDir, "q_0.blob"));
  const aBuf = await readFile(path.join(jobDir, "answerkey.blob"));

  console.log("Running OCR on Question Image...");
  const qOcr = await runOcr(qBuf, "questions");
  console.log("=== RAW QUESTION OCR ===");
  console.log(qOcr.text.substring(0, 500) + "...");
  
  console.log("\nParsing Questions...");
  const qParsed = parseQuestions(qOcr.text);
  console.log("Parsed Questions Count:", qParsed.questions.length);
  console.log("Parsed Questions Preview:", JSON.stringify(qParsed.questions.slice(0, 3), null, 2));

  console.log("\nRunning OCR on Answer Key Image...");
  const aOcr = await runOcr(aBuf, "answers");
  console.log("=== RAW ANSWER KEY OCR ===");
  console.log(aOcr.text.substring(0, 500) + "...");

  console.log("\nParsing Answer Key...");
  const aParsed = parseAnswerKey(aOcr.text);
  console.log("Parsed Answers Count:", aParsed.totalParsed);
  console.log("Parsed Answers Preview:", Object.entries(aParsed.answers).slice(0, 10));

  console.log("\nMatching...");
  const matched = matchAnswers(qParsed.questions, aParsed.answers);
  console.log("Matched count:", matched.matched.filter(q => q.answer).length);
  console.log("Mismatches:", matched.mismatches.slice(0, 5));
}

run().catch(console.error);
