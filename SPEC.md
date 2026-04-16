# SPEC.md - KioskoFlow - Sistema de Gestión para Kioscos

## 1. Project Overview

- **Project name**: KioskoFlow - Sistema de Gestión para Kioscos
- **Type**: Aplicación web fullstack
- **Core functionality**: Sistema de ventas con control de stock, cierre de caja y gestión de clientes para kioscos y multirubros
- **Target users**: Kioscos, almacenes y multirubros
- **Production URL**: https://kioskoflow.vercel.app/
- **GitHub**: https://github.com/OmiwomiIt/kioskoflow
- **Stack**: Next.js 16 + React 19 + TypeScript + Tailwind 4 + Prisma 7 + Neon PostgreSQL

## 2. Tech Stack

- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: API Routes de Next.js
- **Base de datos**: Neon PostgreSQL con Prisma ORM 7
- **PDF**: jsPDF + jspdf-autotable
- **UI Components**: shadcn/ui
- **Auth**: JWT (jose) + bcrypt
- **Escaneo**: Quagga2 (códigos de barra)

## 3. Deployment

### Vercel Configuration

El deploy en Vercel requiere:
1. **DATABASE_URL** configurado en Environment Variables
2. Script `postinstall` en `package.json` para generar Prisma Client

### Connection String Neon

```
postgresql://neondb_owner:npg_X7rSOl2pLjPt@ep-floral-block-amkxw9i1-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## 4. UI/UX Specification

### Layout Structure

- **Mobile**: Bottom navigation con tabs
- **Desktop**: Top navigation con menú horizontal  
- **Main content**: Área de trabajo
- **Responsive**: Mobile-first, breakpoints: sm (640px), md (768px), lg (1024px)

### Visual Design

**Paleta de colores**:
- Primary: `#0ea5e9` (sky-500) - Color institucional agua
- Primary dark: `#0284c7` (sky-600)
- Secondary: `#f97316` (orange-500) - Soda
- Background: `#f8fafc` (slate-50)
- Surface: `#ffffff`
- Text primary: `#1e293b` (slate-800)
- Text secondary: `#64748b` (slate-500)
- Success: `#22c55e` (green-500)
- Error: `#ef4444` (red-500)

**Diseño móvil-friendly**:
- Botones grandes para touch (h-11, h-12)
- Inputs con padding generoso (h-12)
- Bottom tabs en móvil para fácil acceso con pulgar

**Tipografía**:
- Font family: `Inter` (Google Fonts)
- Headings: 700 weight
- Body: 400 weight, 1rem (16px)

### Componentes Especiales

- **BarcodeScanner**: Modal con cámara para escanear códigos de barra
- **Caja**: Página de cierre con ventas del día y export PDF
- **Inventario**: Reporte de productos con stock bajo umbral

## 5. Data Models

### Usuario
```prisma
model Usuario {
  id        Int         @id @default(autoincrement())
  email     String      @unique
  password  String
  nombre    String
  rol       RolUsuario  @default(USUARIO)
  activo    Boolean     @default(true)
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  productos Producto[]
  clientes  Cliente[]
  ventas    Venta[]
}

enum RolUsuario {
  ADMIN
  USUARIO
}
```

### Cliente
```prisma
model Cliente {
  id        Int       @id @default(autoincrement())
  nombre    String
  email     String?
  telefono  String?
  direccion String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  ventas    Venta[]
}
```

### Categoria
```prisma
model Categoria {
  id        Int        @id @default(autoincrement())
  nombre    String
  usuarioId Int
  activo    Boolean    @default(true)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  productos Producto[]
}
```

### Producto
```prisma
model Producto {
  id            Int         @id @default(autoincrement())
  nombre        String
  descripcion   String?
  precio        Float
  costo         Float?
  stock         Int         @default(0)
  stockMinimo   Int         @default(5)
  codigoBarra   String?
  categoriaId   Int?
  categoria     Categoria?  @relation(fields: [categoriaId], references: [id])
  activo        Boolean     @default(true)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  detalles      DetalleVenta[]
}

enum TipoProducto {
  AGUA
  SODA
}
```

### Venta
```prisma
model Venta {
  id           Int          @id @default(autoincrement())
  numero       String       @unique
  clienteId    Int?
  cliente      Cliente?     @relation(fields: [clienteId], references: [id])
  usuarioId    Int
  subtotal     Float
  total        Float
  observaciones String?
  estado       EstadoVenta  @default(COMPLETADA)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  detalles     DetalleVenta[]
}

enum EstadoVenta {
  COMPLETADA
  ANULADA
}
```

### DetalleVenta
```prisma
model DetalleVenta {
  id             Int      @id @default(autoincrement())
  ventaId        Int
  venta          Venta    @relation(fields: [ventaId], references: [id])
  productoId     Int
  producto       Producto @relation(fields: [productoId], references: [id])
  cantidad       Int
  precioUnitario Float
  total          Float
}
```

### CierreCaja
```prisma
model CierreCaja {
  id          Int       @id @default(autoincrement())
  usuarioId   Int
  fecha       DateTime  @default(now())
  total       Float
  ventas      Int
  createdAt   DateTime  @default(now())
}
```

## 6. Funcionalidades

### 6.1 Autenticación
- Login con email y contraseña
- JWT en cookies (httpOnly, secure en producción)
- Roles: ADMIN y USUARIO
- Middleware de protección de rutas

### 6.2 Dashboard
- Resumen de ventas del día
- Stats: Ventas de hoy, total caja, productos bajo stock

### 6.3 Gestión de Clientes
- CRUD completo con búsqueda

### 6.4 Gestión de Productos
- CRUD completo con stock y código de barra
- Escaneo de códigos de barra
- Categorías

### 6.5 Nueva Venta
- Agregar productos por nombre o escáner
- Cantidad editable
- Cálculo automático de total
- Selección de cliente (opcional)

### 6.6 Cierre de Caja
- Ver ventas del día
- Total en tiempo real
- Validación si no hay ventas
- Exportar PDF del cierre

### 6.7 Inventario
- Reporte de productos
- Indicador de stock bajo umbral

### 6.8 Datos por Defecto
- 14 categorías típicas de kiosco argentino
- 127+ productos precargados al crear usuario nuevo
- Seed SQL para usuario admin existente

## 7. Pages Structure

```
/                   -> Dashboard
/login              -> Login
/clientes           -> Lista clientes
/productos         -> Lista productos (con stock y escáner)
/ventas             -> Lista ventas
/ventas/nueva       -> Nueva venta (con escáner)
/caja               -> Cierre de caja + PDF
/inventario         -> Reporte de stock
/usuarios          -> Gestión usuarios (admin)
```

## 8. API Endpoints

```
GET    /api/clientes           -> Listar clientes
POST   /api/clientes           -> Crear cliente
GET    /api/clientes/[id]      -> Get cliente
PUT    /api/clientes/[id]      -> Actualizar cliente
DELETE /api/clientes/[id]      -> Eliminar cliente

GET    /api/categorias         -> Listar categorías
POST   /api/categorias        -> Crear categoría

GET    /api/productos         -> Listar productos
POST   /api/productos         -> Crear producto
GET    /api/productos/[id]    -> Get producto
PUT    /api/productos/[id]    -> Actualizar producto
DELETE /api/productos/[id]    -> Eliminar producto

GET    /api/ventas            -> Listar ventas
POST   /api/ventas           -> Crear venta (con decremento stock)
GET    /api/ventas/[id]      -> Get venta
PUT    /api/ventas/[id]      -> Cambiar estado (ANULADA)
DELETE /api/ventas/[id]      -> Eliminar venta

GET    /api/caja             -> Ventas del día
POST   /api/caja            -> Cerrar caja
GET    /api/caja/[id]/pdf   -> PDF del cierre

GET    /api/inventario       -> Productos con stock bajo

GET    /api/usuarios         -> Listar usuarios (admin)
POST   /api/usuarios        -> Crear usuario
PUT    /api/usuarios/[id]   -> Actualizar usuario
DELETE /api/usuarios/[id]   -> Eliminar usuario

POST   /api/admin/seed       -> Regenerar datos por defecto
```

## 9. Acceptance Criteria

1. ✅ Dashboard muestra estadísticas del negocio
2. ✅ CRUD completo de clientes con validación
3. ✅ CRUD completo de productos con stock y código de barra
4. ✅ Escaneo de códigos de barra
5. ✅ Crear venta con cálculo automático de totales
6. ✅ Decremento automático de stock en ventas
7. ✅ Cierre de caja con ventas del día y PDF
8. ✅ Reporte de inventario con stock bajo
9. ✅ Datos por defecto (categorías + productos)
10. ✅ Diseño responsive (mobile y desktop)
11. ✅ Datos persistidos en Neon PostgreSQL
12. ✅ Deploy en Vercel funcionando