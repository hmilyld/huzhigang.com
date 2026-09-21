/**
 * Minimal RSS 2.0 reader — enough for hmilyld.com/rss.xml.
 * Shared by the site (build time) and scripts/refresh-writing.mjs.
 */

/**
 * @typedef {object} RssItem
 * @property {string} title
 * @property {string} link
 * @property {string} date      YYYY-MM
 * @property {string} datetime  YYYY-MM-DD
 * @property {string} category  first category, or ''
 */

const ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

/**
 * @param {string} input
 * @returns {string}
 */
function decode(input) {
  return input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-z]+);/gi, (match, name) => ENTITIES[name.toLowerCase()] ?? match);
}

/**
 * @param {string} block
 * @param {string} name
 * @returns {string | null}
 */
function tag(block, name) {
  const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  return match ? decode(match[1]).trim() : null;
}

/**
 * @param {string | null} pubDate
 */
function toDate(pubDate) {
  const date = pubDate ? new Date(pubDate) : new Date(NaN);
  if (Number.isNaN(date.getTime())) return { date: '', datetime: '' };
  const iso = date.toISOString().slice(0, 10);
  return { date: iso.slice(0, 7), datetime: iso };
}

/**
 * @param {string} xml
 * @param {number} [limit]
 * @returns {RssItem[]}
 */
export function parseRssItems(xml, limit = 5) {
  const blocks = xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi) ?? [];
  /** @type {RssItem[]} */
  const items = [];

  for (const block of blocks) {
    const title = tag(block, 'title');
    const link = tag(block, 'link');
    if (!title || !link) continue;

    const categories = [...block.matchAll(/<category(?:\s[^>]*)?>([\s\S]*?)<\/category>/gi)].map(
      (match) => decode(match[1]).trim()
    );
    const { date, datetime } = toDate(tag(block, 'pubDate'));

    items.push({ title, link, date, datetime, category: categories[0] ?? '' });
    if (items.length >= limit) break;
  }

  return items;
}
