/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */

type GenericClient = Record<string, any>;

const globalForPrisma = globalThis as unknown as { prisma?: GenericClient };

const mock: GenericClient = new Proxy(
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

let prismaClient: GenericClient;
try {
  const runtime = require('@prisma/client') as { PrismaClient?: new (...args: any[]) => GenericClient };
  if (!runtime.PrismaClient) throw new Error('missing PrismaClient');
  prismaClient = globalForPrisma.prisma ?? new runtime.PrismaClient({ log: ['error'] });
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient;
} catch {
  prismaClient = mock;
}

export const prisma = prismaClient;
