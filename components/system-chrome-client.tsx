'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { renderBottomStrip, type Run } from '@/lib/chrome/banner';

type Props = {
  children: React.ReactNode;
  initialWordmark: string[];
  initialFont: string;
  initialMetrics: { wmRows: number; wmCols: number };
  wordmarkPlacement: string;
  wordmarkBarFollowsFiglet: boolean;
};

type ContextPatch = { accentColor?: string; dividerSet?: string; contextLabel?: string; contextHref?: string; figletFont?: string };
const notes = ['Context updated', 'Directory ready', 'State stable', 'Link established'];
const ChromeCtx = createContext<{ setContext: (patch: ContextPatch) => void }>({ setContext: () => undefined });
const routeMap: Record<string, { full: string; short: string }> = { '/': { full: 'directory/index', short: 'DIR' }, '/about': { full: 'about/dossier', short: 'ABT' }, '/contact': { full: 'contact/signal', short: 'CNTCT' }, '/admin': { full: 'admin/transfer', short: 'ADM' } };
const viewportBucket = (width: number) => (width < 550 ? 40 : width < 900 ? 55 : 80);

function RunLine({ runs }: { runs: Run[] }) {
  return <div className="chrome-line">{runs.map((run, i) => run.href ? <Link key={`${run.text}-${i}`} href={run.href} className={`chrome-run chrome-${run.kind ?? 'plain'} chrome-link`}>{run.text}</Link> : <span key={`${run.text}-${i}`} className={`chrome-run chrome-${run.kind ?? 'plain'}`}>{run.text}</span>)}</div>;
}

export function SystemChromeClient({ children, initialWordmark, initialFont, initialMetrics, wordmarkPlacement, wordmarkBarFollowsFiglet }: Props) {
  const pathname = usePathname();
  const [clock, setClock] = useState('00:00:00');
  const [status, setStatus] = useState('State stable');
  const [ctx, setCtx] = useState<ContextPatch>({});
  const [bucket, setBucket] = useState(40);
  const [wordmark, setWordmark] = useState(initialWordmark);
  const [metrics, setMetrics] = useState(initialMetrics);

  useEffect(() => { const t = setInterval(() => setClock(new Date().toLocaleTimeString('en-GB', { hour12: false })), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { const apply = () => setBucket(viewportBucket(window.innerWidth)); apply(); window.addEventListener('resize', apply); return () => window.removeEventListener('resize', apply); }, []);
  useEffect(() => { setStatus(notes[Math.floor(Math.random() * notes.length)]); }, [pathname]);

  useEffect(() => {
    const activeFont = ctx.figletFont ?? initialFont;
    fetch(`/api/wordmark?font=${encodeURIComponent(activeFont)}&text=gleetching`)
      .then((res) => res.json())
      .then((payload) => {
        setWordmark(payload.lines ?? initialWordmark);
        setMetrics({ wmRows: payload.wmRows ?? initialMetrics.wmRows, wmCols: payload.wmCols ?? initialMetrics.wmCols });
      })
      .catch(() => {
        setWordmark(initialWordmark);
        setMetrics(initialMetrics);
      });
  }, [ctx.figletFont, initialFont, initialWordmark, initialMetrics]);

  useEffect(() => {
    const onFontChange = ((event: CustomEvent<{ figletFont: string }>) => setCtx((prev) => ({ ...prev, figletFont: event.detail.figletFont }))) as EventListener;
    window.addEventListener('figlet-font-change', onFontChange);
    return () => window.removeEventListener('figlet-font-change', onFontChange);
  }, []);

  const setContext = useCallback((patch: ContextPatch) => setCtx((prev) => ({ ...prev, ...patch })), []);
  const routeInfo = useMemo(() => routeMap[pathname] ?? (pathname.startsWith('/collection/') ? { full: 'collection/scan', short: 'COL' } : pathname.startsWith('/piece/') ? { full: 'piece/inspect', short: 'PCE' } : pathname.startsWith('/viewer/') ? { full: 'viewer/frame', short: 'VWR' } : { full: pathname, short: 'DIR' }), [pathname]);
  const contextHref = useMemo(() => ctx.contextHref ?? (pathname.startsWith('/collection/') ? '/' : undefined), [ctx.contextHref, pathname]);

  const compact = bucket === 40;
  const bottom = renderBottomStrip(bucket, pathname.startsWith('/viewer/'));
  const topHeight = `calc(var(--wmRows) * 1em * var(--lh) + var(--padY) * 2)`;

  return (
    <ChromeCtx.Provider value={{ setContext }}>
      <div className="chrome-shell" style={{ ['--chrome-accent' as string]: ctx.accentColor ?? '#8eb8b8', ['--topH' as string]: topHeight }}>
        <header className="chrome-top" style={{ ['--wmRows' as string]: String(wordmarkBarFollowsFiglet ? metrics.wmRows : 1), ['--wmCols' as string]: String(metrics.wmCols), ['--lh' as string]: '1', ['--padY' as string]: '6px', height: topHeight, minHeight: topHeight }}>
          <div className="chrome-top-scroll">
            <div className="chrome-top-inner" style={{ minWidth: `calc(var(--wmCols) * 1ch + 44ch)` }}>
              <div className="chrome-leftFill">
                <div className="chrome-line"><Link href="/" className="chrome-link chrome-accent">{compact ? '[DIR]' : '[ARCHIVE/DIR]'}</Link><span className="chrome-run chrome-dim"> ░ </span><span className="chrome-run chrome-plain">{compact ? routeInfo.short : routeInfo.full}</span><span className="chrome-run chrome-dim"> ░ </span>{contextHref ? <Link href={contextHref} className="chrome-link chrome-accent">{ctx.contextLabel ?? 'UPLINK'}</Link> : <span className="chrome-run chrome-plain">{ctx.contextLabel ?? 'ROOT'}</span>}</div>
                <div className="chrome-line"><Link href="/about" className="chrome-link chrome-accent">{compact ? 'ABT' : 'ABOUT'}</Link><span className="chrome-run chrome-dim"> · </span><Link href="/contact" className="chrome-link chrome-accent">{compact ? 'CNTCT' : 'CONTACT'}</Link><span className="chrome-run chrome-dim"> · </span><Link href="/admin" className="chrome-link chrome-accent">{compact ? 'ADM' : 'ADMIN'}</Link><span className="chrome-run chrome-dim"> ░ </span><span className="chrome-run chrome-plain">{clock}</span><span className="chrome-run chrome-dim"> ░ </span><span className="chrome-run chrome-plain">{status}</span></div>
              </div>
              <div className="wordmarkWrap" data-placement={wordmarkPlacement}>
                <div className="wordmarkSlot" aria-live="polite" style={{ width: 'calc(var(--wmCols) * 1ch)' }}>
                  <pre>{wordmark.join('\n')}</pre>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="mainpane">{children}</main>
        <footer className="chrome-bottom"><div className="chrome-lines-wrap">{bottom.lines.map((line, idx) => <RunLine key={`bottom-${idx}`} runs={line} />)}</div></footer>
      </div>
    </ChromeCtx.Provider>
  );
}

export function useChromeContext() { return useContext(ChromeCtx); }
