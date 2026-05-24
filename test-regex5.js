const text = `क
| 87. Examples of output devices are
A) Screen B) Printer C) Speaker D) All of these
| 88. Which of the following is also known as brain of computer
A) Control unit B) Central Processing unit
C) Arithmetic and language unit D) Monitor
| 89. IBM stands for
| A) Internal Business Management B) International Business Management
: C) International Business Machines D) Internal Business Machines
90. ............ translates and executes program at run time line by line छ
| A) Compiler B) Interpreter C) Linker D) Loader
। 91. ... ... ... 15 an OOP principle
| A) Structured programming B) Procedural programming
C) Inheritance D) Linking
99. Father of “C* programming language
A) Dennis Ritchie 5) Prof John Keenly C) Thomas Kurtz 0) Bill Gates`;

const QUESTION_START_RE_STRICT = /^[|;:\\\u0964\-\s'"]{0,5}(?:Q\.?\s*)?\(?([0-9]{1,3}|[०-९]{1,3})\)?\s*[.):]\s*\S/;

const lines = text.split('\n');
for (const line of lines) {
  if (QUESTION_START_RE_STRICT.test(line)) {
    console.log("MATCH:", line);
  } else {
    console.log("FAIL:", line);
  }
}
