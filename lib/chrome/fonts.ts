export const SAFE_FONTS = ['Small', 'Standard', 'Slant', 'Big', 'Mini'] as const;
export type SafeFont = (typeof SAFE_FONTS)[number];

export function normalizeFont(font?: string): SafeFont {
  if (font && SAFE_FONTS.includes(font as SafeFont)) return font as SafeFont;
  return 'Small';
}
