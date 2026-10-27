// ── Constants ──────────────────────────────────────────────
const IS_MOBILE = () => window.innerWidth < 768;
const DPR = Math.min(2, window.devicePixelRatio || 1);

// Desktop section heights: H, H+X, H, H, H (total 5H+X)
// Mobile:                  H, H+X, H, H, H
function getH(): number {
  return window.innerHeight;
}
function getX(): number {
  return IS_MOBILE() ? 500 : 600;
}

// Section scroll offsets (top of each section)
// Hero: 0, About: H, Career: H+H+X, Education: H+H+X+H, Contact: H+H+X+H+H
function sectionOffsets(): [number, number, number, number, number] {
  const H = getH(), X = getX();
  return [0, H, 2 * H + X, 3 * H + X, 4 * H + X];
}

// ── Arch keyframes ─────────────────────────────────────────
interface KF {
  cx: number; w: number; s: number; b: number; t: number;
  tk: number; sea: number; so: [number,number,number]; sy: [number,number,number];
}

function keyframes(W: number, H: number): KF[] {
  // Scale vertical positions proportionally to actual H
  const scale = (v: number, base: number) => Math.round(v * H / base);
  const s3 = (arr: [number,number,number], base: number): [number,number,number] =>
    arr.map(v => scale(v, base)) as [number,number,number];

  if (IS_MOBILE()) {
    const RX = 36, BASE = 800;
    const sc = (v: number) => scale(v, BASE);
    return [
      { cx: W/2,  w: 300, s: sc(380), b: H,        t: 18, tk: 1, sea: 0, so: [0,0,0], sy: s3([250,390,390], BASE) },
      { cx: RX,   w: 50,  s: sc(220), b: H,         t: 8,  tk: 0, sea: 0, so: [0,0,0], sy: s3([250,390,390], BASE) },
      { cx: RX,   w: 10,  s: sc(110), b: H,         t: 4,  tk: 0, sea: 0, so: [1,1,0], sy: s3([250,390,390], BASE) },
      { cx: RX,   w: 21,  s: sc(150), b: sc(692),   t: 3,  tk: 0, sea: 0, so: [1,1,0], sy: s3([310,570,570], BASE) },
      { cx: W/2,  w: Math.min(350, W-40), s: sc(480), b: sc(660), t: 22, tk: 1, sea: 1, so: [0,0,0], sy: s3([600,600,600], BASE) },
    ];
  } else {
    const RX = 300, BASE = 900;
    const sc = (v: number) => scale(v, BASE);
    return [
      { cx: W/2,  w: Math.min(760, Math.floor(1.04 * H - 16), W - 80), s: sc(540), b: H, t: 22, tk: 1, sea: 0, so: [0,0,0], sy: s3([302,406,510], BASE) },
      { cx: RX,   w: 300, s: sc(380), b: H,         t: 16, tk: 1, sea: 0, so: [0,0,0], sy: s3([302,406,510], BASE) },
      { cx: RX,   w: 18,  s: sc(140), b: H,         t: 6,  tk: 0, sea: 0, so: [1,1,0], sy: s3([302,406,510], BASE) },
      { cx: RX,   w: 30,  s: sc(168), b: sc(822),   t: 4,  tk: 0, sea: 0, so: [1,1,0], sy: s3([329,485,485], BASE) },
      { cx: W/2,  w: Math.min(800, W-240), s: sc(700), b: sc(760), t: 30, tk: 1, sea: 1, so: [0,0,0], sy: s3([700,700,700], BASE) },
    ];
  }
}

// ── Math helpers ───────────────────────────────────────────
function sm(a: number, b: number, v: number): number {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
}
function lerp(a: number, b: number, f: number): number { return a + (b - a) * f; }
function n(v: number): string { return String(Math.round(v * 10) / 10); }

// ── Path construction ──────────────────────────────────────
interface Geo {
  cx: number; w: number; s: number; b: number; t: number;
  tk: number; sea: number; po: number; col: number;
  so: number[]; sy: number[];
}

function arcPath(R: number, cx: number, s: number, b: number): string {
  return `M${n(cx-R)} ${n(b)}L${n(cx-R)} ${n(s)}A${n(R)} ${n(R)} 0 0 1 ${n(cx+R)} ${n(s)}L${n(cx+R)} ${n(b)}`;
}

function buildPaths(g: Geo, W: number, H: number) {
  const r = g.w / 2, ri = Math.max(0.5, r - g.t);
  const { cx, s, b } = g;
  const mobile = IS_MOBILE();
  const tickExt = mobile ? 10 : 14;
  const stoneSz = mobile ? 4 : 6;

  let ticks = '';
  for (let k = 1; k <= 12; k++) {
    const a = Math.PI - k * Math.PI / 13;
    const c = Math.cos(a), sn = Math.sin(a);
    ticks += `M${n(cx+c*ri)} ${n(s-sn*ri)}L${n(cx+c*r)} ${n(s-sn*r)}`;
  }
  ticks += `M${n(cx-r-tickExt)} ${n(s)}L${n(cx-ri)} ${n(s)}M${n(cx+ri)} ${n(s)}L${n(cx+r+tickExt)} ${n(s)}`;

  const sea = `M0 ${n(b)}L${W} ${n(b)}`;

  // Ionic column
  let entab = '', shaftL = '', baseL = '', capL = '';
  const co = g.col;
  if (co > 0.01) {
    if (mobile) {
      // Scale mobile column geometry to actual H (designed for H=800)
      const sc = (v: number) => Math.round(v * H / 800);
      const LX = 36, h1 = 13, y0 = sc(158), y2 = sc(690), h2 = h1 + 2.4;
      const circ = (x0: number, cy: number, rr: number) =>
        `M${n(x0-rr)} ${cy}a${rr} ${rr} 0 1 0 ${n(2*rr)} 0a${rr} ${rr} 0 1 0 ${n(-2*rr)} 0`;
      [-1,1].forEach(sg => { shaftL += `M${n(LX+sg*h1)} ${y0}L${n(LX+sg*h2)} ${y2}`; });
      [-0.8,-0.55,-0.3,0.3,0.55,0.8].forEach(o => { shaftL += `M${n(LX+o*h1)} ${y0}L${n(LX+o*h2)} ${y2}`; });
      capL = `M${LX-25} ${sc(124)}h50v6h-50Z` +
        circ(LX-17,sc(150),6.3) + circ(LX-17,sc(150),2.8) + circ(LX+17,sc(150),6.3) + circ(LX+17,sc(150),2.8);
      baseL = `M${LX-20} ${sc(686)}h40v8h-40ZM${LX-21} ${sc(694)}h42v8h-42ZM${LX-24} ${sc(702)}h48v14h-48Z`;
      [sc(96),sc(105),sc(114)].forEach(yy => { entab += `M${LX-31} ${yy}h62`; });
      entab += `M${LX-31} ${sc(96)}v18M${LX+31} ${sc(96)}v18`;
      [sc(722),sc(728)].forEach(yy => { entab += `M${LX-32} ${yy}h64`; });
    } else {
      // Scale desktop column geometry to actual H (designed for H=900)
      const sc = (v: number) => Math.round(v * H / 900);
      const LX = 300, h1 = 18.5, y2 = sc(826), h2 = h1 + 3.5 * (y2 - sc(178)) / (sc(826) - sc(178));
      const circ = (x0: number, cy: number, rr: number) =>
        `M${n(x0-rr)} ${cy}a${rr} ${rr} 0 1 0 ${2*rr} 0a${rr} ${rr} 0 1 0 ${-2*rr} 0`;
      [-1,1].forEach(sg => { shaftL += `M${n(LX+sg*h1)} ${sc(178)}L${n(LX+sg*h2)} ${y2}`; });
      [-0.8,-0.55,-0.3,0.3,0.55,0.8].forEach(o => { shaftL += `M${n(LX+o*h1)} ${sc(178)}L${n(LX+o*h2)} ${y2}`; });
      capL = `M${LX-36} ${sc(142)}h72v8h-72Z` +
        circ(LX-24,sc(168),9) + circ(LX-24,sc(168),4) + circ(LX+24,sc(168),9) + circ(LX+24,sc(168),4);
      baseL = `M${LX-28} ${sc(822)}h56v12h-56ZM${LX-30} ${sc(834)}h60v12h-60ZM${LX-34} ${sc(846)}h68v20h-68Z`;
      [sc(118),sc(130),sc(142)].forEach(yy => { entab += `M${LX-44} ${yy}h88`; });
      entab += `M${LX-44} ${sc(118)}v24M${LX+44} ${sc(118)}v24`;
      [sc(868),sc(876)].forEach(yy => { entab += `M${LX-46} ${yy}h92`; });
    }
  }

  let stones = '';
  g.so.forEach((o, k) => {
    const z = stoneSz * o, sy = g.sy[k];
    if (z > 0.3) stones += `M${n(cx)} ${n(sy-z)}L${n(cx+z)} ${n(sy)}L${n(cx)} ${n(sy+z)}L${n(cx-z)} ${n(sy)}Z`;
  });

  const tickOp = 0.4 * g.tk * Math.min(1, Math.max(0, (r - (mobile ? 24 : 30)) / (mobile ? 90 : 120)));

  return {
    outer: arcPath(r, cx, s, b),
    inner: arcPath(ri, cx, s, b),
    ticks, sea, stones, entab, shaftL, baseL, capL,
    colOp: co,
    tickOp,
    seaOp: 0.4 * g.sea,
    starT: `translate(${n(cx)} ${n(s-r)}) scale(${n(1-g.po)}) translate(-6 -6)`,
  };
}

// ── Scroll → progress ──────────────────────────────────────
function computeProgress(y: number, H: number, X: number): number {
  const pe = y <= H ? y / H : (y <= H + X ? 1 : (y - X) / H);
  return Math.min(4, Math.max(0, pe));
}

// ── DOM references ─────────────────────────────────────────
const archWrap = document.querySelector<HTMLDivElement>('.arch-wrap')!;
const archSvg  = document.getElementById('arch-svg') as unknown as SVGSVGElement;
const elOuter  = document.getElementById('p-outer')!;
const elInner  = document.getElementById('p-inner')!;
const elTicks  = document.getElementById('p-ticks')!;
const elSea    = document.getElementById('p-sea')!;
const elStones = document.getElementById('p-stones')!;
const elCol    = document.getElementById('g-col')!;
const elEntab  = document.getElementById('p-entab')!;
const elShaft  = document.getElementById('p-shaft')!;
const elBase   = document.getElementById('p-base')!;
const elCap    = document.getElementById('p-cap')!;
const elStar   = document.getElementById('g-star')!;
const aboutPara   = document.getElementById('about-para') as HTMLParagraphElement;
const aboutItalic = document.getElementById('about-italic') as HTMLElement;
const aboutSection = document.getElementById('about') as HTMLElement;

// ── Reduced-motion flag ────────────────────────────────────
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

// ── Resize: set --H CSS variable and SVG viewBox ───────────
function onResize() {
  const H = getH(), W = window.innerWidth;
  document.documentElement.style.setProperty('--H', H + 'px');
  archWrap.style.height = H + 'px';
  archWrap.style.marginBottom = `-${H}px`;

  const X = getX();
  aboutSection.style.height = (H + X) + 'px';

  archSvg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  // Position "Let's talk." h2 so its vertical centre sits at the arch opening's midpoint.
  // Contact arch: s = sc(700) desktop / sc(480) mobile, R = min(800,W-240)/2 desktop.
  const mobile = W < 768;
  const BASE = mobile ? 800 : 900;
  const contactS = Math.round((mobile ? 480 : 700) * H / BASE);
  const contactR = (mobile ? Math.min(350, W - 40) : Math.min(800, W - 240)) / 2;
  const archCenter = Math.round(contactS - contactR / 2);
  const h2Height = mobile ? 58 : 104;
  const contactH2Top = Math.max(0, archCenter - Math.round(h2Height / 2));
  document.documentElement.style.setProperty('--contact-h2-top', `${contactH2Top}px`);

  // Keep "Contact" label above the arch crown at all viewport sizes.
  const crownY = contactS - contactR;
  const labelDefault = Math.round((mobile ? 0.10 : 0.14) * H);
  const labelTop = Math.min(labelDefault, Math.max(16, crownY - 48));
  document.documentElement.style.setProperty('--contact-label-top', `${labelTop}px`);
}

// ── Snap to section (reduced-motion) ──────────────────────
function nearestSection(p: number): number {
  return Math.round(Math.min(4, Math.max(0, p)));
}

// ── Main render ────────────────────────────────────────────
let lastY = -1, lastW = -1;
let rafPending = false;

function render() {
  rafPending = false;
  const y = window.scrollY;
  const W = window.innerWidth;
  if (y === lastY && W === lastW) return;
  lastY = y; lastW = W;

  const H = getH();
  if (!H || H < 100 || !W || W < 100) return; // viewport not measured yet
  const X = getX();
  const K = keyframes(W, H);
  const p0 = computeProgress(y, H, X);
  if (!isFinite(p0)) return; // safety guard for NaN/Infinity
  let p = p0;

  if (prefersReduced.matches) {
    p = nearestSection(p);
  }

  const i = Math.min(3, Math.floor(p));
  let f = p - i;
  if (!prefersReduced.matches) {
    f = Math.min(1, Math.max(0, (f - 0.18) / 0.64));
    f = f * f * (3 - 2 * f); // smoothstep
  }

  const PO = [0, 0, 0, 1, 0];
  const A = K[i], B = K[i + 1];
  const L = (a: number, b: number) => lerp(a, b, f);

  // Column fade: starts when entering Education section, gone just before the
  // "Education" label (at ~20% of section) scrolls off the top.
  const offsets = sectionOffsets();
  const colFadeStart = offsets[3] + H * 0.02; // ~20px into Education at H=900
  const colFadeEnd   = offsets[3] + H * 0.21; // ~190px in, just as label reaches top
  const col = p >= 3
    ? 1 - sm(colFadeStart, colFadeEnd, y)
    : L(PO[i], PO[i+1]);

  const g: Geo = {
    cx: L(A.cx, B.cx), w: L(A.w, B.w), s: L(A.s, B.s), b: L(A.b, B.b), t: L(A.t, B.t),
    tk: L(A.tk, B.tk), sea: L(A.sea, B.sea), po: L(PO[i], PO[i+1]), col,
    so: A.so.map((v, k) => L(v, B.so[k])),
    sy: A.sy.map((v, k) => L(v, B.sy[k])),
  };

  const paths = buildPaths(g, W, H);

  // Update only changed SVG attributes
  setAttr(elOuter, 'd', paths.outer);
  setAttr(elInner, 'd', paths.inner);
  setAttr(elTicks, 'd', paths.ticks);
  setAttr(elTicks, 'opacity', String(Math.round(paths.tickOp * 100) / 100));
  setAttr(elSea, 'd', paths.sea);
  setAttr(elSea, 'opacity', String(Math.round(paths.seaOp * 100) / 100));
  setAttr(elStones, 'd', paths.stones);
  setAttr(elCol, 'opacity', String(Math.round(paths.colOp * 100) / 100));
  setAttr(elEntab, 'd', paths.entab);
  setAttr(elShaft, 'd', paths.shaftL);
  setAttr(elBase, 'd', paths.baseL);
  setAttr(elCap, 'd', paths.capL);
  elStar.setAttribute('transform', paths.starT);

  // About paragraph opacity / translateY (scale thresholds with H)
  const aScale = H / (IS_MOBILE() ? 800 : 900);
  const aboutIn = sm(Math.round((IS_MOBILE() ? 560 : 700) * aScale),
                     Math.round((IS_MOBILE() ? 800 : 1000) * aScale), y);
  const itIn    = sm(Math.round((IS_MOBILE() ? 1050 : 1300) * aScale),
                     Math.round((IS_MOBILE() ? 1200 : 1450) * aScale), y);
  const scrolled = y > 0;
  const aOp = scrolled ? aboutIn : 1;
  const aY  = scrolled ? Math.round((1 - aboutIn) * (IS_MOBILE() ? 36 : 48)) : 0;
  aboutPara.style.opacity    = String(Math.round(aOp * 100) / 100);
  aboutPara.style.transform  = `translateY(${aY}px)`;
  aboutItalic.style.opacity  = String(Math.round((scrolled ? itIn : 1) * 100) / 100);
}

// Cache for setAttr to skip no-op writes
const attrCache = new Map<Element, Record<string, string>>();
function setAttr(el: Element, attr: string, val: string) {
  let cache = attrCache.get(el);
  if (!cache) { cache = {}; attrCache.set(el, cache); }
  if (cache[attr] === val) return;
  cache[attr] = val;
  el.setAttribute(attr, val);
}

function scheduleRender() {
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(render);
}

// ── IntersectionObserver fallback for reveal (Safari < 17) ─
function setupRevealFallback() {
  // Check if CSS animation-timeline is supported
  const testEl = document.createElement('div');
  testEl.style.cssText = 'animation-timeline: view()';
  if ((testEl.style as CSSStyleDeclaration & {animationTimeline?: string}).animationTimeline !== undefined) return;

  const ios = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        (e.target as HTMLElement).style.opacity = '1';
        (e.target as HTMLElement).style.transform = 'translateY(0)';
        (e.target as HTMLElement).style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll<HTMLElement>('.reveal').forEach(el => {
    if (prefersReduced.matches) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    } else {
      el.style.opacity = '0';
      el.style.transform = 'translateY(48px)';
      ios.observe(el);
    }
  });
}

// ── Email obfuscation ──────────────────────────────────────
function setupEmail() {
  const btn = document.querySelector<HTMLAnchorElement>('.email-btn');
  if (!btn) return;
  const decode = () => {
    const u = btn.dataset.u || '';
    const d = btn.dataset.d || '';
    return `mailto:${atob(u)}@${atob(d)}`;
  };
  const activate = () => { btn.href = decode(); };
  btn.addEventListener('pointerenter', activate, { once: true });
  btn.addEventListener('focus', activate, { once: true });
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    btn.href = decode();
    window.location.href = btn.href;
  }, { once: true });
}

// ── Smooth scroll for anchor links ────────────────────────
function setupAnchors() {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(a => {
    if (a.classList.contains('email-btn')) return;
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href')!.slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      // For #contact, jump to contact section's scroll offset
      const offsets = sectionOffsets();
      const H = getH(), X = getX();
      let scrollY = target.offsetTop;
      // Use computed section offsets for predictable targeting
      if (id === 'about')   scrollY = offsets[1] + 10;
      if (id === 'contact') scrollY = offsets[4];
      window.scrollTo({ top: scrollY, behavior: prefersReduced.matches ? 'instant' : 'smooth' });
    });
  });
}

// ── Init ───────────────────────────────────────────────────
onResize();
render();
// Retry render after layout stabilises (handles zero-height iframe on first paint)
setTimeout(() => { lastY = -1; lastW = -1; onResize(); render(); }, 50);
setupRevealFallback();
setupEmail();
setupAnchors();

window.addEventListener('scroll', scheduleRender, { passive: true });
window.addEventListener('resize', () => { onResize(); scheduleRender(); });
