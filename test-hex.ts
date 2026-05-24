import { runOcr } from "./src/lib/ocr/tesseract.ts";
import { parseAnswerKey } from "./src/lib/parser/answerKeyParser.ts";
import fs from "fs";

async function main() {
  const aBuf = fs.readFileSync("./public/test/ans1.jpeg");
  const aResult = await runOcr(aBuf, "answers");
  
  const text = aResult.text;
  for (const line of text.split("\n")) {
    if (line.includes("41")) {
      console.log("Found line:", line);
      for (let i = 0; i < line.length; i++) {
        console.log(line[i], line.charCodeAt(i).toString(16));
      }
    }
  }
}
main();
