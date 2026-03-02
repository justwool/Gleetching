import { NextResponse } from 'next/server';
import { normalizeFont } from '@/lib/chrome/fonts';
import { renderWordmarkVariants } from '@/lib/chrome/wordmark.server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get('text') || 'gleetching';
  const font = normalizeFont(searchParams.get('font') || 'Small');
  return NextResponse.json({ wordmarks: renderWordmarkVariants(text, font) });
}
