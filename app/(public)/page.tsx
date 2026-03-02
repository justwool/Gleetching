import Link from 'next/link';
import { getCollections } from '@/lib/data';
import { dividerMap, headerVariants } from '@/lib/utils';

type CollectionRow = {
  id: string;
  slug: string;
  ident: string;
  title: string;
  year: number;
  tags: string[];
  _count: { pieces: number };
};

export default async function HomePage() {
  const collections = (await getCollections()) as CollectionRow[];

  return (
    <section className="frame">
      <div className="banner">{headerVariants.stack}</div>
      <div className="table-head">
        <span>IDX</span><span>IDENT</span><span>TITLE</span><span>COUNT</span><span>YEAR</span><span>TAGS</span>
      </div>
      {collections.map((col, index) => (
        <Link key={col.id} href={`/collection/${col.slug}`} className="table-row">
          <span>{String(index + 1).padStart(2, '0')}</span>
          <span>{col.ident}</span>
          <span>{col.title}</span>
          <span>{col._count.pieces}</span>
          <span>{col.year}</span>
          <span>{col.tags.join(', ')}</span>
        </Link>
      ))}
      <p className="motd">MOTD :: directory stable {dividerMap.pipe} rotate with purpose. / <Link href="/about">about</Link> / <Link href="/contact">contact</Link></p>
    </section>
  );
}
