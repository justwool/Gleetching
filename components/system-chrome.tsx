'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { renderBottomStrip, renderTopBanner, type ChromeContextState } from '@/lib/chrome/banner';

type Props = { children: React.ReactNode };

type ContextPatch = {
  accentColor?: string;
  dividerSet?: string;
  contextLabel?: string;
  contextHref?: string;
};

const notes = ['Context updated', 'Directory ready', 'State stable', 'Link established'];
const ChromeCtx = createContext<{ setContext: (patch: ContextPatch) => void }>({ setContext: () => undefined });

const routeMap: Record<string, { full: string; short: string }> = {
  '/': { full: 'directory/index', short: 'DIR' },
  '/about': { full: 'about/dossier', short: 'ABT' },
  '/contact': { full: 'contact/signal', short: 'CNTCT' },
  '/admin': { full: 'admin/transfer', short: 'ADM' }
};

function OverlayLinks({ segments, lineHeight, enlarge = false }: { segments: Array<{ key: string; href: string; row: number; colStart: number; colEnd: number }>; lineHeight: number; enlarge?: boolean }) {
  return (
    <>
      {segments.map((segment) => (
        <Link
          aria-label={`navigate-${segment.key}`}
          key={segment.key}
          href={segment.href}
          className="chrome-link-overlay"
          style={{
            top: `calc(${segment.row * lineHeight}em ${enlarge ? '- 0.2em' : ''})`,
            left: `${segment.colStart}ch`,
            width: `${Math.max(segment.colEnd - segment.colStart, 4)}ch`,
            height: `calc(${lineHeight}em ${enlarge ? '+ 0.4em' : ''})`
          }}
        />
      ))}
    </>
  );
}

export function SystemChrome({ children }: Props) {
  const pathname = usePathname();
  const [clock, setClock] = useState('00:00:00');
  const [status, setStatus] = useState('State stable');
  const [width, setWidth] = useState(1200);
  const [ctx, setCtx] = useState<ContextPatch>({});

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date().toLocaleTimeString('en-GB', { hour12: false })), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const resize = () => setWidth(window.innerWidth);
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    setStatus(notes[Math.floor(Math.random() * notes.length)]);
  }, [pathname]);

  const setContext = useCallback((patch: ContextPatch) => {
    setCtx((prev) => ({ ...prev, ...patch }));
  }, []);

  const routeInfo = useMemo(() => {
    if (routeMap[pathname]) return routeMap[pathname];
    if (pathname.startsWith('/collection/')) return { full: 'collection/scan', short: 'COL' };
    if (pathname.startsWith('/piece/')) return { full: 'piece/inspect', short: 'PCE' };
    if (pathname.startsWith('/viewer/')) return { full: 'viewer/frame', short: 'VWR' };
    return { full: pathname, short: 'DIR' };
  }, [pathname]);

  const contextHref = useMemo(() => {
    if (ctx.contextHref) return ctx.contextHref;
    if (pathname.startsWith('/collection/')) return '/';
    return undefined;
  }, [ctx.contextHref, pathname]);

  const chromeState: ChromeContextState = {
    routeLabel: routeInfo.full,
    shortRoute: routeInfo.short,
    contextLabel: ctx.contextLabel ?? (pathname === '/' ? 'ROOT' : 'UPLINK'),
    contextHref,
    dividerSet: ctx.dividerSet,
    status,
    time: clock
  };

  const top = renderTopBanner(width, chromeState);
  const bottom = renderBottomStrip(width, pathname.startsWith('/viewer/'));
  const lineHeight = 1.2;

  return (
    <ChromeCtx.Provider value={{ setContext }}>
      <div className="chrome-shell" style={{ ['--chrome-accent' as string]: ctx.accentColor ?? '#8eb8b8' }}>
        <header className={`chrome-top glyph-${top.glyphSet}`}>
          <div className="chrome-pre-wrap">
            <pre className="chrome-pre">{top.lines.join('\n')}</pre>
            <OverlayLinks segments={top.segments} lineHeight={lineHeight} enlarge={width < 760} />
          </div>
        </header>
        <main className="mainpane">{children}</main>
        <footer className="chrome-bottom">
          <div className="chrome-pre-wrap">
            <pre className="chrome-pre">{bottom.lines.join('\n')}</pre>
            <OverlayLinks segments={bottom.segments} lineHeight={lineHeight} enlarge />
          </div>
        </footer>
      </div>
    </ChromeCtx.Provider>
  );
}

export function useChromeContext() {
  return useContext(ChromeCtx);
}
