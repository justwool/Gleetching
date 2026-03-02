import 'server-only';
import figlet from 'figlet';
import SmallFont from 'figlet/importable-fonts/Small.js';
import StandardFont from 'figlet/importable-fonts/Standard.js';
import SlantFont from 'figlet/importable-fonts/Slant.js';
import BigFont from 'figlet/importable-fonts/Big.js';
import MiniFont from 'figlet/importable-fonts/Mini.js';
import { normalizeFont, SAFE_FONTS, type SafeFont } from '@/lib/chrome/fonts';

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

function renderWithFont(text: string, font: SafeFont) {
  return normalize(figlet.textSync(text, { font }).split('\n'));
}

export function renderWordmark(text: string, fontName: string, maxWidthChars: number): string[] {
  if (maxWidthChars < 20) return [FALLBACK];
  if (maxWidthChars < 55) return [FALLBACK];

  const chosen = maxWidthChars >= 80 ? normalizeFont(fontName) : 'Small';
  const fallbackOrder: SafeFont[] = [chosen, 'Small', 'Mini', 'Standard'];

  for (const font of fallbackOrder) {
    if (!SAFE_FONTS.includes(font)) continue;
    const lines = renderWithFont(text, font).slice(0, 5);
    if (lines.length > 0 && lines.every((line) => line.length <= maxWidthChars)) return lines;
  }

  return [FALLBACK];
}

export function renderWordmarkVariants(text: string, fontName: string) {
  return {
    wide: renderWordmark(text, fontName, 80),
    mid: renderWordmark(text, fontName, 55),
    narrow: renderWordmark(text, fontName, 40)
  };
}
