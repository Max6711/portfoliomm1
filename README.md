# maximmakovskiy.com

Personal portfolio of Maxim Makovskiy — Integration & AI Solutions Engineer | Full-Stack.

A single static page. The HTML is generated **at build time** from one content file, so the
shipped site is plain HTML + CSS + ~2 KB of JS (theme toggle, mobile menu, copy-email).
No framework runs in the browser.

```
src/content.json   ← ALL text, numbers, projects, links (edit this)
src/render.js      ← turns content.json into HTML (build time only)
src/styles.css     ← design system, dark (default) + light theme
src/main.js        ← small client script
index.html         ← page shell (head + placeholders)
public/            ← served as-is from the site root
  Maxim_Makovskiy_CV.pdf      ← PLACEHOLDER — replace with the real CV
  og.png                      ← social preview image (1200×630)
  favicon.svg, apple-touch-icon.png, robots.txt, sitemap.xml
  images/projects/            ← project screenshots
```

## Run locally

Requires Node 18+.

```bash
npm install
npm run dev       # http://localhost:5173 — reloads when content.json changes
npm run build     # static site → dist/
npm run preview   # serve dist/ at http://localhost:4173
```

## Deploy

The repo is connected to Vercel: every push to `main` builds and deploys to maximmakovskiy.com.
Vercel settings: Framework **Vite**, build command `npm run build`, output directory `dist`.

Any static host works the same way — upload the contents of `dist/`.

## Updating content

Everything visible on the page is in `src/content.json` → `locales.en`:

- `person` — name, headline, one-liner, roles, contacts
- `proof` — the numbers strip
- `projects` — case studies (`open: true` expands one by default on desktop)
- `experience`, `skills`, `principles`, `education`, `freelance`
- `ui` — button labels and section titles

### Adding project screenshots

1. Put the image in `public/images/projects/` (WebP or JPG, ~1000–1600 px wide, blurred where needed).
2. Set the project's `media` in `content.json`:

```json
"media": {
  "light": "/images/projects/storely.webp",
  "dark": "/images/projects/storely.webp",
  "width": 1600,
  "height": 1000,
  "alt": "Storely inbox with an AI conversation",
  "caption": "Optional caption"
}
```

Use the same file for `light` and `dark` if there is only one version. `width`/`height` must be
the image's real pixel size (prevents layout shift). Set `media` to `null` to show no image.

### After changing content

- Update `<lastmod>` in `public/sitemap.xml`.
- If the name or headline changed, regenerate `public/og.png`.

## Hebrew version (planned)

The structure is ready for a right-to-left Hebrew page:

- Content is keyed by locale: add `locales.he` to `content.json` with `"lang": "he", "dir": "rtl"`
  and translated strings (same shape as `en`, including `ui`).
- CSS uses logical properties (`margin-inline`, `inset-inline-start`, …), so the layout mirrors
  automatically under `dir="rtl"`.
- Remaining step: render a second page (e.g. `/he/`) by calling `renderPage(template, content, 'he')`
  for a `he/index.html` entry in `vite.config.js`, add `hreflang` links and a language switch.

## Quality

Lighthouse (production build, mobile): Performance 100 · Accessibility 100 · Best Practices 96 ·
SEO 100. The 96 is only because Vercel Analytics' script 404s on localhost; it loads on Vercel.
