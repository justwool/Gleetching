import { cache } from 'react';
import { prisma } from '@/lib/prisma';

export const getCollections = cache(async () =>
  prisma.collection.findMany({
    include: { _count: { select: { pieces: true } } },
    orderBy: { order: 'asc' }
  })
);

export const getCollection = cache(async (slug: string) =>
  prisma.collection.findUnique({
    where: { slug },
    include: {
      pieces: {
        orderBy: { capturedAt: 'desc' },
        select: { id: true, pieceId: true, serial: true, title: true, capturedAt: true, thumbUrl: true }
      }
    }
  })
);

export const getPieceById = cache(async (pieceId: string) =>
  prisma.piece.findUnique({
    where: { pieceId },
    include: { collection: true }
  })
);
