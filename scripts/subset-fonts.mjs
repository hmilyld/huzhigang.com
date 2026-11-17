#!/usr/bin/env node
/**
 * Subset the self-hosted CJK face down to the characters this site actually
 * renders.
 *
 *   pnpm fonts:subset
 *
 * Noto Sans SC ships as 101 unicode-range slices (~4.6 MB). A page only ever
 * pulls the slices its text touches, but that still measured ~1 MB here for a
 * single page of prose. This script keeps the same slice structure — so the
 * browser still only downloads what a given page needs — and cuts every slice
 * down to the characters found in `src/` plus the writing snapshot.
 *
 * Outputs `public/fonts/*.woff2` and `src/styles/fonts.css`. Re-run it after
 * adding copy, or after `pnpm writing:refresh`.
 */
import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import subsetFont from 'subset-font';

const root = fileURLToPath(new URL('..', import.meta.url));
const SRC = path.join(root, 'src');
const OUT_FONTS = path.join(root, 'public', 'fonts');
const OUT_CSS = path.join(SRC, 'styles', 'fonts.css');
const SOURCE_CSS = path.join(
  root,
  'node_modules/@fontsource-variable/noto-sans-sc/wght.css'
);
const SOURCE_DIR = path.dirname(SOURCE_CSS);
const FAMILY = 'Noto Sans SC Variable';

/** Weights the design actually uses (body 400, headings 600/700). */
const WEIGHTS = { min: 400, max: 700 };

/** Always keep printable ASCII and CJK punctuation, whatever the copy says. */
const SAFETY = [
  ...Array.from({ length: 0x7e - 0x20 + 1 }, (_, i) => String.fromCharCode(0x20 + i)),
  '　、。〈〉《》「」『』【】〔〕〖〗・…‥—–‘’“”※→←↑↓×÷°·℃±',
].join('');

const TEXT_EXTENSIONS = new Set(['.astro', '.ts', '.js', '.mjs', '.json', '.md', '.css']);

/** @param {string} dir */
async function collectFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await collectFiles(full)));
    else if (TEXT_EXTENSIONS.has(path.extname(entry.name))) files.push(full);
  }
  return files;
}

/** Every character the site can render at build time. */
async function collectCharset() {
  const chars = new Set(SAFETY);
  for (const file of await collectFiles(SRC)) {
    const text = await readFile(file, 'utf8');
    // Comments and code never reach the page; keeping them would pull in
    // box-drawing and punctuation glyphs the reader will never see.
    const visible = text
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/^\s*\/\/.*$/gm, ' ')
      .replace(/(^|\s)\/\/\s.*$/gm, '$1');
    for (const char of visible) chars.add(char);
  }
  // Strip control characters that would only bloat the subset.
  for (const char of [...chars]) {
    if (char.codePointAt(0) < 0x20) chars.delete(char);
  }
  return chars;
}

/** @param {string} css */
function parseFaces(css) {
  const faces = [];
  for (const [, body] of css.matchAll(/@font-face\s*\{([\s\S]*?)\}/g)) {
    const file = body.match(/url\(\.\/files\/([^)]+)\)/)?.[1];
    const range = body.match(/unicode-range:\s*([^;}]+)/)?.[1]?.trim();
    if (file && range) faces.push({ file, range });
  }
  return faces;
}

/** @param {string} range */
function parseRanges(range) {
  const ranges = [];
  for (const part of range.split(',')) {
    const token = part.trim().replace(/^U\+/i, '');
    if (!token || token.includes('?')) continue;
    const [start, end] = token.split('-');
    const low = Number.parseInt(start, 16);
    const high = end ? Number.parseInt(end, 16) : low;
    if (Number.isFinite(low) && Number.isFinite(high)) ranges.push([low, high]);
  }
  return ranges;
}

/** @param {number} code */
function isAscii(code) {
  return code < 0x80;
}

/**
 * Build a compact `unicode-range` from the characters a slice actually keeps,
 * so the browser never downloads a slice for a character it no longer has.
 * @param {string[]} chars
 */
function toUnicodeRange(chars) {
  const codes = [...new Set(chars.map((char) => char.codePointAt(0) ?? 0))].sort((a, b) => a - b);
  const spans = [];
  for (const code of codes) {
    const last = spans[spans.length - 1];
    if (last && code === last[1] + 1) last[1] = code;
    else spans.push([code, code]);
  }
  return spans
    .map(([low, high]) => {
      const start = `U+${low.toString(16).toUpperCase()}`;
      return low === high ? start : `${start}-${high.toString(16).toUpperCase()}`;
    })
    .join(',');
}

const charset = await collectCharset();
const sourceCss = await readFile(SOURCE_CSS, 'utf8');
const faces = parseFaces(sourceCss);

if (faces.length === 0) {
  console.error('no @font-face slices found in', SOURCE_CSS);
  process.exit(1);
}

await rm(OUT_FONTS, { recursive: true, force: true });
await mkdir(OUT_FONTS, { recursive: true });

const rules = [];
let total = 0;
let kept = 0;

for (const { file, range } of faces) {
  const ranges = parseRanges(range);
  if (ranges.length === 0) continue;

  // The dedicated Latin slice owns ASCII; the numbered CJK slices only
  // incidentally claim a stray character or two (`$`, `N`, `>`) and should not
  // duplicate the Latin glyphs.
  const ownsAscii = file.includes('latin');
  const slice = [...charset].filter((char) => {
    const code = char.codePointAt(0) ?? 0;
    if (!ownsAscii && isAscii(code)) return false;
    return ranges.some(([low, high]) => code >= low && code <= high);
  });
  if (slice.length === 0) continue;

  const input = await readFile(path.join(SOURCE_DIR, 'files', file));
  const output = await subsetFont(input, slice.join(''), {
    targetFormat: 'woff2',
    variationAxes: { wght: WEIGHTS },
  });

  const name = file.replace(/-wght-normal\.woff2$/, '.woff2');
  await writeFile(path.join(OUT_FONTS, name), output);

  total += output.length;
  kept += slice.length;

  rules.push(
    [
      '@font-face {',
      `  font-family: "${FAMILY}";`,
      '  font-style: normal;',
      '  font-display: swap;',
      `  font-weight: ${WEIGHTS.min} ${WEIGHTS.max};`,
      `  src: url("/fonts/${name}") format("woff2");`,
      `  unicode-range: ${toUnicodeRange(slice)};`,
      '}',
    ].join('\n')
  );
}

if (rules.length === 0) {
  console.error('nothing to subset — charset did not intersect any slice');
  process.exit(1);
}

const header = [
  '/* Generated by scripts/subset-fonts.mjs — do not edit by hand. */',
  `/* ${rules.length} slices, ${kept} characters, ${Math.round(total / 1024)} KB total. */`,
  '',
].join('\n');

await writeFile(OUT_CSS, `${header}${rules.join('\n\n')}\n`, 'utf8');

console.log(
  `wrote ${rules.length} slices (${kept} chars, ${Math.round(total / 1024)} KB) -> public/fonts + src/styles/fonts.css`
);
