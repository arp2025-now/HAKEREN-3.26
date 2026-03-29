const fs = require('fs');

// Read both files
let index = fs.readFileSync('index.html', 'utf8');
let spec  = fs.readFileSync('spec.html',  'utf8');

// ── 1. Extract full password gate block from index.html ────────────────────
const gateStart = index.indexOf('<!-- ═══════════════ PASSWORD GATE');
const pageDiv   = index.indexOf('<div class="page">');
const scriptEnd = index.lastIndexOf('</script>', pageDiv);
const gateBlock = index.slice(gateStart, scriptEnd + 9);

console.log('Gate block length:', gateBlock.length);
console.log('Gate block start:', gateBlock.slice(0, 80));
console.log('Gate block end:',   gateBlock.slice(-80));

if (gateBlock.length < 100) {
  console.error('ERROR: gate block too short, aborting');
  process.exit(1);
}

// ── 2. Rebuild spec.html body with full gate block ─────────────────────────
// Find where <body> ends
const bodyTagEnd    = spec.indexOf('>', spec.indexOf('<body'));
const specBodyStart = bodyTagEnd + 1;

// Keep spec content from first <div class="content" or <div id="spec"
let contentDivPos = spec.indexOf('\n<div class="content"', specBodyStart);
if (contentDivPos === -1) contentDivPos = spec.indexOf('<div class="content"', specBodyStart);
if (contentDivPos === -1) contentDivPos = spec.indexOf('<div id="spec"', specBodyStart);

console.log('contentDivPos:', contentDivPos);

const specContent = spec.slice(contentDivPos);

const newBody = '\r\n\r\n' + gateBlock + '\r\n\r\n' + specContent;

spec = spec.slice(0, specBodyStart) + newBody;

// ── 3. Remove spec-hidden class from spec div ─────────────────────────────
spec = spec.replace(/<div id="spec" class="spec-hidden">/g, '<div id="spec">');
spec = spec.replace(/ class="spec-hidden"/g, '');

// ── 4. Make sure sessionStorage is set in checkPassword ──────────────────
if (spec.indexOf("sessionStorage.setItem('hakeren_auth'") === -1) {
  spec = spec.replace(
    "_visitStart = Date.now();",
    "_visitStart = Date.now();\r\n    sessionStorage.setItem('hakeren_auth', '1');"
  );
}

fs.writeFileSync('spec.html', spec, 'utf8');
console.log('spec.html fixed, length:', spec.length);
