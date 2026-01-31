const fs = require('fs');
const s = fs.readFileSync('src/app/subscription/page.js', 'utf8');
const map = {'(': ')', '{': '}', '[': ']'};
const stack = [];
for (let i = 0; i < s.length; i++) {
  const c = s[i];
  if (c === '/' && s[i+1] === '*') { i = s.indexOf('*/', i+2); if (i < 0) { console.log('Unterminated block comment'); process.exit(1); } continue; }
  if (c === '/' && s[i+1] === '/') { i = s.indexOf('\n', i+2); if (i < 0) break; continue; }
  if (map[c]) stack.push({open:c,pos:i});
  else if (Object.values(map).includes(c)) {
    const last = stack.pop();
    if (!last || map[last.open] !== c) { console.log(`Mismatched ${last?last.open:'?'} at ${i} expecting ${map[last.open]}`); process.exit(1); }
  }
}
if (stack.length) { console.log('STACK LENGTH', stack.length); stack.slice(-5).forEach(s => { console.log('UNMATCHED', s.open, 'pos', s.pos, 'context', JSON.stringify(fs.readFileSync('src/app/subscription/page.js','utf8').slice(s.pos-20,s.pos+20))); }); process.exit(1); }
console.log('OK');
