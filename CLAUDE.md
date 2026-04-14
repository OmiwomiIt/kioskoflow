# CLAUDE.md - Proyecto KioskoFlow

## Información del Proyecto

- **Nombre**: KioskoFlow - Sistema de Gestión para Kioscos
- **Tipo**: Aplicación web fullstack Next.js
- **URL Producción**: https://kioskoflow.vercel.app/
- **Repositorio**: https://github.com/OmiwomiIt/kioskoflow

## Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- Prisma ORM 7
- Neon PostgreSQL
- jsPDF + jspdf-autotable
- shadcn/ui
- bcrypt + jose (JWT)

## Estructura del Proyecto

```
soderia/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout con AuthProvider
│   │   ├── page.tsx            # Dashboard
│   │   ├── login/              # Página login
│   │   ├── clientes/           # CRUD clientes
│   │   ├── productos/          # CRUD productos
│   │   ├── presupuestos/       # CRUD presupuestos
│   │   ├── usuarios/           # Gestión usuarios (admin)
│   │   └── api/               # Endpoints API
│   ├── components/
│   │   ├── ui/               # Componentes shadcn
│   │   ├── auth/              # Provider autenticación
│   │   ├── layout.tsx          # Layout principal
│   │   └── modal.tsx          # Modal reutilizable
│   └── lib/
│       ├── prisma.ts           # Cliente Prisma
│       ├── auth.ts            # Utilidad JWT
│       └── pdf.ts             # Generación PDF
├── prisma/
│   ├── schema.prisma          # Modelos de datos
│   └── seed.ts               # Seed datos
├── .env                     # Variables entorno
├── package.json             # Dependencias
└── vercel.json             # Config Vercel
```

## Comandos Útiles

```bash
# Desarrollo local
npm run dev

# Build producción
npm run build

# Regenerar Prisma client
npm run postinstall
```

## Modelos de Datos

- **Usuario**: id, email, password, nombre, rol (ADMIN/USUARIO), activo
- **Cliente**: nombre, email, telefono, direccion, usuarioId
- **Producto**: nombre, descripcion, tipo (AGUA/SODA), presentacion, precio, activo, usuarioId
- **Presupuesto**: numero, clienteId, usuarioId, subtotal, iva, total, observaciones, estado
- **DetallePresupuesto**: presupuestoId, productoId, cantidad, precioUnitario, total

## Autenticación

- JWT en cookies (httpOnly, secure en producción)
- Roles: ADMIN (gestiona usuarios) y USUARIO (solo ve sus datos)
- Middleware protege rutas `/api/*` y páginas

## UI Móvil-First

- Mobile: Bottom navigation
- Desktop: Top tabs
- Colores: sky-500 (primary), orange-500 (secondary)
- Botones táctiles grandes

## Notas Importantes

1. **Prisma 7**: `postinstall` regenera el cliente
2. **Vercel**: Requiere DATABASE_URL y JWT_SECRET
3. **Moneda**: Pesos Argentinos ($AR)
4. **Estados**: BORRADOR, ENVIADO, ACEPTADO, RECHAZADO
5. **Admin**: Crear manualmente en Neon SQL Editor