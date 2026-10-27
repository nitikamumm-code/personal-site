# Build brief: nitika personal site ("The Arch")

Build a single-page, scroll-driven personal site. The design is final in the Design artifact (Main.dc.html = desktop 1440, A-Mobile.dc.html = mobile 390). Treat those two files as the source of truth for geometry and copy; this brief explains the intent and how to port them.

## 1. Stack (default unless overridden)

- Vite + vanilla TypeScript (no framework). One `index.html`, one `main.ts`, one `styles.css`.
- Inline SVG for the arch. No canvas, no animation library.
- Self-host fonts (woff2): Newsreader (300, 400, italic 300/400, opsz axis), DM Mono (400, 500), Cormorant Garamond 500 (logo only). `font-display: swap`.
- Static output. **Host: Cloudflare Pages** (connect the Git repo; build command `npm run build`, output dir `dist`). Add a `_headers` file with long-cache headers for `/assets/*` and fonts, and security headers (`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`). Custom domain is configured in Cloudflare by the owner.
- No analytics, trackers, cookies or third-party requests (fonts are self-hosted). No résumé download link.

## 2. Concept

One shared element, an architectural arch drawn in SVG, is pinned to the viewport (`position: sticky; top: 0`, height = one screen) behind the content. As the user scrolls, the same lines morph from section to section. Nothing cross-fades except the Ionic column's details (see 5). The arch is the transition.

Sequence: **Hero arch → narrow arch beside About → single rail with "stones" for Career → Ionic column for Education → the column's inverted-U opens into the wide arch over a sea horizon for Contact.**

## 3. Design tokens

- Background `#0B0A09`; text `#FFFAEA`; secondary `#CFC9B8`; muted `#A8A397`; hairlines `rgba(255,250,234,0.16)`.
- Display/body: Newsreader 300. Hero H1 64px/1.02, -0.025em (desktop), 38px (mobile). About paragraph 38px/1.24 (desktop), 22px (mobile). Org names 30px (desktop), 26px (mobile). Roles/degrees italic 22px / 17px.
- Labels: DM Mono 11px, uppercase, letter-spacing 0.14em. Tags 10px.
- Logo: lowercase "nm", Cormorant Garamond 500, 30px (28 mobile), letter-spacing 0.04em.
- Pill button: min-height 44px, 1px border `rgba(255,250,234,0.22)`, radius 3px, bg `#0B0A09`, trailing 22px square arrow box. Hover: bg `#1A1815`, arrow nudges 3px.
- Four-point star (SVG path `M6 0C6.4 4 8 5.6 12 6 8 6.4 6.4 8 6 12 5.6 8 4 6.4 0 6 4 5.6 5.6 4 6 0Z`) sits on the arch crown.
- Stroke weights: outer arch 1.2 @ 0.62 opacity, inner arch 1.0 @ 0.38, ticks 1.0, column lines 1.0–1.2.
- No people, no photos, no paintings. The design is line-only.

## 4. Page structure and copy (final)

Section heights are exact multiples of one "screen" H (desktop 900px, mobile 800px). On real devices, use `H = window.innerHeight` (see 7).

1. **Hero** (H). Nav: logo `nm` (links to #top) left; "Contact →" pill right; 1px hairline under nav at 72px (64 mobile). Centered: H1 "Strategist and / Operator" (upright, two lines); sub: "My work is focused on how new technologies become part of everyday life."; pill "Keep exploring ↓" → #about. Load animation: lines rise 48px with stagger; arch draws in with `stroke-dashoffset` (pathLength=1).
2. **About** (H + X, X = extra "hold" scroll: 600 desktop / 500 mobile; inner content is `position: sticky`). Label "About". Paragraph: "I'm a strategy and operating leader. For six years at McKinsey I've taken high-stakes, ambiguous problems from first framing to measurable result, across enterprise AI, growth, product strategy and transformation." then an italic, `#CFC9B8` sentence that appears only after the hold: "Before that, I built a nonprofit from scratch and researched public understandings of emerging technology."
3. **Career** (H). Label "Career". Rows (year / org / role): 2020 — Now · McKinsey & Company · Associate Partner; 2015 — 2019 · The Diaper Bank Project · Founder and Director.
4. **Education** (H). Label "Education". Rows are taller (156px desktop, 260 mobile). 2019 — 2020 · University of Cambridge · MPhil, History and Philosophy of Science and Medicine · tags "Gates Scholar", "First Class Honors". 2015 — 2019 · University of California, Davis · B.S., Biochemistry and Molecular Biology · tags "Summa Cum Laude", "Margarita Robinson Leadership Award", "Mary Jeanne Gilhooly Award".
5. **Contact** (H). Label "Contact" (plain muted mono, no box). "Let's talk." (104px desktop, 58 mobile). Buttons: Email → obfuscated link (see below, never write the address in the HTML source); LinkedIn → `https://www.linkedin.com/in/nitikamummidivarapu`. No email text line. Footer bar: © 2026 Nitika Mummidivarapu / New York / Set in Newsreader & DM Mono.

Rows reveal on scroll (translateY 48px → 0). Use CSS `animation-timeline: view()` with a small IntersectionObserver fallback for Safari versions without it.

**Obfuscated email.** The button renders as `<a href="#contact" data-u="bml0aWthLm0=" data-d="Z21haWwuY29t">`. On `click`/`focus`/`pointerenter`, JS decodes `atob(data-u) + '@' + atob(data-d)` and sets `href = 'mailto:' + address` (then lets the click proceed; for the first click call `location.href = href`). The address must not appear as plain text anywhere in the built HTML, meta tags or JS bundle. Keep a no-JS fallback: `<noscript>` text "Email: nitika [at] gmail [dot] com". Verify with `grep -ri "nitika.m@gmail" dist/` returning nothing.

## 5. The arch: how it works

Single scroll listener (passive, rAF-throttled) → compute progress `p ∈ [0,4]` → interpolate keyframe parameters → regenerate SVG path strings → set `d`/`opacity`/`transform` attributes. Port `Component.paths()` and `renderVals()` from the artifact files nearly verbatim; they are framework-free math.

**Parameters per keyframe:** `cx` (centre x), `w` (outer width), `s` (y of spring line, where the semicircle begins), `b` (y of bottom of legs), `t` (stroke gap between outer and inner arch), `tk` (tick/voussoir opacity 0–1), `sea` (horizon-line opacity), `so[3]` (stone sizes), `sy[3]` (stone y positions).

**Desktop keyframes (W = viewport width, min 1024):**

| # | Section | cx | w | s | b | t | tk | sea | stones so | stones sy |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Hero | W/2 | 760 | 540 | 900 | 22 | 1 | 0 | 0,0,0 | 302,406,510 |
| 1 | About | 300 | 300 | 380 | 900 | 16 | 1 | 0 | 0,0,0 | 302,406,510 |
| 2 | Career | 300 | 18 | 140 | 900 | 6 | 0 | 0 | 1,1,0 | 302,406,510 |
| 3 | Education | 300 | 30 | 168 | 822 | 4 | 0 | 0 | 1,1,0 | 329,485,485 |
| 4 | Contact | W/2 | min(1200, W-240) | 700 | 760 | 30 | 1 | 1 | 0,0,0 | 700 ×3 |

**Mobile keyframes (W = viewport width, clamp 320–600; RX = 36):**

| # | cx | w | s | b | t | tk | sea | so | sy |
|---|---|---|---|---|---|---|---|---|---|
| 0 | W/2 | 300 | 380 | 800 | 18 | 1 | 0 | 0,0,0 | 250,390,390 |
| 1 | 36 | 50 | 220 | 800 | 8 | 0 | 0 | 0,0,0 | 250,390,390 |
| 2 | 36 | 10 | 110 | 800 | 4 | 0 | 0 | 1,1,0 | 250,390,390 |
| 3 | 36 | 21 | 150 | 692 | 3 | 0 | 0 | 1,1,0 | 310,570,570 |
| 4 | W/2 | min(350, W-40) | 480 | 660 | 22 | 1 | 1 | 0,0,0 | 600 ×3 |

Stone sizes: half-diagonal 6px desktop, 4px mobile, multiplied by `so`. Stones are filled `#FFFAEA` diamonds on the arch centreline and must land on the vertical centre of their rows (Career: 2 rows; Education: 2 rows, third unused).

**Path construction.** Outer/inner arch: `M(cx-R) b L(cx-R) s A R R 0 0 1 (cx+R) s L(cx+R) b` with R = w/2 and R-t. Ticks: 12 radial hairlines across the semicircle band at angles `π - kπ/13`, plus short horizontal impost lines at the spring line. Horizon: one full-width line at y = b (visible only at Contact). Star at `(cx, s - R)`, scaled by `(1 - po)`.

**Progress mapping.** `pe = y <= H ? y/H : (y <= H+X ? 1 : (y-X)/H)`, `p = clamp(pe, 0, 4)`, `i = min(3, floor(p))`, `f = p - i`. Each pose is held then eased: `f = clamp((f-0.18)/0.64)`, then smoothstep. Interpolate every parameter linearly between keyframes `i` and `i+1` using `f`.

**About hold:** the About section is `H + X` tall with a sticky inner container, so the arch pauses at pose 1 for X px. Paragraph opacity/translateY animate on `smoothstep(700, 1000, y)` (desktop; scale for mobile: 560–800) and the italic sentence on `smoothstep(1300, 1450, y)` (mobile 1050–1200).

## 6. The Ionic column (Education)

Drawn in the same SVG, grouped in `<g opacity=col>` **behind** the arch lines. Rules:

- The **inverted-U between the two volute circles is the shared arch itself**, not a separate shape. It must never fade; at Contact it expands into the big circle.
- Everything else (abacus, volutes, lintel, flutes, shaft, base, stylobate) **fades**: fades in during Career → Education (opacity = `f` between keyframes 2 and 3), and fades out during Education → Contact so that it is fully gone by the time the "Education" label scrolls off the top. Desktop: `col = 1 - smoothstep(3320, 3490, y)` for `p >= 3`. Mobile: `1 - smoothstep(2920, 3060, y)`. In implementation, derive these thresholds from section offsets, not hard-coded pixels.
- Desktop geometry (LX = 300): lintel = three horizontal lines at y 118/130/142, x LX±44, with two short end verticals; abacus rect `x LX-36, y 142, 72×8`; volutes = circles r 9 and r 4 at (LX±24, 168); shaft top 178 → bottom 826, half-width 18.5 tapering to ~22, plus six flute lines at ±0.3/0.55/0.8 of the half-width; base = three stacked rects at y 822/834/846 (widths 56/60/68); stylobate = two lines at y 868/876 (x LX±46).
- Mobile geometry (LX = 36, ~0.7 scale): see `Component.paths` in A-Mobile.dc.html.
- Arch legs (x = cx±15 and ±11) run down the shaft as its inner lines and stop at the base top (b = 822 / 692).

## 7. Responsiveness

- Two layouts: desktop (≥ 1024px) and mobile (< 768px). For 768–1023, build both candidates (mobile geometry with larger type; desktop with W clamped to 1024), screenshot each at 768×1024 and 820×1180, and keep whichever looks better. Record the choice in the README.
- **Design assumes H = 900 (desktop) / 800 (mobile).** In production set CSS variable `--H` from `window.innerHeight` (use `svh`/`dvh` carefully on iOS), and scale the SVG viewBox to the viewport so stones keep landing on row centres. Easiest path: keep sections at fixed `--H`, set the SVG `viewBox="0 0 W H"` with `preserveAspectRatio="xMinYMin meet"`, and position row content in the same coordinate space (absolute `top` values from the artifact). Test at 1280×720, 1440×900, 1920×1080, 390×844, 360×740.
- Avoid layout shift when mobile browser chrome collapses (use `svh` for the sticky layer height).

## 8. Accessibility and quality

- The SVG layer is decorative: `aria-hidden="true"`, `pointer-events: none`.
- `prefers-reduced-motion: reduce`: no load animation, no draw-in, no row reveal; still allow the arch to morph on scroll but switch to instant steps per section (or snap to the nearest keyframe).
- Contrast: body `#FFFAEA` on `#0B0A09` passes; muted `#A8A397` is for labels only (check ≥ 4.5:1 for 11px text; lighten to `#B5B0A1` if it fails).
- Semantic landmarks: `header`, `nav`, `main` wrapping the sections, `section` with `aria-labelledby`, `footer`. Visible focus ring on pills (2px `#FFFAEA` offset 3px).
- Anchor links (#about, #contact) use smooth scroll; with the hold in About, make "Contact" jump to the Contact section start.
- Lighthouse targets: Performance ≥ 95, Accessibility 100. Total JS < 15 KB gz. Throttle scroll work to one rAF per frame; only touch SVG attributes that changed.

## 9. Metadata

- `<title>`: "Nitika Mummidivarapu — Strategy and operations". Meta description (≤ 155 chars): "Strategist and operator in New York. Six years at McKinsey across enterprise AI, growth and product strategy."
- Favicon: the four-point star on `#0B0A09`. OG image 1200×630: dark background, the Hero arch + "Strategist and Operator" (generate from the same SVG).
- `lang="en"`, theme-color `#0B0A09`.

## 10. Acceptance checklist

- [ ] Arch morphs through all five poses, continuous, no jumps, in both directions of scroll.
- [ ] About holds ~one extra screen; italic sentence appears only afterwards.
- [ ] Stones sit on the row centres in Career and Education at every tested viewport.
- [ ] Column details fade; the inverted-U never fades and expands into the Contact circle.
- [ ] "Let's talk." and both buttons sit inside the Contact arch, above the horizon, and clear of the footer.
- [ ] Email is obfuscated (grep of `dist/` finds no address) and opens a mail draft; LinkedIn link verified. Footer text correct.
- [ ] Reduced-motion and keyboard navigation pass.
- [ ] Lighthouse targets met on mobile throttling.

## 11. Known gaps in the design

- The design was never visually QA'd across viewports; expect to nudge row `top` values and stone `sy` values.
- The Storyboard board still shows the old Education rail; ignore it.
- Tablet (768–1023) was not designed; resolved by testing (see 7).
- Hover/focus states beyond pills are not specified.
