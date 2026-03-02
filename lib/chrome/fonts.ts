export const DEFAULT_FIGLET_FONT = 'Standard';

export function normalizeFont(font?: string): string {
  const value = (font ?? '').trim();
  return value.length > 0 ? value : DEFAULT_FIGLET_FONT;
}
