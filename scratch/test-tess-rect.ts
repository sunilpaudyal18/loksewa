import Tesseract from "tesseract.js";
import fs from "fs";

async function main() {
  const buf = fs.readFileSync("./public/test/q6.jpeg");
  const worker = await Tesseract.createWorker("eng");
  const { data } = await worker.recognize(buf, {
    rectangle: { top: 0, left: 0, width: 500, height: 100 }
  });
  console.log("Extracted text:", data.text);
  await worker.terminate();
}
main().catch(console.error);
