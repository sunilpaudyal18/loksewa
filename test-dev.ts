import { normalizeText, normalizeOptionSeparators } from "./src/lib/parser/ocrCorrections.ts";

const rawText = "3. Who is the father of Computer?\nA) Allen Turing B) Charles Babbage ८) Simur Cray D) Augusta Adaming";
console.log("Raw text:");
console.log(rawText);
console.log("Normalized text:");
const n1 = normalizeText(rawText);
console.log(n1);
console.log("With option separators:");
console.log(normalizeOptionSeparators(n1));
