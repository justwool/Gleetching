export type ChromeContextState = {
  routeLabel: string;
  shortRoute: string;
  contextLabel: string;
  contextHref?: string;
  status: string;
  time: string;
  dividerSet?: string;
};

export type Run = {
  text: string;
  href?: string;
  kind?: 'accent' | 'dim' | 'plain';
};

export type Banner = {
  glyphSet: 'pipe' | 'hatch' | 'double';
  lines: Run[][];
};

type Glyph = { h: string; v: string; tl: string; tr: string; bl: string; br: string; fill: string; spark: string };

const glyphByDivider = (dividerSet?: string): 'pipe' | 'hatch' | 'double' => {
  if (dividerSet === 'hatch' || dividerSet === 'dot') return 'hatch';
  if (dividerSet === 'double') return 'double';
  return 'pipe';
};

const symbols: Record<'pipe' | 'hatch' | 'double', Glyph> = {
  pipe: { h: '─', v: '│', tl: '┌', tr: '┐', bl: '└', br: '┘', fill: '░', spark: '◊' },
  hatch: { h: '═', v: '║', tl: '╔', tr: '╗', bl: '╚', br: '╝', fill: '▒', spark: '¤' },
  double: { h: '━', v: '┃', tl: '┏', tr: '┓', bl: '┗', br: '┛', fill: '▓', spark: '◆' }
};

const trunc = (value: string, max: number) => {
  if (max <= 0) return '';
  if (value.length <= max) return value;
  if (max === 1) return '…';
  return `${value.slice(0, max - 1)}…`;
};

const fitRuns = (runs: Run[], cols: number): Run[] => {
  const out: Run[] = [];
  let used = 0;
  for (const run of runs) {
    if (used >= cols) break;
    const remaining = cols - used;
    const text = run.text.length <= remaining ? run.text : trunc(run.text, remaining);
    if (text.length > 0) {
      out.push({ ...run, text });
      used += text.length;
    }
  }
  if (used < cols) out.push({ text: ' '.repeat(cols - used), kind: 'plain' });
  return out;
};

const lineText = (left: string, innerRuns: Run[], right: string, cols: number) => {
  const innerCols = Math.max(cols - left.length - right.length, 0);
  const fitted = fitRuns(innerRuns, innerCols);
  return fitRuns([{ text: left, kind: 'dim' }, ...fitted, { text: right, kind: 'dim' }], cols);
};

const framedBar = (glyph: Glyph, cols: number, leftTag: string, rightTag = ''): Run[] => {
  const inner = Math.max(cols - 2, 0);
  const label = `${leftTag}${rightTag ? ` ${rightTag}` : ''}`;
  const base = `${glyph.spark}${glyph.fill}${label}${glyph.fill}${glyph.spark}`;
  const text = trunc(base, inner);
  const fill = glyph.h.repeat(Math.max(inner - text.length, 0));
  return fitRuns([{ text: glyph.tl, kind: 'dim' }, { text: text + fill, kind: 'dim' }, { text: glyph.tr, kind: 'dim' }], cols);
};

export function renderTopBanner(cols: number, state: ChromeContextState): Banner {
  const safeCols = Math.max(cols, 32);
  const glyphSet = glyphByDivider(state.dividerSet);
  const g = symbols[glyphSet];
  const narrow = safeCols <= 48;
  const mid = safeCols <= 92;

  if (narrow) {
    const route = trunc(state.shortRoute, 5);
    const ctx = trunc(state.contextLabel || 'ROOT', 10);
    const top = framedBar(g, safeCols, '[DIR]', route);
    const content = lineText(
      `${g.v} `,
      [
        { text: 'GLEETCHING', href: '/', kind: 'accent' },
        { text: ` ${g.fill} `, kind: 'dim' },
        { text: route, kind: 'plain' },
        { text: ` ${g.fill} `, kind: 'dim' },
        { text: ctx, href: state.contextHref, kind: 'accent' },
        { text: ' ', kind: 'plain' },
        { text: trunc(state.time, 8), kind: 'dim' }
      ],
      ` ${g.v}`,
      safeCols
    );
    return { glyphSet, lines: [top, content] };
  }

  if (mid) {
    const top = framedBar(g, safeCols, 'GLEETCHING', trunc(state.routeLabel, 18));
    const navLine = lineText(
      `${g.v} `,
      [
        { text: '[DIR]', href: '/', kind: 'accent' },
        { text: ' ', kind: 'plain' },
        { text: '[ABT]', href: '/about', kind: 'accent' },
        { text: ' ', kind: 'plain' },
        { text: '[CNTCT]', href: '/contact', kind: 'accent' },
        { text: ' ', kind: 'plain' },
        { text: '[ADM]', href: '/admin', kind: 'accent' },
        { text: ` ${g.fill} CTX:`, kind: 'dim' },
        { text: trunc(state.contextLabel || 'ROOT', 14), href: state.contextHref, kind: 'accent' },
        { text: ` ${g.fill} `, kind: 'dim' },
        { text: trunc(state.time, 8), kind: 'plain' }
      ],
      ` ${g.v}`,
      safeCols
    );
    const info = lineText(
      `${g.bl}`,
      [{ text: `${g.h}${g.h} STATUS:${trunc(state.status, 24)} ${g.h}${g.h}`, kind: 'dim' }],
      `${g.br}`,
      safeCols
    );
    return { glyphSet, lines: [top, navLine, info] };
  }

  const top = framedBar(g, safeCols, 'ARCHIVE.WORKSTATION', state.shortRoute);
  const nav = lineText(
    `${g.v} `,
    [
      { text: '[GLEETCHING]', href: '/', kind: 'accent' },
      { text: ' ', kind: 'plain' },
      { text: '[ABOUT]', href: '/about', kind: 'accent' },
      { text: ' ', kind: 'plain' },
      { text: '[CONTACT]', href: '/contact', kind: 'accent' },
      { text: ' ', kind: 'plain' },
      { text: '[ADMIN]', href: '/admin', kind: 'accent' },
      { text: ` ${g.fill} CTX:`, kind: 'dim' },
      { text: trunc(state.contextLabel || 'ROOT', 24), href: state.contextHref, kind: 'accent' }
    ],
    ` ${g.v}`,
    safeCols
  );
  const detail = lineText(
    `${g.v} `,
    [
      { text: `ROUTE:${trunc(state.routeLabel, 20)} `, kind: 'plain' },
      { text: `${g.fill} `, kind: 'dim' },
      { text: `TIME:${trunc(state.time, 8)} `, kind: 'plain' },
      { text: `${g.fill} `, kind: 'dim' },
      { text: `STATUS:${trunc(state.status, 30)}`, kind: 'plain' }
    ],
    ` ${g.v}`,
    safeCols
  );
  const bottom = fitRuns([{ text: g.bl + g.h.repeat(Math.max(safeCols - 2, 0)) + g.br, kind: 'dim' }], safeCols);
  return { glyphSet, lines: [top, nav, detail, bottom] };
}

export function renderBottomStrip(cols: number, viewerOpen: boolean): Banner {
  const safeCols = Math.max(cols, 32);
  const g = symbols.pipe;
  const mobile = safeCols <= 64;

  const navRuns: Run[] = mobile
    ? [
        { text: 'TAP:', kind: 'dim' },
        { text: '[DIR]', href: '/', kind: 'accent' },
        { text: ' ', kind: 'plain' },
        { text: '[ABT]', href: '/about', kind: 'accent' },
        { text: ' ', kind: 'plain' },
        { text: '[CNTCT]', href: '/contact', kind: 'accent' },
        { text: ' ', kind: 'plain' },
        { text: '[ADM]', href: '/admin', kind: 'accent' },
        { text: ` ${g.fill} `, kind: 'dim' },
        { text: viewerOpen ? 'SWIPE←/→' : 'SWIPE', kind: 'plain' }
      ]
    : [
        { text: 'NAV:', kind: 'dim' },
        { text: '[HOME]', href: '/', kind: 'accent' },
        { text: ' ', kind: 'plain' },
        { text: '[ABOUT]', href: '/about', kind: 'accent' },
        { text: ' ', kind: 'plain' },
        { text: '[CONTACT]', href: '/contact', kind: 'accent' },
        { text: ' ', kind: 'plain' },
        { text: '[ADMIN]', href: '/admin', kind: 'accent' },
        { text: ` ${g.fill} `, kind: 'dim' },
        { text: '↑↓ ENTER ESC', kind: 'plain' },
        { text: ` ${g.fill} `, kind: 'dim' },
        { text: viewerOpen ? 'SWIPE←/→ NEXT/PREV' : 'SCAN READY', kind: 'plain' }
      ];

  const line1 = lineText(`${g.tl} `, navRuns, ` ${g.tr}`, safeCols);
  const line2 = fitRuns([{ text: g.bl + g.h.repeat(Math.max(safeCols - 2, 0)) + g.br, kind: 'dim' }], safeCols);
  return { glyphSet: 'pipe', lines: [line1, line2] };
}
