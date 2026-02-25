import { notFound } from 'next/navigation';
import { getCollection } from '@/lib/data';
import { CollectionScan } from '@/components/collection-scan';
import { dividerMap, headerVariants } from '@/lib/utils';

export default async function CollectionPage({ params }: { params: { slug: string } }) {
  const collection = await getCollection(params.slug);
  if (!collection) return notFound();

  return (
    <section className="frame" style={{ ['--accent' as string]: collection.accentColor }}>
      <div className="banner">{headerVariants[collection.headerStyle] ?? headerVariants.stack}</div>
      <p>{collection.ident} | {collection.title} | {collection.year}</p>
      <p>{dividerMap[collection.dividerSet] ?? dividerMap.pipe}</p>
      <CollectionScan pieces={collection.pieces} slug={collection.slug} />
    </section>
  );
}
