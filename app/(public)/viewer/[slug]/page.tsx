'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ChromeContextSync } from '@/components/chrome/chrome-context-sync';

type Item = { pieceId: string; title: string; viewerUrl: string; serial: string };

export default function ViewerPage({ params, searchParams }: { params: { slug: string }; searchParams: { index?: string; piece?: string; ds?: string; ac?: string; ctx?: string; ff?: string } }) {
  const [items, setItems] = useState<Item[]>([]);
  const [index, setIndex] = useState(Number(searchParams.index ?? 0));

  useEffect(() => {
    fetch(`/api/settings?slug=${params.slug}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items || []);
        if (searchParams.piece) {
          const found = data.items.findIndex((i: Item) => i.pieceId === searchParams.piece);
          if (found >= 0) setIndex(found);
        }
      });
  }, [params.slug, searchParams.piece]);

  const current = items[index];
  if (!current) return <section className="frame">viewer offline</section>;

  return (
    <section className="viewer-wrap" onKeyDown={(e) => {
      if (e.key === 'ArrowRight') setIndex((n) => Math.min(items.length - 1, n + 1));
      if (e.key === 'ArrowLeft') setIndex((n) => Math.max(0, n - 1));
    }} tabIndex={0}>
      <ChromeContextSync
        accentColor={searchParams.ac ? decodeURIComponent(searchParams.ac) : undefined}
        dividerSet={searchParams.ds}
        contextLabel={searchParams.ctx ? decodeURIComponent(searchParams.ctx) : params.slug}
        contextHref={`/collection/${params.slug}`}
        figletFont={searchParams.ff}
      />
      <div className="viewer-frame">
        <Image src={current.viewerUrl} alt={current.title} width={1024} height={768} unoptimized style={{ width: '100%', height: 'auto' }} />
        <p>{current.serial} / {current.pieceId.slice(0, 12)} / {current.title}</p>
      </div>
    </section>
  );
}
