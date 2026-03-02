import 'server-only';
import figlet from 'figlet';
import SmallFont from 'figlet/importable-fonts/Small.js';
import StandardFont from 'figlet/importable-fonts/Standard.js';
import SlantFont from 'figlet/importable-fonts/Slant.js';
import BigFont from 'figlet/importable-fonts/Big.js';
import MiniFont from 'figlet/importable-fonts/Mini.js';
import { normalizeFont, type SafeFont } from '@/lib/chrome/fonts';

figlet.parseFont('Small', SmallFont as unknown as string);
figlet.parseFont('Standard', StandardFont as unknown as string);
figlet.parseFont('Slant', SlantFont as unknown as string);
figlet.parseFont('Big', BigFont as unknown as string);
figlet.parseFont('Mini', MiniFont as unknown as string);

const FALLBACK = '[ gleetching ]';

function normalize(lines: string[]) {
  const out = lines.map((line) => line.replace(/\s+$/g, ''));
  while (out.length > 0 && out[0].trim().length === 0) out.shift();
  return out;
}

export function renderWordmark(text: string, fontName: string): string[] {
  const chosen = normalizeFont(fontName);
  const order: SafeFont[] = [chosen, 'Small', 'Mini', 'Standard', 'Slant', 'Big'];
  for (const font of order) {
    try {
      const lines = normalize(figlet.textSync(text, { font }).split('\n'));
      if (lines.length > 0) return lines;
    } catch {
      continue;
    }
  }
  return [FALLBACK];
}

export function wordmarkMetrics(lines: string[]) {
  const wmRows = Math.max(lines.length, 1);
  const wmCols = Math.max(...lines.map((line) => line.length), FALLBACK.length);
  return { wmRows, wmCols };
}
