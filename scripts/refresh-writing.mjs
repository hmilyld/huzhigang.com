#!/usr/bin/env node
/**
 * Refresh src/data/writing-fallback.json from the blog feed.
 *
 *   pnpm writing:refresh                      fetch https://hmilyld.com/rss.xml
 *   pnpm writing:refresh --from feed.xml      use a local copy instead
 *
 * The site reads this snapshot only when the build-time fetch fails.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parseRssItems } from '../src/lib/rss.js';

const FEED = 'https://hmilyld.com/rss.xml';
const LIMIT = 12;
const OUT = fileURLToPath(new URL('../src/data/writing-fallback.json', import.meta.url));

const fromIndex = process.argv.indexOf('--from');
const localFile = fromIndex !== -1 ? process.argv[fromIndex + 1] : null;

async function loadXml() {
  if (localFile) {
    console.log(`reading ${localFile}`);
    return readFile(localFile, 'utf8');
  }
  console.log(`fetching ${FEED}`);
  const response = await fetch(FEED, { redirect: 'follow' });
  if (!response.ok) throw new Error(`feed responded ${response.status}`);
  return response.text();
}

const xml = await loadXml();
const posts = parseRssItems(xml, LIMIT);

if (posts.length === 0) {
  console.error('no items parsed — snapshot left untouched');
  process.exit(1);
}

await writeFile(OUT, `${JSON.stringify(posts, null, 2)}\n`, 'utf8');
console.log(`wrote ${posts.length} posts to src/data/writing-fallback.json`);
for (const post of posts) console.log(`  ${post.date}  ${post.title}`);
