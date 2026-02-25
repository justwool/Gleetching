import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPieceById } from '@/lib/data';

export default async function PiecePage({ params }: { params: { id: string } }) {
  const piece = await getPieceById(params.id);
  if (!piece) return notFound();

  return (
    <section className="frame">
      <p>inspection:// {piece.title}</p>
      <p>pieceId {piece.pieceId}</p>
      <p>serial {piece.serial}</p>
      <p>captured {piece.capturedAt.toISOString()}</p>
      <div style={{ margin: '8px 0' }}>
        <Image src={piece.thumbUrl} width={280} height={280} alt={piece.title} unoptimized />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Link href={`/collection/${piece.collection.slug}`}>prev directory</Link>
        <Link href={`/viewer/${piece.collection.slug}?piece=${piece.pieceId}`}>open viewer</Link>
      </div>
    </section>
  );
}
