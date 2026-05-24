const OPTION_BOUNDARY_RE = /\b([ABCDabcd])\)\s*/g;
const block = `94. 1 Byte =?
A) 8 bits B) 4 bits C) 2 bits D) 9 bits`;

OPTION_BOUNDARY_RE.lastIndex = 0;
let m;
while ((m = OPTION_BOUNDARY_RE.exec(block)) !== null) {
  console.log("MATCH", m[1], m.index);
}
