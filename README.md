# huzhigang.com

Personal homepage for 胡志刚 (Hu Zhigang) — a single-screen name card that signs off toward the writing at [hmilyld.com](https://hmilyld.com).

Built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com). Static, no client framework.

## Structure

```text
/
├── public/
│   └── favicon.svg        # the red 印 mark
├── src/
│   ├── components/
│   │   └── Seal.astro     # the seal (白文, 胡)
│   ├── layouts/
│   │   └── Base.astro     # html shell, fonts, meta
│   ├── pages/
│   │   └── index.astro    # the card
│   └── styles/
│       └── global.css     # paper / ink / seal tokens
└── package.json
```

## Commands

| Command          | Action                                      |
| :--------------- | :------------------------------------------ |
| `pnpm install`   | Install dependencies                        |
| `pnpm dev`       | Start dev server at `localhost:4321`        |
| `pnpm build`     | Build the static site to `./dist/`          |
| `pnpm preview`   | Preview the build locally                   |

## Editing

- The one-line self-description lives in `src/pages/index.astro`.
- Typefaces are self-hosted: 霞鹜文楷 (Chinese) and Newsreader (Latin).
- Colors and type scale are defined as tokens under `@theme` in `src/styles/global.css`.
