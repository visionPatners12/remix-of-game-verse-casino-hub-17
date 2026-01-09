import fs from 'fs';

const args = process.argv.slice(2);
let tsv = null;
let aggressive = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--tsv') { tsv = args[++i]; }
  else if (args[i] === '--aggressive') { aggressive = true; }
}

if (!tsv) {
  console.error("Usage: node remove-unused-exports.mjs --tsv <exports.tsv> [--aggressive]");
  process.exit(2);
}

// RegEx helpers
const makeDeclRegex = (sym) =>
  new RegExp(String.raw`(^|\n)(\s*)export\s+(?:async\s+)?(const|let|var|function|class|type|interface|enum)\s+${sym}\b`, 'g');

const makeExportAllLineRegex = (sym) =>
  new RegExp(String.raw`(^|\n)(\s*)export\s*{\s*([^}]*)\s*}\s*(?:from\s*['"][^'"]+['"])?\s*;?`, 'g');

const removeFromNamedExportList = (listText, sym) => {
  // split by comma, handle aliases "A as B"
  const items = listText.split(',').map(s => s.trim()).filter(Boolean);
  const filtered = items.filter(item => {
    const [left, maybeAs, right] = item.split(/\s+as\s+/i);
    const base = left?.trim();
    const alias = right?.trim();
    return base !== sym && alias !== sym;
  });
  return filtered.join(', ');
};

const processFile = (filePath, symbols, aggressive) => {
  if (!fs.existsSync(filePath)) return {file:filePath, ok:false, reason:'missing'};
  let src = fs.readFileSync(filePath, 'utf8');
  let orig = src;

  // Pass 1: transform "export { ... }" lists
  src = src.replace(makeExportAllLineRegex('SYM'), (full, nl, indent, inside) => {
    // we need to remove any symbol in 'symbols' from 'inside'
    let updated = inside;
    for (const sym of symbols) {
      updated = removeFromNamedExportList(updated, sym);
    }
    if (updated.trim().length === 0) {
      // remove whole line
      return '';
    }
    return `${nl}${indent}export { ${updated} };`;
  });

  // Pass 2: declarations "export const|function|class|type|interface|enum <sym>"
  for (const sym of symbols) {
    const re = makeDeclRegex(sym);
    src = src.replace(re, (_m, nl, indent, kind) => {
      if (aggressive) {
        // remove the whole declaration line (riskier). Fallback: just unexport.
        // Try to nuke the line up to newline.
        const lineRe = new RegExp(String.raw`(^|\n)[^\n]*\b${sym}\b[^\n]*\n?`);
        let before = src;
        src = src.replace(lineRe, '\n');
        if (before === src) {
          // If couldn't safely delete, just unexport
          return `${nl}${indent}${kind} ${sym}`;
        } else {
          return ''; // already replaced by lineRe
        }
      } else {
        // SAFE: only remove the 'export ' keyword
        return `${nl}${indent}${kind} ${sym}`;
      }
    });
  }

  const changed = src !== orig;
  if (changed) fs.writeFileSync(filePath, src, 'utf8');
  return {file:filePath, ok:true, changed};
};

const lines = fs.readFileSync(tsv, 'utf8').split(/\r?\n/).filter(Boolean);
const byFile = new Map();
for (const line of lines) {
  const [file, sym] = line.split('\t');
  if (!file || !sym) continue;
  if (!byFile.has(file)) byFile.set(file, new Set());
  byFile.get(file).add(sym);
}

let changedCount = 0, fileCount = 0;
for (const [file, set] of byFile.entries()) {
  const res = processFile(file, Array.from(set), aggressive);
  if (res.ok && res.changed) changedCount++;
  if (res.ok) fileCount++;
}
console.log(`Processed ${fileCount} file(s). Changed: ${changedCount}. Aggressive=${aggressive}`);
