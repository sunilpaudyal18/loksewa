import { runOcr } from "./src/lib/ocr/tesseract.ts";
import { normalizeText, normalizeOptionSeparators } from "./src/lib/parser/ocrCorrections.ts";
import fs from "fs";

async function main() {
  const qBuf = fs.readFileSync("./public/test/q6.jpeg");
  const qResult = await runOcr(qBuf, "questions");
  const lines = qResult.text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("Simur Cray")) {
      console.log("Raw line " + i + ":", lines[i]);
      const n1 = normalizeText(lines[i]);
      console.log("Normalized:", n1);
      console.log("Options:", normalizeOptionSeparators(n1));
    }
  }
}
main();
