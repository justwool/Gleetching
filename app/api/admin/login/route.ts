import { NextResponse } from 'next/server';
import { createSession } from '@/lib/auth';

export async function POST(req: Request) {
  const body = await req.json();
  if (!process.env.ADMIN_PASSWORD || body.password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  await createSession();
  return NextResponse.json({ ok: true });
}
