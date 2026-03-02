'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { renderBottomStrip, renderTopBanner, type ChromeContextState, type Run } from '@/lib/chrome/banner';

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

function RunLine({ runs }: { runs: Run[] }) {
  return (
    <div className="chrome-line">
      {runs.map((run, index) => {
        const className = `chrome-run chrome-${run.kind ?? 'plain'}`;
        return run.href ? (
          <Link key={`${run.text}-${index}`} href={run.href} className={`${className} chrome-link`}>{run.text}</Link>
        ) : (
          <span key={`${run.text}-${index}`} className={className}>{run.text}</span>
        );
      })}
    </div>
  );
}

export function SystemChrome({ children }: Props) {
  const pathname = usePathname();
  const [clock, setClock] = useState('00:00:00');
  const [status, setStatus] = useState('State stable');
  const [cols, setCols] = useState(120);
  const [ctx, setCtx] = useState<ContextPatch>({});
  const topWrapRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date().toLocaleTimeString('en-GB', { hour12: false })), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const measure = () => {
      const wrap = topWrapRef.current;
      const probe = probeRef.current;
      if (!wrap || !probe) return;
      const containerWidthPx = wrap.getBoundingClientRect().width;
      const probeWidthPx = probe.getBoundingClientRect().width;
      const charWidthPx = probeWidthPx > 0 ? probeWidthPx / 10 : 8;
      setCols(Math.max(32, Math.floor(containerWidthPx / Math.max(charWidthPx, 1))));
    };

    measure();
    const observer = new ResizeObserver(measure);
    if (topWrapRef.current) observer.observe(topWrapRef.current);
    document.fonts?.ready.then(measure).catch(() => null);
    window.addEventListener('resize', measure);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
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

  const top = renderTopBanner(cols, chromeState);
  const bottom = renderBottomStrip(cols, pathname.startsWith('/viewer/'));

  return (
    <ChromeCtx.Provider value={{ setContext }}>
      <div className="chrome-shell" style={{ ['--chrome-accent' as string]: ctx.accentColor ?? '#8eb8b8' }}>
        <header className={`chrome-top glyph-${top.glyphSet}`}>
          <div className="chrome-lines-wrap" ref={topWrapRef}>
            <span className="chrome-probe" ref={probeRef} aria-hidden>MMMMMMMMMM</span>
            {top.lines.map((line, idx) => <RunLine key={`top-${idx}`} runs={line} />)}
          </div>
        </header>
        <main className="mainpane">{children}</main>
        <footer className="chrome-bottom">
          <div className="chrome-lines-wrap">
            {bottom.lines.map((line, idx) => <RunLine key={`bottom-${idx}`} runs={line} />)}
          </div>
        </footer>
      </div>
    </ChromeCtx.Provider>
  );
}

export function useChromeContext() {
  return useContext(ChromeCtx);
}
