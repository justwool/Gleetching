import { prisma } from '@/lib/prisma';
import { normalizeFont } from '@/lib/chrome/fonts';
import { renderWordmarkVariants } from '@/lib/chrome/wordmark.server';
import { SystemChromeClient } from '@/components/system-chrome-client';

export async function SystemChromeServer({ children }: { children: React.ReactNode }) {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  const initialFont = normalizeFont(settings?.figletFont);
  const initialWordmarks = renderWordmarkVariants('gleetching', initialFont);

  return <SystemChromeClient initialWordmarks={initialWordmarks} initialFont={initialFont}>{children}</SystemChromeClient>;
}
