const optionContent = `9 bits
95. SMPS stands for
A) Switched`;

const NEW_Q_IN_OPTION_RE = /(?:\n|^)[|;:\\\u0964\-\s'"]{0,5}(?:Q\.?\s*)?\(?([0-9]{1,3})\)?\s*[.):]\s*\S/;

const match = optionContent.match(NEW_Q_IN_OPTION_RE);
if (match) {
  console.log("Matched at index:", match.index);
  console.log("Match text:", match[0]);
  const truncated = optionContent.slice(0, match.index).trim();
  console.log("Truncated:", truncated);
} else {
  console.log("No match");
}

const optionContent2 = `8 bits B) 4 bits`;
const match2 = optionContent2.match(NEW_Q_IN_OPTION_RE);
if (match2) {
  console.log("Match 2!", match2[0]);
} else {
  console.log("No match 2");
}
