import fs from 'fs';

const code = fs.readFileSync('client/src/pages/CreateListing.jsx', 'utf8');

let stack = [];
for (let i = 0; i < code.length; i++) {
  const char = code[i];
  if (char === '{') {
    stack.push({ char, index: i, line: code.substring(0, i).split('\n').length });
  } else if (char === '}') {
    if (stack.length === 0) {
      console.log(`Extra } found at line ${code.substring(0, i).split('\n').length}`);
    } else {
      stack.pop();
    }
  }
}

if (stack.length > 0) {
  console.log(`Unmatched { found at lines: ${stack.map(s => s.line).join(', ')}`);
} else {
  console.log('Braces are balanced.');
}

