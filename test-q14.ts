import { parseQuestions } from "./src/lib/parser/questionParser.ts";

const rawText = `12. The capacity of 3.5 inch floppy disk 15
A) 1.40 MB 3) 1.44 GB C) 1.40 GB 0) 1.44 MB
13. WAN stands for
A) Wap Area Network 1) Wide Area Network
(0) Wide Array Net 1) Wireless Area Network
14, MICR stands for ;
A) Magnetic Ink Character Render 9) Magnetic Ink Code Reader
0) Magnetic Ink Cases Reader 0) None
15, EBCDIC stands for
A) Extended Binary ( ‘oded Decimal Interchange Code
13) Extended Bit Code Decimal Interchange Code
(0) Extended Bit Case Decimal Interchange Code
0) Extended Binary Case Decimal Interchange Code
16. Which of the following is a part of the Central Processing Unit?
A) Printer B) Key board
(') Mouse D) Arithmetic & Logic unit`;

const result = parseQuestions(rawText);
console.log(JSON.stringify(result.questions, null, 2));
