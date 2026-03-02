import { prisma } from '@/lib/prisma';
import { normalizeFont } from '@/lib/chrome/fonts';
import { renderWordmark, wordmarkMetrics } from '@/lib/chrome/wordmark.server';
import { SystemChromeClient } from '@/components/system-chrome-client';

type SiteSettingsAccessor = {
  findUnique?: (arg: { where: { id: number } }) => Promise<{ figletFont?: string; wordmarkPlacement?: string; wordmarkBarFollowsFiglet?: boolean } | null>;
};

export async function SystemChromeServer({ children }: { children: React.ReactNode }) {
  const siteSettings = (prisma as unknown as { siteSettings?: SiteSettingsAccessor }).siteSettings;
  const settings = await siteSettings?.findUnique?.({ where: { id: 1 } }).catch(() => null);
  const initialFont = normalizeFont(settings?.figletFont);
  const lines = renderWordmark('gleetching', initialFont);
  const { wmRows, wmCols } = wordmarkMetrics(lines);

  return (
    <SystemChromeClient
      initialFont={initialFont}
      initialWordmark={lines}
      initialMetrics={{ wmRows, wmCols }}
      wordmarkPlacement={settings?.wordmarkPlacement ?? 'RIGHT'}
      wordmarkBarFollowsFiglet={settings?.wordmarkBarFollowsFiglet ?? true}
    >
      {children}
    </SystemChromeClient>
  );
}
