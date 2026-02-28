export type ChromeContextState = {
  routeLabel: string;
  shortRoute: string;
  contextLabel: string;
  contextHref?: string;
  status: string;
  time: string;
  dividerSet?: string;
};

export type BannerSegment = {
  key: string;
  href: string;
  row: number;
  colStart: number;
  colEnd: number;
};

export type BannerRender = {
  lines: string[];
  segments: BannerSegment[];
  glyphSet: 'pipe' | 'hatch' | 'double';
};

const glyphByDivider = (dividerSet?: string): 'pipe' | 'hatch' | 'double' => {
  if (dividerSet === 'hatch' || dividerSet === 'dot') return 'hatch';
  if (dividerSet === 'double') return 'double';
  return 'pipe';
};

const symbols = {
  pipe: { h: '─', v: '│', tl: '┌', tr: '┐', bl: '└', br: '┘', fill: '░', spark: '◊' },
  hatch: { h: '═', v: '║', tl: '╔', tr: '╗', bl: '╚', br: '╝', fill: '▒', spark: '¤' },
  double: { h: '━', v: '┃', tl: '┏', tr: '┓', bl: '┗', br: '┛', fill: '▓', spark: '◆' }
};

const fit = (value: string, max: number) => (value.length > max ? `${value.slice(0, Math.max(1, max - 1))}…` : value.padEnd(max, ' '));

const segmentFor = (line: string, token: string, key: string, href: string, row: number): BannerSegment | null => {
  const colStart = line.indexOf(token);
  if (colStart < 0) return null;
  return { key, href, row, colStart, colEnd: colStart + token.length };
};

export function renderTopBanner(width: number, state: ChromeContextState): BannerRender {
  const glyphSet = glyphByDivider(state.dividerSet);
  const g = symbols[glyphSet];
  const segments: BannerSegment[] = [];

  if (width < 540) {
    const route = fit(state.shortRoute, 5);
    const ctx = fit(state.contextLabel || 'ROOT', 14);
    const l1 = `${g.tl}${g.h.repeat(9)}[DIR]${g.h.repeat(10)}${g.tr}`;
    const l2 = `${g.v} GLEETCHING ${g.spark} ${route} ${g.fill} ${ctx} ${g.v}`;
    const l3 = `${g.v} ${fit(state.time, 8)} ${g.fill} ${fit(state.status, 17)} ${g.v}`;
    const l4 = `${g.bl}${g.h.repeat(Math.max(l1.length - 2, 2))}${g.br}`;
    const lines = [l1, fit(l2, l1.length), fit(l3, l1.length), l4];
    const home = segmentFor(lines[1], 'GLEETCHING', 'home', '/', 1);
    const context = state.contextHref ? segmentFor(lines[1], ctx.trim(), 'context', state.contextHref, 1) : null;
    if (home) segments.push(home);
    if (context) segments.push(context);
    return { lines, segments, glyphSet };
  }

  if (width < 980) {
    const nav = '[DIR] [ABT] [CNTCT] [ADM]';
    const top = `${g.tl}${g.h.repeat(4)}${g.spark} GLEETCHING ${g.spark} ${fit(state.routeLabel, 18)} ${g.h.repeat(4)}${g.tr}`;
    const mid = `${g.v} ${nav} ${g.fill} CTX:${fit(state.contextLabel || 'ROOT', 18)} ${g.fill} ${fit(state.time, 8)} ${g.v}`;
    const bot = `${g.bl}${g.h.repeat(Math.max(top.length - 2, 2))}${g.br}`;
    const lines = [fit(top, top.length), fit(mid, top.length), bot];
    const map: Array<[string, string, string]> = [
      ['DIR', '/', 'home'],
      ['ABT', '/about', 'about'],
      ['CNTCT', '/contact', 'contact'],
      ['ADM', '/admin', 'admin']
    ];
    map.forEach(([token, href, key]) => {
      const s = segmentFor(lines[1], token, key, href, 1);
      if (s) segments.push(s);
    });
    if (state.contextHref) {
      const ctxText = fit(state.contextLabel || 'ROOT', 18).trim();
      const s = segmentFor(lines[1], ctxText, 'context', state.contextHref, 1);
      if (s) segments.push(s);
    }
    return { lines, segments, glyphSet };
  }

  const nav = '[GLEETCHING] [ABOUT] [CONTACT] [ADMIN]';
  const top = `${g.tl}${g.h.repeat(2)}${g.spark}${g.fill.repeat(2)} ARCHIVE.WORKSTATION ${g.fill.repeat(2)}${g.spark}${g.h.repeat(26)}${g.tr}`;
  const mid = `${g.v} ${nav} ${g.fill} ROUTE:${fit(state.routeLabel, 20)} ${g.fill} CTX:${fit(state.contextLabel || 'ROOT', 24)} ${g.v}`;
  const low = `${g.v} TIME:${fit(state.time, 8)} ${g.fill} STATUS:${fit(state.status, 28)} ${g.fill} LINK:STABLE ${g.v}`;
  const bot = `${g.bl}${g.h.repeat(Math.max(top.length - 2, 2))}${g.br}`;
  const lines = [fit(top, top.length), fit(mid, top.length), fit(low, top.length), bot];

  const map: Array<[string, string, string]> = [
    ['GLEETCHING', '/', 'home'],
    ['ABOUT', '/about', 'about'],
    ['CONTACT', '/contact', 'contact'],
    ['ADMIN', '/admin', 'admin']
  ];
  map.forEach(([token, href, key]) => {
    const s = segmentFor(lines[1], token, key, href, 1);
    if (s) segments.push(s);
  });
  if (state.contextHref) {
    const ctxText = fit(state.contextLabel || 'ROOT', 24).trim();
    const s = segmentFor(lines[1], ctxText, 'context', state.contextHref, 1);
    if (s) segments.push(s);
  }

  return { lines, segments, glyphSet };
}

export function renderBottomStrip(width: number, viewerOpen: boolean): BannerRender {
  const base = symbols.pipe;
  const segments: BannerSegment[] = [];

  if (width < 760) {
    const line = `${base.tl} TAP:[DIR][ABT][CNTCT][ADM] ${base.fill} ${viewerOpen ? 'SWIPE←/→ PIECES' : 'SWIPE TO BROWSE'} ${base.tr}`;
    const bottom = `${base.bl}${base.h.repeat(Math.max(line.length - 2, 2))}${base.br}`;
    const lines = [line, bottom];
    [['DIR', '/'], ['ABT', '/about'], ['CNTCT', '/contact'], ['ADM', '/admin']].forEach(([token, href], i) => {
      const s = segmentFor(lines[0], token, `b-${i}`, href, 0);
      if (s) segments.push(s);
    });
    return { lines, segments, glyphSet: 'pipe' };
  }

  const line = `${base.tl} NAV:[HOME][ABOUT][CONTACT][ADMIN] ${base.fill} ↑↓ ENTER ESC ${base.fill} ${viewerOpen ? 'SWIPE←/→ NEXT/PREV' : 'SCAN READY'} ${base.tr}`;
  const bottom = `${base.bl}${base.h.repeat(Math.max(line.length - 2, 2))}${base.br}`;
  const lines = [line, bottom];
  [['HOME', '/'], ['ABOUT', '/about'], ['CONTACT', '/contact'], ['ADMIN', '/admin']].forEach(([token, href], i) => {
    const s = segmentFor(lines[0], token, `b-${i}`, href, 0);
    if (s) segments.push(s);
  });

  return { lines, segments, glyphSet: 'pipe' };
}
