# huzhigang.com

Personal homepage for 胡志刚 (Hu Zhigang) — a fixed identity rail beside a scrolling
record of projects, writing and work history. Writing lives at
[hmilyld.com](https://hmilyld.com).

Built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com).
Static output, no client framework.

## Structure

```text
/
├── public/
│   ├── favicon.svg              # the 印 mark
│   └── fonts/                   # subset CJK slices (generated)
├── scripts/
│   ├── refresh-writing.mjs      # regenerate the RSS snapshot
│   └── subset-fonts.mjs         # cut the CJK face down to used glyphs
├── src/
│   ├── components/
│   │   ├── RailContent.astro    # rail body, shared by sidebar + drawer
│   │   ├── Seal.astro           # the 印 (朱红)
│   │   └── SiteRail.astro       # identity rail, mobile bar, drawer
│   ├── data/
│   │   ├── projects.ts          # hand-picked projects, roles, tech stack
│   │   ├── writing.ts           # build-time RSS fetch + client refresh source of truth
│   │   └── writing-fallback.json
│   ├── layouts/
│   │   └── Base.astro           # html shell, fonts, SEO, theme init
│   ├── lib/
│   │   └── rss.js               # minimal RSS 2.0 reader (shared)
│   ├── pages/
│   │   └── index.astro
│   └── styles/
│       ├── fonts.css            # generated @font-face slices
│       └── global.css           # tokens + layout
└── package.json
```

## Commands

| Command                 | Action                                          |
| :---------------------- | :---------------------------------------------- |
| `pnpm install`          | Install dependencies                            |
| `pnpm dev`              | Start dev server at `localhost:4321`            |
| `pnpm build`            | Build the static site to `./dist/`              |
| `pnpm preview`          | Preview the build locally                       |
| `pnpm writing:refresh`  | Refresh the RSS snapshot from the blog feed     |
| `pnpm fonts:subset`     | Re-cut the CJK font to the characters in `src/` |
## How it works

- **Layout** — a 1200px shell: a sticky rail, then a content pane with a metadata
  gutter that stays aligned down the page. The gutter drops inline below 1200px, and
  below 861px the rail becomes a native `<dialog>` drawer opened from the top bar.
- **Colour** — steel `#eeede9` and ink `#26282b`, with 朱红 `#b23a2e` as the only
  accent (seal, current nav item, active status). Tokens are declared once per scheme
  and resolved through `light-dark()`, so the page follows the system with no
  JavaScript; the 自动 / 浅色 / 深色 control only writes `<meta name="color-scheme">`,
  which CSS follows via `:has()`. Control borders use a dedicated token that clears
  3:1 (WCAG 1.4.11), and the pressed theme segment is solid ink-on-ground.
- **Writing** — `getWriting()` fetches the blog feed at build time and falls back to
  `writing-fallback.json` when the blog is unreachable, so a build never fails. The list
  is then refreshed from the same feed in the browser on every visit, so new posts appear
  without a rebuild. Run `pnpm writing:refresh` to update the snapshot. The feed is read
  from `www.hmilyld.com` because the bare domain 307-redirects without CORS headers.
- **Type** — self-hosted Overpass Variable (Latin) and a subset of Noto Sans SC
  Variable (CJK). The upstream CJK face is 4.6 MB across 101 unicode-range slices and
  cost ~810 KB for this page; `pnpm fonts:subset` keeps the slice structure but trims
  every slice to the characters in `src/`, which brings the page down to ~100 KB. Run it
  after adding copy. Note that the writing list is also refreshed from the live feed in
  the browser, so a brand-new post's title falls back to the system font until the
  subset is regenerated. `font-size-adjust: from-font` keeps the fallback from shifting
  layout during the swap. Columns align with `tabular-nums`, not a monospace face.
- **SEO** — per-page title/description/keywords plus `Person` JSON-LD.
