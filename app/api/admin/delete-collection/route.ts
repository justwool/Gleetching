import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { deleteBlobAssets } from '@/lib/image-pipeline';

export async function POST(req: Request) {
  if (!(await requireSession())) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await req.json();
  const pieces = await prisma.piece.findMany({ where: { collectionId: id } });
  await deleteBlobAssets(pieces.flatMap((p) => [p.viewerUrl, p.thumbUrl, p.pngUrl]));
  await prisma.collection.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
