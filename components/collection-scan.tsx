'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useVirtualizer } from '@tanstack/react-virtual';

type Piece = { id: string; pieceId: string; serial: string; title: string; capturedAt: Date | string; thumbUrl: string };

export function CollectionScan({ pieces, slug, dividerSet, accentColor, contextLabel }: { pieces: Piece[]; slug: string; dividerSet: string; accentColor: string; contextLabel: string }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState(0);
  const [showThumbs, setShowThumbs] = useState(true);
  const rowVirtualizer = useVirtualizer({
    count: pieces.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 68,
    overscan: 8
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  const style = useMemo(() => ({ height: `${rowVirtualizer.getTotalSize()}px` }), [rowVirtualizer]);

  return (
    <section>
      <div className="toggles">
        <button onClick={() => document.documentElement.dataset.crt = 'OFF'}>CRT OFF</button>
        <button onClick={() => document.documentElement.dataset.crt = 'LOW'}>CRT LOW</button>
        <button onClick={() => document.documentElement.dataset.crt = 'HIGH'}>CRT HIGH</button>
        <button onClick={() => localStorage.setItem('sound', localStorage.getItem('sound') === '1' ? '0' : '1')}>SOUND</button>
        <button onClick={() => setShowThumbs((p) => !p)}>{showThumbs ? 'THUMBS OFF' : 'THUMBS ON'}</button>
      </div>
      <div className="scanframe" ref={parentRef} tabIndex={0} onKeyDown={(e) => {
        if (e.key === 'ArrowDown') setCursor((c) => Math.min(c + 1, pieces.length - 1));
        if (e.key === 'ArrowUp') setCursor((c) => Math.max(c - 1, 0));
      }}>
        <div style={style} className="virtual-shell">
          {virtualItems.map((row) => {
            const piece = pieces[row.index];
            const selected = row.index === cursor;
            return (
              <Link
                key={piece.id}
                href={`/piece/${piece.pieceId}`}
                className={`scanrow ${selected ? 'selected' : ''}`}
                style={{ transform: `translateY(${row.start}px)` }}
                onMouseEnter={() => setCursor(row.index)}
              >
                {showThumbs ? <Image src={piece.thumbUrl} alt={piece.title} width={52} height={52} unoptimized /> : <span className="thumb-off">░░</span>}
                <span>#{piece.serial.slice(-6)}</span>
                <span>{piece.pieceId.slice(0, 12)}</span>
                <span>{new Date(piece.capturedAt).toISOString().slice(0, 10)}</span>
                <span>{piece.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
      <Link href={`/viewer/${slug}?index=${cursor}&ds=${dividerSet}&ac=${encodeURIComponent(accentColor)}&ctx=${encodeURIComponent(contextLabel)}`} className="viewerlink">open viewer</Link>
    </section>
  );
}
