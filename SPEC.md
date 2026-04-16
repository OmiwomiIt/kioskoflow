# SPEC.md - KioskoFlow

Sistema de gestión para kioscos y multirubros.

## 1. Project Overview

- **Nombre**: KioskoFlow
- **Tipo**: Aplicación web fullstack
- **Funcionalidad**: Sistema de ventas con control de stock, cierre de caja y gestión de clientes
- **Target**: Kioscos, almacenes y multirubros
- **URL**: https://kioskoflow.vercel.app/
- **Stack**: Next.js 16 + React 19 + TypeScript + Tailwind 4 + Prisma 7 + Neon PostgreSQL

## 2. Tech Stack

- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: API Routes de Next.js
- **Database**: Neon PostgreSQL con Prisma ORM 7
- **PDF**: jsPDF + jspdf-autotable
- **UI**: shadcn/ui
- **Auth**: JWT (jose) + bcrypt
- **Scanner**: html5-qrcode

## 3. Deployment

Vercel requiere:
1. DATABASE_URL en Environment Variables
2. Script `postinstall` en package.json para generar Prisma Client

Connection String:
```
postgresql://neondb_owner:npg_X7rSOl2pLjPt@ep-floral-block-amkxw9i1-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## 4. UI/UX

### Layout
- Mobile: Bottom navigation
- Desktop: Top navigation
- Mobile-first, breakpoints: sm (640px), md (768px), lg (1024px)

### Colores
- Primary: `#0ea5e9` (sky-500)
- Secondary: `#f97316` (orange-500)
- Success: `#22clate` (green-500)
- Error: `#ef4444` (red-500)
- Font: Inter

### Touch-friendly
- Botones grandes (h-11, h-12)
- Inputs con padding generoso

## 5. Data Models

### Producto
```prisma
model Producto {
  id            Int         @id @default(autoincrement())
  nombre        String
  descripcion   String?
  codigoBarra   String?
  stock         Float       @default(0)         // Float para fracciones
  tipo         TipoProducto                   // AGUA/SODA/OTRO
  presentacion String
  precio       Float
  permiteFraccion Boolean  @default(false)
  unidadMedida  String    @default("UN")   // KG/L
  activo       Boolean    @default(true)
  usuarioId    Int
  categoriaId  Int?
}
```

### Venta
```prisma
model Venta {
  id            Int         @id @default(autoincrement())
  numero        String     @unique
  clienteId    Int?
  usuarioId    Int
  subtotal     Float
  iva         Float
  total       Float
  observaciones String?
  estado      EstadoVenta @default(COMPLETADA)
}
```

### DetalleVenta
```prisma
model DetalleVenta {
  id             Int      @id @default(autoincrement())
  ventaId        Int
  productoId     Int
  cantidad      Float    // Float para fracciones KG/L
  precioUnitario Float
  total         Float
}
```

## 6. Funcionalidades

### 6.1 Autenticación
- Login JWT en cookies httpOnly
- Roles: ADMIN y USUARIO

### 6.2 Dashboard
- Ventas del día/mes
- Total en pesos
- Stats en tiempo real

### 6.3 Productos
- CRUD con stock
- Código de barras + escaneo
- Categorías
- **Venta por fracción**: permiteFraccion + unidadMedida (KG/L)
- Stock como Float

### 6.4 Nueva Venta
- **Búsqueda dinámica**: productos filtra al escribir
- Escaneo de códigos
- Cantidad editable
- Productos fraccionables: input decimal (0.1, 0.25, etc.)
- productos no fraccionables: botones +/-.integer
- Decremento automático de stock

### 6.5 Caja
- Ventas del día
- Cierre con historial
- Exportación PDF

### 6.6 Inventario
- Reporte de stock bajo

## 7. Pages

```
/                   → Dashboard
/login              → Login
/clientes           → Lista clientes
/productos         → Productos (fracción + escáner)
/ventas             → Lista ventas
/ventas/nueva       → Nueva venta (búsqueda + escáner)
/caja               → Cierre caja + PDF
/inventario         → Reporte stock
/usuarios          → Gestión usuarios
```

## 8. API

```
GET/POST   /api/clientes
GET/PUT/DELETE /api/clientes/[id]

GET/POST   /api/categorias

GET/POST   /api/productos
GET/PUT/DELETE /api/productos/[id]

GET/POST   /api/ventas
GET/PUT/DELETE /api/ventas/[id]

GET/POST   /api/caja
GET /api/caja/[id]/pdf

GET       /api/inventario

GET/POST   /api/usuarios
GET/PUT/DELETE /api/usuarios/[id]

POST      /api/admin/seed
```

## 9. Acceptance Criteria

1. ✅ Dashboard con estadísticas
2. ✅ CRUD clientes con validación
3. ✅ CRUD productos con stock y código
4. ✅ Escaneo de códigos
5. ✅ Nueva venta con búsqueda dinámica
6. ✅ Venta por fracción (KG/L)
7. ✅ Stock Float para decimales
8. ✅ Decremento automático de stock
9. ✅ Cierre de caja + PDF
10. ✅ Reporte inventario
11. ✅ Datos por defecto
12. ✅ Diseño responsive
13. ✅ Deploy Vercel