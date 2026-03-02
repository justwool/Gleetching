import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type SiteSettingsAccessor = {
  findUnique?: (arg: { where: { id: number } }) => Promise<{ figletFont?: string } | null>;
};

export async function GET() {
  const siteSettings = (prisma as unknown as { siteSettings?: SiteSettingsAccessor }).siteSettings;
  const settings = await siteSettings?.findUnique?.({ where: { id: 1 } }).catch(() => null);
  return NextResponse.json({ figletFont: settings?.figletFont ?? 'Standard' });
}
