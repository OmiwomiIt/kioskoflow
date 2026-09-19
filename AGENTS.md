<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md - KioskoFlow

Management system for kiosks & retail stores.

## Architecture & Subpackages

- **Root app (`/`)**: Main Next.js 16 App Router application (`src/app`).
- **Landing page (`/landing-page`)**: Independent Next.js project with its own `package.json` and standalone config.
- **Database**: Prisma 7 + Neon PostgreSQL (`src/lib/prisma.ts` uses `@prisma/adapter-neon` with `ws` websockets).

## Developer Commands

### Root Application
- `npm run dev`: Start Next.js dev server
- `npm run build`: Production build
- `npm run lint`: Run ESLint
- `npx tsc --noEmit`: Typecheck root project
- `npm run postinstall`: Generate Prisma client (`prisma generate`)

### Landing Page (`/landing-page`)
- `npm run dev`: Start landing page dev server (`workdir="landing-page"`)
- `npm run build`: Build landing page (`workdir="landing-page"`)
- `npm run lint`: Lint landing page (`workdir="landing-page"`)
- `npx tsc --noEmit`: Typecheck landing page (`workdir="landing-page"`)

## Environment & Database

- Required environment variables in `.env`:
  - `DATABASE_URL`: PostgreSQL connection string (Neon pooled endpoint)
  - `JWT_SECRET`: Secret key for session JWTs
- Schema location: `prisma/schema.prisma`
- Re-generate Prisma Client: `npm run postinstall` (required whenever `prisma/schema.prisma` changes or `PrismaClient` is missing)
- Seed endpoint: `POST /api/admin/seed`

## Critical Conventions & Domain Quirks

- **Auth & Route Protection**: `src/middleware.ts` checks `auth-token` HTTP cookie using `jose`.
  - Public paths: `/login`, `/api/auth` (except `/api/auth/logout`). `/landing` is listed but does not exist in the main app (landing page is a separate project).
  - Default Admin credentials: `admin@kioskoflow.com` / `admin123` (Roles: `ADMIN`, `USUARIO`).
- **Prisma Client**: Import `prisma` from `@/lib/prisma` (uses Neon adapter + global caching).
- **Fractional Sales**: `Producto.permiteFraccion` allows decimal quantities (`Float` for stock & `DetalleVenta.cantidad`).
- **Atomic Sales**: Creating a sale (`POST /api/ventas`) automatically decrements stock inside a database transaction.