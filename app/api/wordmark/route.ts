import { NextResponse } from 'next/server';
import { normalizeFont } from '@/lib/chrome/fonts';
import { renderWordmark, wordmarkMetrics } from '@/lib/chrome/wordmark.server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get('text') || 'gleetching';
  const font = normalizeFont(searchParams.get('font') || 'Small');
  const lines = renderWordmark(text, font);
  const { wmRows, wmCols } = wordmarkMetrics(lines);
  return NextResponse.json({ lines, wmRows, wmCols });
}
