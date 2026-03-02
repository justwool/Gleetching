import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { normalizeFont } from '@/lib/chrome/fonts';

export async function POST(req: Request) {
  if (!(await requireSession())) return NextResponse.json({ ok: false }, { status: 401 });
  const data = await req.json();
  const max = await prisma.collection.findFirst({ orderBy: { order: 'desc' } });
  const created = await prisma.collection.create({
    data: {
      ident: data.ident,
      title: data.title,
      slug: slugify(data.title),
      year: Number(data.year),
      tags: data.tags?.split(',').map((tag: string) => tag.trim()) ?? [],
      accentColor: data.accentColor || '#8eb8b8',
      dividerSet: data.dividerSet || 'pipe',
      headerStyle: data.headerStyle || 'stack',
      figletFont: normalizeFont(data.figletFont),
      order: (max?.order ?? 0) + 1
    }
  });
  return NextResponse.json({ ok: true, created });
}
