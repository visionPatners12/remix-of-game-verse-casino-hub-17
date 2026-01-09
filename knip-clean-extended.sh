#!/usr/bin/env bash
# Knip Purge All — fichiers, deps, exports, types
# Modes:
#   --dry-run     : ne supprime rien, écrit un log de ce qu'il ferait
#   --only-ts     : ne supprime que les fichiers .ts/.tsx
#   --aggressive  : essaie de supprimer les déclarations d'export (au lieu de seulement "unexport")
set -euo pipefail

ONLY_TS=false
DRY_RUN=false
AGGRESSIVE=false
LOG="knip-purge-$(date +%Y%m%d-%H%M%S).txt"

for arg in "$@"; do
  case "$arg" in
    --only-ts) ONLY_TS=true ;;
    --dry-run) DRY_RUN=true ;;
    --aggressive) AGGRESSIVE=true ;;
    *.txt) LOG="$arg" ;;
    *) echo "Option inconnue: $arg" >&2; exit 2 ;;
  esac
done

need() { command -v "$1" >/dev/null 2>&1 || { echo "❌ '$1' requis."; exit 1; }; }
need jq
need node
need npm
[ -f package.json ] || { echo "❌ package.json introuvable (lance depuis la racine)."; exit 1; }

: > "$LOG"
TMP_REPORT="$(mktemp)"
TMP_ERR="$(mktemp)"
TMP_EXPORTS_TSV="$(mktemp)"
TMP_FILES_LIST="$(mktemp)"
TMP_DEPS_LIST="$(mktemp)"
TMP_DEVDEPS_LIST="$(mktemp)"

echo "▶️  Exécution Knip (reporter=json)…"
set +e
npx -y knip@latest --reporter=json >"$TMP_REPORT" 2>"$TMP_ERR"
KNIP_CODE=$?
set -e
if [ "$KNIP_CODE" -ne 0 ] && [ "$KNIP_CODE" -ne 1 ]; then
  echo "❌ Knip a échoué (code $KNIP_CODE)" | tee -a "$LOG"
  sed -n '1,200p' "$TMP_ERR" | tee -a "$LOG"
  exit "$KNIP_CODE"
fi
if ! jq -e . >/dev/null 2>&1 <"$TMP_REPORT"; then
  echo "❌ Sortie Knip non-JSON" | tee -a "$LOG"
  sed -n '1,200p' "$TMP_ERR" | tee -a "$LOG"
  exit 1
fi

echo "===== KNIP PURGE REPORT =====" >> "$LOG"
echo "Date: $(date)" >> "$LOG"
echo >> "$LOG"

# 1) UNUSED FILES
if $ONLY_TS; then
  jq -r '.files[]? // empty' "$TMP_REPORT" | grep -E '\.tsx?$' || true > "$TMP_FILES_LIST"
else
  jq -r '.files[]? // empty' "$TMP_REPORT" > "$TMP_FILES_LIST" || true
fi
FILES_COUNT=$( [ -s "$TMP_FILES_LIST" ] && wc -l < "$TMP_FILES_LIST" | tr -d ' ' || echo 0 )
echo "### Unused files ($FILES_COUNT)" >> "$LOG"
if [ "$FILES_COUNT" -gt 0 ]; then cat "$TMP_FILES_LIST" >> "$LOG"; else echo "(none)" >> "$LOG"; fi
echo >> "$LOG"

# 2) UNUSED DEPS / DEVDEPS
jq -r '.issues[]? | .dependencies[]?.name // empty' "$TMP_REPORT" | sort -u > "$TMP_DEPS_LIST" || true
jq -r '.issues[]? | .devDependencies[]?.name // empty' "$TMP_REPORT" | sort -u > "$TMP_DEVDEPS_LIST" || true
CNT_DEPS=$( [ -s "$TMP_DEPS_LIST" ] && wc -l < "$TMP_DEPS_LIST" | tr -d ' ' || echo 0 )
CNT_DEVDEPS=$( [ -s "$TMP_DEVDEPS_LIST" ] && wc -l < "$TMP_DEVDEPS_LIST" | tr -d ' ' || echo 0 )
echo "### Unused dependencies ($CNT_DEPS)" >> "$LOG"
if [ "$CNT_DEPS" -gt 0 ]; then cat "$TMP_DEPS_LIST" >> "$LOG"; else echo "(none)" >> "$LOG"; fi
echo >> "$LOG"
echo "### Unused devDependencies ($CNT_DEVDEPS)" >> "$LOG"
if [ "$CNT_DEVDEPS" -gt 0 ]; then cat "$TMP_DEVDEPS_LIST" >> "$LOG"; else echo "(none)" >> "$LOG"; fi
echo >> "$LOG"

# 3) UNUSED EXPORTS / TYPES -> TSV <file>\t<symbol>
jq -r '
  .issues[]? |
  select(.exports or .types) |
  ( .exports[]? | [ .file, ( .symbol // .name // "<?>")] | @tsv ),
  ( .types[]?   | [ .file, ( .symbol // .name // "<?>")] | @tsv )
' "$TMP_REPORT" 2>/dev/null | sed '/^\s*$/d' | sort -u > "$TMP_EXPORTS_TSV" || true
EXP_COUNT=$( [ -s "$TMP_EXPORTS_TSV" ] && wc -l < "$TMP_EXPORTS_TSV" | tr -d ' ' || echo 0 )
echo "### Unused exports & exported types ($EXP_COUNT)" >> "$LOG"
if [ "$EXP_COUNT" -gt 0 ]; then cat "$TMP_EXPORTS_TSV" >> "$LOG"; else echo "(none)" >> "$LOG"; fi
echo >> "$LOG"

if $DRY_RUN; then
  echo "📝 Mode --dry-run : aucune modification effectuée. Rapport dans $LOG"
  exit 0
fi

# 4) SUPPRIMER FICHIERS
if [ "$FILES_COUNT" -gt 0 ]; then
  echo "🗑️  Suppression des fichiers inutilisés…"
  xargs -r rm -f < "$TMP_FILES_LIST"
fi

# 5) SUPPRIMER DEPS SANS ERESOLVE (éditer package.json + prune)
if [ "$CNT_DEPS" -gt 0 ] || [ "$CNT_DEVDEPS" -gt 0 ]; then
  echo "🧹 Nettoyage package.json (deps/devDeps inutilisées)…"
  cp package.json package.json.bak
  JQ_FILTER='
    ( .dependencies     // {} ) as $d
  | ( .devDependencies  // {} ) as $dd
  | .dependencies    = $d
  | .devDependencies = $dd
  '
  # Construire filtre pour deps
  if [ "$CNT_DEPS" -gt 0 ]; then
    while IFS= read -r dep; do
      [ -n "$dep" ] && JQ_FILTER="$JQ_FILTER | if .dependencies then .dependencies |= del(.\"$dep\") else . end"
    done < "$TMP_DEPS_LIST"
  fi
  # Construire filtre pour devDeps
  if [ "$CNT_DEVDEPS" -gt 0 ]; then
    while IFS= read -r dep; do
      [ -n "$dep" ] && JQ_FILTER="$JQ_FILTER | if .devDependencies then .devDependencies |= del(.\"$dep\") else . end"
    done < "$TMP_DEVDEPS_LIST"
  fi
  jq "$JQ_FILTER" package.json > package.json.__tmp && mv package.json.__tmp package.json
  echo "📦 npm prune"
  npm prune >> "$LOG" 2>&1 || true
  echo "✅ package.json nettoyé (backup: package.json.bak)"
fi

# 6) MODIFIER LE CODE POUR (DÉ)SUPPRIMER LES EXPORTS
#    - Par défaut: "unexport" (on retire juste le mot-clé export)
#    - --aggressive: tente de supprimer les déclarations, et de purger les "export { A, B }"
TOOLS_DIR=".tools"
mkdir -p "$TOOLS_DIR"
REMOVER="$TOOLS_DIR/remove-unused-exports.mjs"
cat > "$REMOVER" <<'NODE'
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
NODE

NODE_ARGS=( "--tsv" "$TMP_EXPORTS_TSV" )
$AGGRESSIVE && NODE_ARGS+=( "--aggressive" )

if [ "$EXP_COUNT" -gt 0 ]; then
  echo "✏️  Modification des fichiers pour traiter les exports inutilisés… (aggressive=$AGGRESSIVE)"
  node "$REMOVER" "${NODE_ARGS[@]}" | tee -a "$LOG"
else
  echo "✏️  Aucun export/type à traiter."
fi

# 7) Petits nettoyages de cache (non bloquant)
rm -rf node_modules/.cache 2>/dev/null || true

echo
echo "✅ Terminé. Rapport complet: $LOG"
