'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { renderBottomStrip, type Run } from '@/lib/chrome/banner';

type Props = {
  children: React.ReactNode;
  initialWordmarks: { wide: string[]; mid: string[]; narrow: string[] };
  initialFont: string;
};

type ContextPatch = {
  accentColor?: string;
  dividerSet?: string;
  contextLabel?: string;
  contextHref?: string;
  figletFont?: string;
};

const notes = ['Context updated', 'Directory ready', 'State stable', 'Link established'];
const ChromeCtx = createContext<{ setContext: (patch: ContextPatch) => void }>({ setContext: () => undefined });

const routeMap: Record<string, { full: string; short: string }> = {
  '/': { full: 'directory/index', short: 'DIR' },
  '/about': { full: 'about/dossier', short: 'ABT' },
  '/contact': { full: 'contact/signal', short: 'CNTCT' },
  '/admin': { full: 'admin/transfer', short: 'ADM' }
};

function viewportBucket(width: number) {
  if (width < 550) return 40;
  if (width < 900) return 55;
  return 80;
}

function RunLine({ runs }: { runs: Run[] }) {
  return <div className="chrome-line">{runs.map((run, i) => run.href ? <Link key={`${run.text}-${i}`} href={run.href} className={`chrome-run chrome-${run.kind ?? 'plain'} chrome-link`}>{run.text}</Link> : <span key={`${run.text}-${i}`} className={`chrome-run chrome-${run.kind ?? 'plain'}`}>{run.text}</span>)}</div>;
}

export function SystemChromeClient({ children, initialWordmarks, initialFont }: Props) {
  const pathname = usePathname();
  const [clock, setClock] = useState('00:00:00');
  const [status, setStatus] = useState('State stable');
  const [ctx, setCtx] = useState<ContextPatch>({});
  const [bucket, setBucket] = useState(40);
  const [wordmarks, setWordmarks] = useState(initialWordmarks);

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date().toLocaleTimeString('en-GB', { hour12: false })), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const applyBucket = () => setBucket(viewportBucket(window.innerWidth));
    applyBucket();
    window.addEventListener('resize', applyBucket);
    return () => window.removeEventListener('resize', applyBucket);
  }, []);

  useEffect(() => {
    setStatus(notes[Math.floor(Math.random() * notes.length)]);
  }, [pathname]);

  useEffect(() => {
    const activeFont = ctx.figletFont ?? initialFont;
    fetch(`/api/wordmark?font=${encodeURIComponent(activeFont)}&text=gleetching`)
      .then((res) => res.json())
      .then((payload) => setWordmarks(payload.wordmarks ?? initialWordmarks))
      .catch(() => setWordmarks(initialWordmarks));
  }, [ctx.figletFont, initialFont, initialWordmarks]);

  useEffect(() => {
    const onFontChange = ((event: CustomEvent<{ figletFont: string }>) => {
      setCtx((prev) => ({ ...prev, figletFont: event.detail.figletFont }));
    }) as EventListener;
    window.addEventListener('figlet-font-change', onFontChange);
    return () => window.removeEventListener('figlet-font-change', onFontChange);
  }, []);

  const setContext = useCallback((patch: ContextPatch) => setCtx((prev) => ({ ...prev, ...patch })), []);

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

  const compact = bucket === 40;
  const bottom = renderBottomStrip(bucket, pathname.startsWith('/viewer/'));

  return (
    <ChromeCtx.Provider value={{ setContext }}>
      <div className="chrome-shell" style={{ ['--chrome-accent' as string]: ctx.accentColor ?? '#8eb8b8' }}>
        <header className="chrome-top">
          <div className="chrome-top-grid">
            <div className="chrome-left"><Link href="/" className="chrome-link chrome-accent">{compact ? '[DIR]' : '[ARCHIVE/DIR]'}</Link></div>
            <div className="chrome-center">
              <div className="chrome-line"><Link href="/" className="chrome-link chrome-accent">GLEETCHING</Link><span className="chrome-run chrome-dim"> ░ </span><span className="chrome-run chrome-plain">{compact ? routeInfo.short : routeInfo.full}</span><span className="chrome-run chrome-dim"> ░ </span>{contextHref ? <Link href={contextHref} className="chrome-link chrome-accent">{ctx.contextLabel ?? 'UPLINK'}</Link> : <span className="chrome-run chrome-plain">{ctx.contextLabel ?? 'ROOT'}</span>}</div>
              <div className="chrome-line"><Link href="/about" className="chrome-link chrome-accent">{compact ? 'ABT' : 'ABOUT'}</Link><span className="chrome-run chrome-dim"> · </span><Link href="/contact" className="chrome-link chrome-accent">{compact ? 'CNTCT' : 'CONTACT'}</Link><span className="chrome-run chrome-dim"> · </span><Link href="/admin" className="chrome-link chrome-accent">{compact ? 'ADM' : 'ADMIN'}</Link><span className="chrome-run chrome-dim"> ░ </span><span className="chrome-run chrome-plain">{clock}</span><span className="chrome-run chrome-dim"> ░ </span><span className="chrome-run chrome-plain">{status}</span></div>
            </div>
            <div className="wordmarkSlot" aria-live="polite">
              <pre className="wordmarkVariant wordmarkWide">{wordmarks.wide.join('\n')}</pre>
              <pre className="wordmarkVariant wordmarkMid">{wordmarks.mid.join('\n')}</pre>
              <pre className="wordmarkVariant wordmarkNarrow">{wordmarks.narrow.join('\n')}</pre>
            </div>
          </div>
        </header>
        <main className="mainpane">{children}</main>
        <footer className="chrome-bottom"><div className="chrome-lines-wrap">{bottom.lines.map((line, idx) => <RunLine key={`bottom-${idx}`} runs={line} />)}</div></footer>
      </div>
    </ChromeCtx.Provider>
  );
}

export function useChromeContext() {
  return useContext(ChromeCtx);
}
