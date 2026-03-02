import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';

export async function GET() {
  if (!(await requireSession())) return NextResponse.json({ items: [] }, { status: 401 });
  const items = await prisma.collection.findMany({ orderBy: { order: 'asc' }, select: { id: true, ident: true, title: true, slug: true } });
  return NextResponse.json({ items });
}
