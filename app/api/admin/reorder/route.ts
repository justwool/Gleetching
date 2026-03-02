import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';

export async function POST(req: Request) {
  if (!(await requireSession())) return NextResponse.json({ ok: false }, { status: 401 });
  const { ids } = await req.json();
  await prisma.$transaction(ids.map((id: string, index: number) => prisma.collection.update({ where: { id }, data: { order: index } })));
  return NextResponse.json({ ok: true });
}
