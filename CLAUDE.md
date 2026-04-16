# CLAUDE.md - KioskoFlow

## Proyecto

- **Nombre**: KioskoFlow - Sistema de Gestión para Kioscos
- **Tipo**: Aplicación web fullstack Next.js
- **URL Producción**: https://kioskoflow.vercel.app/
- **Repositorio**: https://github.com/OmiwomiIt/kioskoflow
- **Stack**: Next.js 16 + React 19 + TypeScript + Tailwind 4 + Prisma 7 + Neon PostgreSQL

## Estructura del Proyecto

```
src/
├── app/
│   ├── api/                    # Endpoints REST
│   │   ├── auth/              # Login, logout, verify
│   │   ├── clientes/          # CRUD clientes
│   │   ├── categorias/       # CRUD categorías
│   │   ├── productos/         # CRUD productos
│   │   ├── ventas/            # CRUD ventas
│   │   ├── caja/              # Cierre caja + PDF
│   │   ├── inventario/       # Reporte stock bajo
│   │   ├── usuarios/          # Gestión usuarios (admin)
│   │   └── admin/seed/        # Regenerar datos por defecto
│   ├── login/                  # Página login
│   ├── clientes/              # UI clientes
│   ├── productos/             # UI productos (con stock y escáner)
│   ├── ventas/                # UI ventas
│   ├── nueva/                 # Nueva venta (con escáner)
│   ├── caja/                  # Cierre de caja + PDF
│   ├── inventario/            # Reporte de stock
│   └── usuarios/              # UI gestión usuarios
├── components/
│   ├── ui/                    # Componentes shadcn
│   ├── auth/                  # Provider autenticación
│   ├── layout.tsx             # Layout principal (nav)
│   ├── barcode-scanner.tsx    # Escáner códigos de barra
│   └── modal.tsx              # Modal reutilizable
└── lib/
    ├── prisma.ts              # Cliente Prisma
    ├── auth.ts                # Utilidad JWT
    └── pdf.ts                 # Generación PDF
```

## Modelos de Datos

- **Usuario**: id, email, password, nombre, rol (ADMIN/USUARIO), activo
- **Cliente**: nombre, email, telefono, direccion
- **Categoria**: nombre, activo, usuarioId
- **Producto**: nombre, precio, costo, stock, stockMinimo, codigoBarra, categoriaId, activo
- **Venta**: numero, clienteId, usuarioId, subtotal, total, observaciones, estado (COMPLETADA/ANULADA)
- **DetalleVenta**: ventaId, productoId, cantidad, precioUnitario, total
- **CierreCaja**: usuarioId, fecha, total, ventas

## Features Implementadas

- Autenticación JWT con cookies httpOnly
- Roles ADMIN y USUARIO
- CRUD clientes, productos, categorías, ventas
- Escaneo de códigos de barra (BarcodeScanner con Quagga2)
- Stock automático en ventas (transacción atómica)
- Cierre de caja con ventas del día
- Exportación PDF del cierre
- Reporte de inventario con stock bajo umbral
- Datos por defecto: 14 categorías + 127 productos para usuarios nuevos
- UI móvil-first (bottom nav en móvil, top tabs en PC)

## Autenticación

- JWT en cookies (httpOnly, secure en producción)
- Roles: ADMIN (gestiona usuarios) y USUARIO
- Admin: admin@kioskoflow.com / admin123

## Conexión Neon

```
postgresql://neondb_owner:npg_X7rSOl2pLjPt@ep-floral-block-amkxw9i1-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## Comandos

```bash
npm run dev         # Desarrollo
npm run build       # Build producción
npm run postinstall # Regenerar Prisma client
npm run lint        # Linter
```