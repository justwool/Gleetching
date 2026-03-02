import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { processUpload } from '@/lib/image-pipeline';

export async function POST(req: Request) {
  if (!(await requireSession())) return NextResponse.json({ ok: false }, { status: 401 });
  const form = await req.formData();
  const collectionId = String(form.get('collectionId'));
  const file = form.get('file');
  const title = String(form.get('title') || 'untitled');

  if (!(file instanceof File)) return NextResponse.json({ ok: false, line: 'ERR invalid file' }, { status: 400 });

  const processed = await processUpload(file);
  const exists = await prisma.piece.findUnique({ where: { pieceId: processed.pieceId } });
  if (exists) return NextResponse.json({ ok: true, line: `SKIP ${processed.pieceId.slice(0, 12)} duplicate` });

  await prisma.piece.create({ data: { ...processed, title, collectionId, capturedAt: new Date() } });
  return NextResponse.json({ ok: true, line: `OK ${processed.pieceId.slice(0, 12)} stored` });
}
