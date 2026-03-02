import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { deleteBlobAssets } from '@/lib/image-pipeline';

export async function POST(req: Request) {
  if (!(await requireSession())) return NextResponse.json({ ok: false }, { status: 401 });
  const { pieceId } = await req.json();
  const piece = await prisma.piece.findUnique({ where: { pieceId } });
  if (!piece) return NextResponse.json({ ok: false }, { status: 404 });
  await deleteBlobAssets([piece.viewerUrl, piece.thumbUrl, piece.pngUrl]);
  await prisma.piece.delete({ where: { pieceId } });
  return NextResponse.json({ ok: true });
}
