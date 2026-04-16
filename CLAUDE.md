# CLAUDE.md - KioskoFlow

## Proyecto

- **Nombre**: KioskoFlow - Sistema de Gestión para Kioscos
- **Tipo**: Aplicación web fullstack Next.js
- **URL Producción**: https://kioskoflow.vercel.app/
- **Repositorio**: https://github.com/OmiwomiIt/kioskoflow
- **Stack**: Next.js 16 + React 19 + TypeScript + Tailwind 4 + Prisma 7 + Neon PostgreSQL

## Arquitectura

```
src/
├── app/                    # Next.js App Router
│   ├── api/              # API Routes (REST endpoints)
│   │   ├── auth/        # Login, logout, verify JWT
│   │   ├── clientes/    # CRUD clientes
│   │   ├── categorias/  # CRUD categorías
│   │   ├── productos/  # CRUD productos
│   │   ├── ventas/    # CRUD ventas
│   │   ├── caja/      # Cierre caja + PDF
│   │   ├── inventario/ # Reporte stock bajo
│   │   ├── usuarios/  # Gestión usuarios (admin)
│   │   └── admin/seed/ # Datos por defecto
│   ├── login/          # Página login
│   ├── clientes/       # UI clientes
│   ├── productos/     # UI productos
│   ├── ventas/        # UI ventas
│   ├── nueva/        # Nueva venta
│   ├── caja/        # Cierre caja
│   ├── inventario/  # Reporte inventario
│   └── usuarios/    # UI usuarios
├── components/
│   ├── ui/              # Componentes shadcn/ui
│   ├── layout.tsx        # Layout principal + nav
│   ├── barcode-scanner.tsx # Escáner códigos
│   └── modal.tsx        # Modal reutilizable
└── lib/
    ├── prisma.ts      # Cliente Prisma (Neon)
    ├── auth.ts      # Utilidad JWT
    ├── pdf.ts      # Generación PDF
    └── utils.ts    # Utilidades
```

## Modelos de Datos

### Usuario
- id, email, password, nombre, rol (ADMIN/USUARIO), activo

### Cliente
- id, nombre, email, telefono, direccion, usuarioId

### Categoria
- id, nombre, activo, usuarioId

### Producto
- id, nombre, descripcion, codigoBarra, stock (Float), tipo (AGUA/SODA/OTRO), presentacion
- precio, permiteFraccion, unidadMedida (KG/L), activo, usuarioId, categoriaId

### Venta
- id, numero (unique), clienteId, usuarioId, subtotal, iva, total, observaciones, estado (COMPLETADA/ANULADA)

### DetalleVenta
- id, ventaId, productoId, cantidad (Float), precioUnitario, total

### CierreCaja
- id, fecha, usuarioId, totalVentas, cantidadVentas, detalles (JSON)

## Features Implementadas

- Autenticación JWT con cookies httpOnly
- Roles ADMIN y USUARIO
- CRUD clientes, productos, categorías, ventas
- Escaneo de códigos de barras (html5-qrcode)
- Stock automático en ventas (transacción atómica)
- Cierre de caja con ventas del día
- Exportación PDF del cierre
- Reporte de inventario con stock bajo umbral
- Datos por defecto: 14 categorías + 127 productos
- UI móvil-first (bottom nav móvil, top tabs PC)
- **Venta por fracción**: productos KG/L con cantidad decimal
- **Búsqueda dinámica**: filtro al escribir en nueva venta

## Autenticación

- JWT en cookies (httpOnly, secure en producción)
- Roles: ADMIN (gestiona usuarios) y USUARIO
- Admin: admin@kioskoflow.com / admin123

## Conexión Neon

```
postgresql://neondb_owner:npg_X7rSOl2pLjPt@ep-floral-block-amkxw9i1-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## Scripts

```bash
npm run dev         # Desarrollo
npm run build      # Build producción
npm run postinstall # Regenerar Prisma client
npm run lint      # Linter
```