import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { SAFE_FONTS } from '@/lib/chrome/fonts';

export async function GET() {
  if (!(await requireSession())) return NextResponse.json({ ok: false }, { status: 401 });
  const settings = await prisma.siteSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1, figletFont: 'Small' } });
  return NextResponse.json({ ok: true, figletFont: settings.figletFont, safeFonts: SAFE_FONTS });
}

export async function POST(req: Request) {
  if (!(await requireSession())) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await req.json();
  const figletFont = String(body.figletFont || 'Small');
  if (!SAFE_FONTS.includes(figletFont as (typeof SAFE_FONTS)[number])) {
    return NextResponse.json({ ok: false, error: 'invalid font' }, { status: 400 });
  }

  const settings = await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: { figletFont },
    create: { id: 1, figletFont }
  });

  return NextResponse.json({ ok: true, figletFont: settings.figletFont });
}
