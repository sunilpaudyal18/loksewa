import { parseQuestions } from "./src/lib/parser/questionParser.ts";
const raw = "3. Who is the father of Computer?\nA) Allen Turing B) Charles Babbage ८) Simur Cray D) Augusta Adaming";
const parsed = parseQuestions(raw);
console.log(JSON.stringify(parsed.questions, null, 2));
