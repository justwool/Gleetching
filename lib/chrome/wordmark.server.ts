import 'server-only';
import figlet from 'figlet';
import { DEFAULT_FIGLET_FONT, normalizeFont } from '@/lib/chrome/fonts';

const FALLBACK = '[ gleetching ]';

function clean(lines: string[]) {
  const out = lines.map((line) => line.replace(/\s+$/g, ''));
  while (out.length > 0 && out[0].trim().length === 0) out.shift();
  while (out.length > 0 && out[out.length - 1].trim().length === 0) out.pop();
  return out;
}

export function renderWordmark(text: string, fontName: string): string[] {
  const selected = normalizeFont(fontName);
  try {
    const lines = clean(figlet.textSync(text, { font: selected }).split('\n'));
    if (lines.length > 0) return lines;
  } catch {
    // fallback below
  }

  try {
    const lines = clean(figlet.textSync(text, { font: DEFAULT_FIGLET_FONT }).split('\n'));
    if (lines.length > 0) return lines;
  } catch {
    // fallback below
  }

  return [FALLBACK];
}

export function wordmarkMetrics(lines: string[]) {
  const wmRows = Math.max(lines.length, 1);
  const wmCols = Math.max(...lines.map((line) => line.length), FALLBACK.length);
  return { wmRows, wmCols };
}
