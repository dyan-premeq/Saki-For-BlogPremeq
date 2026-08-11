// Compiles .design-sync/ds-styles.css -> .design-sync/.cache/ds.css using the
// Tailwind CLI staged in .ds-sync/node_modules (pinned to the same Tailwind
// version the repo builds with). cfg.cssEntry points at the output.
//
// Run before package-build.mjs:  node .design-sync/build-css.mjs

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..');

const outDir = join(HERE, '.cache');
const output = join(outDir, 'ds.css');
const cli = join(REPO, '.ds-sync', 'node_modules', '@tailwindcss', 'cli', 'dist', 'index.mjs');

if (!existsSync(cli)) {
  console.error(`[CSS_BUILD] Tailwind CLI not found at ${cli}`);
  console.error('  Stage the converter deps first (see .design-sync/NOTES.md).');
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

// Two compiles, concatenated — NOT one. typography.css's `@reference
// "./global.css"` suppresses global.css's @theme variables whenever the two
// are compiled together, which silently breaks every .font-* role class.
// Compiling them apart mirrors how the site itself ships them.
// --cwd pins Tailwind's automatic source detection to the repo root so it sees
// src/ and honours .gitignore, rather than rooting at .design-sync/.
function compile(entry, out) {
  const r = spawnSync(process.execPath, [cli, '-i', join(HERE, entry), '-o', out, '--cwd', REPO], {
    stdio: 'inherit',
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
  return readFileSync(out, 'utf8');
}

const base = compile('ds-styles.css', join(outDir, 'ds-base.css'));
const prose = compile('ds-prose.css', join(outDir, 'ds-prose.out.css'));

// Remote @import rules must stay at the very top of the concatenated file to
// remain valid CSS. The base output carries them; the prose output emits none
// (verified by the guard below).
if (/@import/.test(prose)) {
  console.error('[CSS_BUILD] ds-prose output unexpectedly contains @import — it would be invalid mid-file.');
  process.exit(1);
}

writeFileSync(output, `${base}\n/* ── typography.css (compiled separately, see ds-prose.css) ── */\n${prose}`);

// The failure this guards against is silent: the role classes still compile,
// they just point at variables nothing defines, and every design renders in a
// fallback font.
for (const v of ['--font-prose-latin', '--font-display-latin', '--font-quote-latin']) {
  if (!readFileSync(output, 'utf8').includes(`${v}:`)) {
    console.error(`[CSS_BUILD] ${v} is not defined in the output — the @reference suppression regressed.`);
    process.exit(1);
  }
}

console.error(`  ds.css: ${(statSync(output).size / 1024).toFixed(0)} KB -> ${output}`);
