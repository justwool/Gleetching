import type { Metadata } from 'next';
import './globals.css';
import { SystemChrome } from '@/components/system-chrome';
import { SoundCue } from '@/components/sound';

export const metadata: Metadata = {
  title: 'gleetching // archive workstation',
  description: 'Procedural archive workstation for art collections',
  openGraph: {
    title: 'gleetching archive',
    description: 'Terminal-indexed personal archive workstation'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-crt="LOW">
      <body>
        <SystemChrome>
          <SoundCue />
          {children}
        </SystemChrome>
      </body>
    </html>
  );
}
