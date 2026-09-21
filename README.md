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
│   └── favicon.svg              # the 印 mark
├── scripts/
│   └── refresh-writing.mjs      # regenerate the RSS snapshot
├── src/
│   ├── components/
│   │   ├── Seal.astro           # the 印 (朱红)
│   │   └── SiteRail.astro       # identity rail + scroll-spy nav
│   ├── data/
│   │   ├── projects.ts          # hand-picked projects, roles, tech stack
│   │   ├── writing.ts           # build-time RSS fetch with snapshot fallback
│   │   └── writing-fallback.json
│   ├── layouts/
│   │   └── Base.astro           # html shell, fonts, SEO, theme init
│   ├── lib/
│   │   └── rss.js               # minimal RSS 2.0 reader (shared)
│   ├── pages/
│   │   └── index.astro
│   └── styles/
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

## How it works

- **Layout** — a 1320px shell: a sticky rail, then a content pane with a metadata
  gutter that stays aligned down the page. The gutter drops inline below 1200px, and
  the rail becomes a top block below 860px.
- **Colour** — steel `#eeede9` and ink `#26282b`, with 朱红 `#b23a2e` as the only
  accent (seal, current nav item, active status). The theme control offers
  自动 / 浅色 / 深色; 自动 follows the system, and the choice is remembered.
- **Writing** — `getWriting()` fetches `hmilyld.com/rss.xml` at build time and falls
  back to `writing-fallback.json` when the blog is unreachable, so a build never fails.
  Run `pnpm writing:refresh` to update the snapshot.
- **Type** — self-hosted Overpass Variable (Latin) and Noto Sans SC Variable (CJK);
  columns align with `tabular-nums`, not a monospace face.
- **SEO** — per-page title/description/keywords plus `Person` JSON-LD.
