import figlet from 'figlet';

export const SAFE_FONTS = ['Small', 'Standard', 'Slant', 'Big', 'Mini'] as const;
export type SafeFont = (typeof SAFE_FONTS)[number];

const cache = new Map<string, string[]>();

const fallbackLine = '[ gleetching ]';

function normalize(lines: string[]) {
  const out = lines.map((line) => line.replace(/\s+$/g, ''));
  while (out.length > 0 && out[0].trim().length === 0) out.shift();
  return out;
}

export function renderWordmark({ text, font, maxCols }: { text: string; font: string; maxCols: number }): { lines: string[] } {
  const bucket = maxCols >= 80 ? 80 : maxCols >= 55 ? 55 : 40;
  const chosenFont: SafeFont | 'fallback' = bucket < 55 ? 'fallback' : (bucket < 80 ? 'Small' : (SAFE_FONTS.includes(font as SafeFont) ? (font as SafeFont) : 'Small'));
  const key = `${chosenFont}|${bucket}`;
  const cached = cache.get(key);
  if (cached) return { lines: cached };

  let lines: string[];
  if (chosenFont === 'fallback') {
    lines = [fallbackLine];
  } else {
    try {
      lines = normalize(figlet.textSync(text, { font: chosenFont }).split('\n'));
    } catch {
      lines = normalize(figlet.textSync(text, { font: 'Small' }).split('\n'));
    }

    if (lines.length === 0 || lines.some((line) => line.length > maxCols)) {
      if (chosenFont !== 'Small') {
        lines = normalize(figlet.textSync(text, { font: 'Small' }).split('\n'));
      }
      if (lines.some((line) => line.length > maxCols)) lines = [fallbackLine];
    }
  }

  lines = lines.map((line) => (line.length > maxCols ? line.slice(0, maxCols) : line)).slice(0, 5);
  cache.set(key, lines);
  return { lines };
}
