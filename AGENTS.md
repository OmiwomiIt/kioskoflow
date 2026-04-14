<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md - KioskoFlow

## Proyecto Info

- **App**: https://kioskoflow.vercel.app/
- **Repo**: https://github.com/OmiwomiIt/kioskoflow
- **Stack**: Next.js 16 + React 19 + TypeScript + Tailwind 4 + Prisma 7 + Neon PostgreSQL

## Tech Stack Versions

- Next.js 16.x (App Router)
- React 19.x
- TypeScript 5.x
- Tailwind CSS 4.x
- Prisma 7.x
- shadcn/ui
- jose + bcrypt (auth)

## Base de Datos

- **Proveedor**: Neon PostgreSQL
- **Connection String**: 
  ```
  postgresql://neondb_owner:npg_QcaTsu1POCr9@ep-aged-cloud-anjztkxc.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require
  ```
- **Esquema**: en `prisma/schema.prisma`

## Scripts npm

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "postinstall": "prisma generate"
}
```

## Errores Comunes y Soluciones

### Prisma Client no encontrado en Vercel

**Error**: `ReferenceError: PrismaClient is not defined`

**Causa**: Prisma 7.x no exporta correctamente en builds de Vercel.

**Solución**:
1. Ensure `package.json` tiene `"postinstall": "prisma generate"`
2. Regenerar: `npm run postinstall`

### Error 500 en producción

**Causa**: DATABASE_URL no configurada en Vercel.

**Solución**: Agregar en Vercel Settings → Environment Variables.

### Unique constraint failed on numero

**Error**: `Unique constraint failed on the fields: (\`numero\`)`

**Causa**: Número de presupuesto duplicado.

**Solución**: La función generateNumero en presupuestos/route.ts ahora verifica existence.

## Diseño UI

- **Colores**: sky-500 (#0ea5e9) para agua, orange-500 (#f97316) para soda
- **Font**: Inter
- **Moneda**: Pesos Argentinos ($AR)
- **Mobile-first**: Bottom nav en móvil, top tabs en PC
- **Botones táctiles**: h-11, h-12 para mejor touch

## Estructura Pages

```
/                     → Dashboard
/login               → Login
/clientes             → Lista clientes
/productos           → Lista productos
/presupuestos        → Lista presupuestos
/presupuestos/nuevo  → Nuevo presupuesto
/presupuestos/[id]   → Ver presupuesto
/usuarios           → Gestión usuarios (admin)
```

## Estructura API

```
/api/auth           → POST (login), GET (verify)
/api/auth/logout     → POST
/api/clientes       → GET, POST
/api/clientes/[id]  → GET, PUT, DELETE
/api/productos      → GET, POST
/api/productos/[id] → GET, PUT, DELETE
/api/presupuestos   → GET, POST
/api/presupuestos/[id] → GET, PUT, DELETE
/api/presupuestos/[id]/pdf → GET
/api/usuarios      → GET, POST (admin)
/api/usuarios/[id]  → PUT, DELETE (admin)
```

## Autenticación

- JWT en cookies (httpOnly)
- Roles: ADMIN, USUARIO
- Middleware protege rutas
- getUserFromRequest en lib/auth.ts

## Admin Setup

Crear en Neon SQL Editor:
```sql
INSERT INTO "Usuario" (email, password, nombre, rol, activo, "createdAt", "updatedAt") 
VALUES ('admin@kioskoflow.com', '$2b$10$...', 'Admin', 'ADMIN', true, NOW(), NOW());
```