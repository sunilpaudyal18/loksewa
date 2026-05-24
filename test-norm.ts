import { normalizeOptionSeparators } from "./src/lib/parser/ocrCorrections.ts";

const block = `A) 1.40 MB 3) 1.44 GB C) 1.40 GB 0) 1.44 MB`;
console.log(normalizeOptionSeparators(block));
