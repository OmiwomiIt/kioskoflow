<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md - KioskoFlow

## Proyecto

- **App**: https://kioskoflow.vercel.app/
- **Repo**: https://github.com/OmiwomiIt/kioskoflow
- **Stack**: Next.js 16 + React 19 + TypeScript + Tailwind 4 + Prisma 7 + Neon PostgreSQL

## Tech Stack

- Next.js 16.x (App Router)
- React 19.x
- TypeScript 5.x
- Tailwind CSS 4.x
- Prisma 7.x
- shadcn/ui
- jose + bcrypt (auth)
- html5-qrcode (escáner)

## Base de Datos

- **Proveedor**: Neon PostgreSQL
- **Connection String**: 
  ```
  postgresql://neondb_owner:npg_X7rSOl2pLjPt@ep-floral-block-amkxw9i1-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require
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

### Prisma Client no encontrado

**Error**: `ReferenceError: PrismaClient is not defined`

**Solución**: `npm run postinstall`

### Error 500 en producción

**Causa**: DATABASE_URL no configurada en Vercel

**Solución**: Agregar en Vercel Settings → Environment Variables

### Número de venta duplicado

**Error**: `Unique constraint failed on the fields: (numero)`

**Solución**: La función generateNumero verifica existencia antes de crear

## Diseño UI

- **Colores**: sky-500 (#0ea5e9) agua, orange-500 (#f97316) soda
- **Font**: Inter
- **Moneda**: Pesos Argentinos ($AR)
- **Mobile-first**: Bottom nav en móvil, top nav en PC
- **Botones táctiles**: h-11, h-12

## Estructura Pages

```
/                     → Dashboard
/login               → Login
/clientes             → Lista clientes
/productos           → Productos (fracción + escáner)
/ventas              → Lista ventas
/ventas/nueva        → Nueva venta (búsqueda dinámica)
/ventas/[id]         → Ver venta
/caja                → Cierre caja + PDF
/inventario          → Reporte stock
/usuarios           → Gestión usuarios (admin)
```

## Estructura API

```
/api/auth           → POST (login), GET (verify)
/api/auth/logout     → POST
/api/clientes       → GET, POST
/api/clientes/[id]  → GET, PUT, DELETE
/api/categorias     → GET, POST
/api/categorias/[id] → DELETE
/api/productos      → GET, POST
/api/productos/[id] → GET, PUT, DELETE
/api/ventas         → GET, POST
/api/ventas/[id]    → GET, PUT, DELETE
/api/ventas/[id]/pdf → GET
/api/caja           → GET, POST
/api/caja/[id]/pdf  → GET
/api/inventario     → GET
/api/usuarios       → GET, POST (admin)
/api/usuarios/[id]  → PUT, DELETE (admin)
/api/admin/seed     → POST
```

## Autenticación

- JWT en cookies (httpOnly)
- Roles: ADMIN, USUARIO
- Middleware protege rutas
- getUserFromRequest en lib/auth.ts

## Features

### Venta por Fracción
- Campo `permiteFraccion: Boolean` en modelo Producto
- Campo `unidadMedida: String` (KG/L)
- Campo `stock` y `DetalleVenta.cantidad` son Float
- Input decimal en nueva venta para productos fraccionables

### Búsqueda Dinámica
- Productos filtra al escribir en el buscador
- Filtra por nombre, código o presentación
- Soporta escaneo de código de barras

## Admin Setup

```sql
INSERT INTO "Usuario" (email, password, nombre, rol, activo, "createdAt", "updatedAt") 
VALUES ('admin@kioskoflow.com', '$2b$10$...', 'Admin', 'ADMIN', true, NOW(), NOW());
```

Credentials: admin@kioskoflow.com / admin123