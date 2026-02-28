# gleetching // procedural archive workstation

Production-ready Next.js 14 App Router art portfolio designed as a dense terminal archive surface.

## Stack
- Next.js 14 + TypeScript
- Prisma + Vercel Postgres
- Vercel Blob
- sharp image pipeline
- @tanstack/react-virtual for scan list virtualization

## Local setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local`:
   ```env
   POSTGRES_PRISMA_URL="postgres://..."
   POSTGRES_URL_NON_POOLING="postgres://..."
   BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
   ADMIN_PASSWORD="change-me"
   NEXT_PUBLIC_SITE_URL="http://localhost:3000"
   ```
3. Run migrations:
   ```bash
   npm run prisma:dev
   ```
4. Start dev server:
   ```bash
   npm run dev
   ```

## Deploy on Vercel
- Connect repo in Vercel.
- Attach Vercel Postgres and Blob storage.
- Add env vars above.
- Deploy; `postinstall` runs `prisma generate`.
- Run `npm run prisma:migrate` via Vercel build command or one-time deploy hook.

## Admin flow
- Visit `/admin` and login with `ADMIN_PASSWORD`.
- Create collection identity (ident/title/year/tags/theme vars).
- Upload pieces (original is processed to viewer/thumb/png derivatives and never stored).
- Delete piece/collection from terminal controls.

## Design controls
- CRT intensity: OFF / LOW / HIGH
- Optional sound cue toggle (persisted in localStorage)
- Thumbs ON/OFF in collection scan

