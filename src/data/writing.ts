import { parseRssItems } from '../lib/rss.js';
import snapshot from './writing-fallback.json';

export interface Post {
  title: string;
  link: string;
  date: string;
  datetime: string;
  category: string;
}

// www.hmilyld.com serves the feed directly; the bare domain 307-redirects to it,
// and that redirect carries no CORS header — which browsers reject on a
// cross-origin fetch. So the client (and the build) read the www host.
export const FEED = 'https://www.hmilyld.com/rss.xml';
export const LIMIT = 5;
const TIMEOUT_MS = 8000;

export interface Writing {
  posts: Post[];
  source: 'rss' | 'snapshot';
}

/**
 * Pull the latest posts at build time. If the blog is unreachable or slow,
 * fall back to the committed snapshot so a build never fails.
 */
export async function getWriting(): Promise<Writing> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const response = await fetch(FEED, { signal: controller.signal, redirect: 'follow' });
    clearTimeout(timer);

    if (!response.ok) throw new Error(`feed responded ${response.status}`);

    const posts = parseRssItems(await response.text(), LIMIT) as Post[];
    if (posts.length === 0) throw new Error('feed had no items');

    return { posts, source: 'rss' };
  } catch {
    return { posts: (snapshot as Post[]).slice(0, LIMIT), source: 'snapshot' };
  }
}
