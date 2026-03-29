const fs = require('fs');

let index = fs.readFileSync('index.html', 'utf8');
const spec  = fs.readFileSync('spec.html',  'utf8');

// ── 1. Extract spec section content from spec.html ───────────────────────
const specDivStart = spec.indexOf('<div id="spec">');
const bodyClose    = spec.lastIndexOf('</body>');
let specContent    = spec.slice(specDivStart, bodyClose).trimEnd();

// Fix the spec div to have spec-hidden class
specContent = specContent.replace('<div id="spec">', '<div id="spec" class="spec-hidden">');

// Remove the spec-cta div at the bottom (the "index.html#pricing" back button)
// Replace it with an inline-scroll version
specContent = specContent.replace(
  /<div class="spec-cta"[^>]*>[\s\S]*?<\/div>/,
  '<div class="spec-cta" style="text-align:center; margin-top:32px;">' +
  '<button onclick="document.getElementById(\'pricing\').scrollIntoView({behavior:\'smooth\'});revealPricing();" class="cta-big-btn">← לבחירת חבילה ואישור ההצעה</button>' +
  '</div>'
);

// Also fix the inner "לבחירת חבילה" link inside spec content
specContent = specContent.replace(
  '<a href="#pricing" class="cta-big-btn">לבחירת חבילה ← התחלת העבודה</a>',
  '<button onclick="document.getElementById(\'pricing\').scrollIntoView({behavior:\'smooth\'});revealPricing();" class="cta-big-btn">לבחירת חבילה ← התחלת העבודה</button>'
);

console.log('Spec content length:', specContent.length);
console.log('Has spec-hidden:', specContent.includes('spec-hidden'));

// ── 2. Fix the CTA button in index.html (spec.html → reveal+scroll) ──────
index = index.replace(
  '<a href="spec.html" class="cta-big-btn">לאפיון הטכני המלא ←</a>',
  '<button onclick="document.getElementById(\'spec\').classList.remove(\'spec-hidden\');document.getElementById(\'spec\').scrollIntoView({behavior:\'smooth\'});" class="cta-big-btn">לאפיון הטכני המלא ←</button>'
);

// Also fix the TOC link if it doesn't point to #spec already (it does, keep it)

// ── 3. Insert spec section before the pricing-hidden divider ─────────────
const insertionPoint = index.indexOf('  <!-- ════ DIVIDER ════ -->');
if (insertionPoint === -1) {
  console.error('ERROR: could not find DIVIDER comment');
  process.exit(1);
}

console.log('Insertion point:', insertionPoint);

index = index.slice(0, insertionPoint) +
  '\r\n' + specContent + '\r\n\r\n  ' +
  index.slice(insertionPoint);

// ── 4. Fix any remaining index.html#pricing links in the file ────────────
index = index.replace(/href="index\.html#pricing"/g, 'href="#pricing"');

// ── 5. Write result ───────────────────────────────────────────────────────
fs.writeFileSync('index.html', index, 'utf8');
console.log('index.html merged, total length:', index.length);
console.log('Has spec section:', index.includes('id="spec"'));
console.log('Has spec-hidden class on spec div:', index.includes('id="spec" class="spec-hidden"'));
console.log('Has pricing-hidden:', index.includes('pricing-hidden'));
