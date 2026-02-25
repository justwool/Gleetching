'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';

type Props = {
  children: React.ReactNode;
};

const notes = ['Context updated', 'Directory ready', 'State stable', 'Link established'];

export function SystemChrome({ children }: Props) {
  const pathname = usePathname();
  const [clock, setClock] = useState('');
  const [status, setStatus] = useState('State stable');
  const [idleFlag, setIdleFlag] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date().toLocaleTimeString('en-GB', { hour12: false })), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setStatus(notes[Math.floor(Math.random() * notes.length)]);
  }, [pathname]);

  useEffect(() => {
    let short: ReturnType<typeof setTimeout>;
    let long: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(short);
      clearTimeout(long);
      setIdleFlag('');
      short = setTimeout(() => setIdleFlag('cursor drift recalibrated'), 8000);
      long = setTimeout(() => setIdleFlag('anomaly quiet / monitored'), 24000);
    };
    reset();
    window.addEventListener('mousemove', reset);
    window.addEventListener('keydown', reset);
    return () => {
      clearTimeout(short);
      clearTimeout(long);
      window.removeEventListener('mousemove', reset);
      window.removeEventListener('keydown', reset);
    };
  }, []);

  const routeLabel = useMemo(() => pathname === '/' ? 'root/index' : pathname.replaceAll('/', ' / ').slice(1), [pathname]);

  return (
    <>
      <header className="statusbar">
        <div>gleetching</div>
        <div>{routeLabel} :: {status}</div>
        <div>{clock} / online</div>
      </header>
      <main className="mainpane">{children}</main>
      <footer className="commandbar">
        <div>↑↓ move / enter open / esc close / tab shift mode</div>
        <div>{idleFlag || 'commands armed'}</div>
      </footer>
    </>
  );
}
