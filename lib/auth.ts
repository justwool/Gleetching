import crypto from 'crypto';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const SESSION_KEY = 'gleetching_session';

export async function createSession() {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);

  await prisma.session.create({ data: { token, expiresAt } });
  cookies().set(SESSION_KEY, token, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', expires: expiresAt, path: '/' });
}

export async function clearSession() {
  const token = cookies().get(SESSION_KEY)?.value;
  if (token) await prisma.session.deleteMany({ where: { token } });
  cookies().delete(SESSION_KEY);
}

export async function requireSession() {
  const token = cookies().get(SESSION_KEY)?.value;
  if (!token) return false;

  const session = await prisma.session.findFirst({ where: { token, expiresAt: { gt: new Date() } } });
  return Boolean(session);
}
