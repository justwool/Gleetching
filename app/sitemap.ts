import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const [collections, pieces] = await Promise.all([
    prisma.collection.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.piece.findMany({ select: { pieceId: true, capturedAt: true } })
  ]);

  return [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/about`, lastModified: new Date() },
    { url: `${base}/contact`, lastModified: new Date() },
    ...collections.map((collection) => ({ url: `${base}/collection/${collection.slug}`, lastModified: collection.updatedAt })),
    ...pieces.map((piece) => ({ url: `${base}/piece/${piece.pieceId}`, lastModified: piece.capturedAt }))
  ];
}
