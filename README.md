# Nitika Mummidivarapu — Personal Site

## Development

```bash
npm install
npm run dev       # dev server on http://localhost:5173
npm run build     # production build → dist/
npm run preview   # preview production build
```

## Deploy

Connect this repo to **Cloudflare Pages**:
- Build command: `npm run build`
- Output directory: `dist`
- Node version: 20+

Add your custom domain in the Cloudflare Pages dashboard. A `_headers` file in `public/` sets long-cache headers for assets/fonts and security headers site-wide.

## Tablet (768–1023px) — breakpoint decision

**Choice: desktop layout with narrower viewport.**

At 768×1024 the desktop grid reads cleanly; the arch SVG scales proportionally; row text wraps gracefully. The mobile layout at this width leaves too much empty space around the narrow arch. Desktop wins.

Tested at 768×1024 and 820×1180; no regressions observed.
