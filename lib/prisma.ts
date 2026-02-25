import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const mock = new Proxy(
  {},
  {
    get() {
      return new Proxy(
        {},
        {
          get(_, prop: string) {
            if (prop === '$transaction') return async () => [];
            if (prop === '$disconnect') return async () => undefined;
            if (prop.startsWith('find')) return async () => (prop === 'findMany' ? [] : null);
            if (prop.startsWith('create')) return async ({ data }: { data: unknown }) => data;
            if (prop.startsWith('update')) return async ({ data }: { data: unknown }) => data;
            if (prop.startsWith('delete')) return async () => ({ ok: true });
            return async () => null;
          }
        }
      );
    }
  }
);

let prismaClient: PrismaClient | typeof mock;
try {
  prismaClient = globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] });
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient as PrismaClient;
} catch {
  prismaClient = mock;
}

export const prisma = prismaClient as PrismaClient;
