import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  if (!slug) return NextResponse.json({ items: [] });
  const collection = await prisma.collection.findUnique({ where: { slug }, include: { pieces: { orderBy: { capturedAt: 'desc' }, select: { pieceId: true, title: true, viewerUrl: true, serial: true } } } });
  return NextResponse.json({ items: collection?.pieces ?? [] });
}
