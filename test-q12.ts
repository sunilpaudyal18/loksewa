import { parseQuestions } from "./src/lib/parser/questionParser.ts";

const rawText = `12. The capacity of 3.5 inch floppy disk 15
A) 1.40 MB 3) 1.44 GB C) 1.40 GB 0) 1.44 MB`;

const result = parseQuestions(rawText);
console.log(JSON.stringify(result.questions, null, 2));
