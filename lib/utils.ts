import crypto from 'crypto';

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

export const pieceHash = (buffer: Buffer) => crypto.createHash('sha256').update(buffer).digest('hex');

export const generateSerial = () => crypto.randomInt(10_000_000, 99_999_999).toString() + crypto.randomInt(10_000_000, 99_999_999).toString();

export const dividerMap: Record<string, string> = {
  pipe: '││││││││││',
  hatch: '▒▒▒▒▒▒▒▒▒▒',
  double: '╫╫╫╫╫╫╫╫╫╫',
  dot: '┈┈┈┈┈┈┈┈┈┈'
};

export const headerVariants: Record<string, string> = {
  stack: '┌─[DIRECTORY NODE]─────────────┐',
  field: '╔═ SYSTEM FIELD // ARCHIVE ════╗',
  relay: '╓─ RELAY SURFACE : COLLECTION ─╖'
};
