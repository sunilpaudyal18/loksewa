import { normalizeOptionSeparators } from "./src/lib/parser/ocrCorrections.ts";
const text = `A) 8 bits B) 4 bits C) 2 bits D) 9 bits`;
console.log(normalizeOptionSeparators(text));
