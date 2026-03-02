import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { SAFE_FONTS } from '@/lib/chrome/fonts';

type SiteSettingsRecord = { figletFont: string; wordmarkPlacement: string; wordmarkBarFollowsFiglet: boolean };
type SiteSettingsAccessor = {
  upsert?: (arg: {
    where: { id: number };
    update: Partial<SiteSettingsRecord>;
    create: { id: number } & SiteSettingsRecord;
  }) => Promise<SiteSettingsRecord>;
};

const fallback: SiteSettingsRecord = { figletFont: 'Small', wordmarkPlacement: 'RIGHT', wordmarkBarFollowsFiglet: true };

export async function GET() {
  if (!(await requireSession())) return NextResponse.json({ ok: false }, { status: 401 });
  const siteSettings = (prisma as unknown as { siteSettings?: SiteSettingsAccessor }).siteSettings;
  const settings = await siteSettings?.upsert?.({ where: { id: 1 }, update: {}, create: { id: 1, ...fallback } }).catch(() => fallback) ?? fallback;
  return NextResponse.json({ ok: true, figletFont: settings.figletFont, wordmarkPlacement: settings.wordmarkPlacement, wordmarkBarFollowsFiglet: settings.wordmarkBarFollowsFiglet, safeFonts: SAFE_FONTS });
}

export async function POST(req: Request) {
  if (!(await requireSession())) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await req.json();
  const figletFont = String(body.figletFont || 'Small');
  if (!SAFE_FONTS.includes(figletFont as (typeof SAFE_FONTS)[number])) return NextResponse.json({ ok: false, error: 'invalid font' }, { status: 400 });

  const siteSettings = (prisma as unknown as { siteSettings?: SiteSettingsAccessor }).siteSettings;
  const settings = await siteSettings?.upsert?.({
    where: { id: 1 },
    update: { figletFont, wordmarkPlacement: 'RIGHT', wordmarkBarFollowsFiglet: true },
    create: { id: 1, figletFont, wordmarkPlacement: 'RIGHT', wordmarkBarFollowsFiglet: true }
  }).catch(() => ({ ...fallback, figletFont })) ?? ({ ...fallback, figletFont });

  return NextResponse.json({ ok: true, figletFont: settings.figletFont, wordmarkPlacement: settings.wordmarkPlacement, wordmarkBarFollowsFiglet: settings.wordmarkBarFollowsFiglet });
}
