# KioskoFlow - Sistema de Gestión

Aplicación web para gestión de kioskos, almacenes y multirubros con control de stock y cierre de caja.

## Características

- **Autenticación**: Login con JWT, roles ADMIN y USUARIO
- **Dashboard**: Estadísticas del negocio
- **Clientes**: CRUD completo
- **Productos**: Catálogo con stock, código de barra y categorías
- **Escaneo**: Lectura de códigos de barra con cámara
- **Ventas**: Nueva venta con decremento automático de stock
- **Cierre de Caja**: Ventas del día + exportación PDF
- **Inventario**: Reporte de productos bajo umbral de stock
- **Datos por Defecto**: 14 categorías + 127 productos precargados
- **Diseño Móvil-First**: Bottom navigation en móvil, top tabs en PC

## Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- Prisma ORM 7 + Neon PostgreSQL
- jsPDF + jsPDF-AutoTable para PDF
- shadcn/ui components
- Quagga2 para escaneo de códigos de barra
- bcrypt + jose para autenticación

## Deploy

- **Producción**: https://kioskoflow.vercel.app/
- **Repositorio**: https://github.com/OmiwomiIt/kioskoflow

## Credenciales

- Email: admin@kioskoflow.com
- Password: admin123

## Estructura del Proyecto

```
src/
├── app/
│   ├── api/                    # Endpoints REST
│   │   ├── auth/              # Login, logout, verify
│   │   ├── clientes/          # CRUD clientes
│   │   ├── categorias/        # CRUD categorías
│   │   ├── productos/         # CRUD productos
│   │   ├── ventas/            # CRUD ventas
│   │   ├── caja/              # Cierre caja + PDF
│   │   ├── inventario/       # Reporte stock bajo
│   │   ├── usuarios/          # Gestión usuarios
│   │   └── admin/seed/        # Regenerar datos por defecto
│   ├── login/                  # Página login
│   ├── clientes/              # UI clientes
│   ├── productos/             # UI productos
│   ├── ventas/                # UI ventas
│   ├── nueva/                 # Nueva venta
│   ├── caja/                  # Cierre de caja
│   ├── inventario/            # Reporte stock
│   └── usuarios/              # UI gestión usuarios
├── components/
│   ├── ui/                    # Componentes shadcn
│   ├── layout.tsx             # Layout con navegación
│   └── barcode-scanner.tsx    # Escáner códigos de barra
└── lib/
    ├── prisma.ts              # Cliente Prisma
    ├── auth.ts                # Utilidad JWT
    └── pdf.ts                 # Generación PDF
```

## Variables de Entorno

### Desarrollo Local

Crear archivo `.env`:
```
DATABASE_URL="postgresql://neondb_owner:npg_X7rSOl2pLjPt@ep-floral-block-amkxw9i1-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="tu-secret-key-aqui"
```

### Vercel

Settings → Environment Variables:
- `DATABASE_URL`: Tu conexión de Neon
- `JWT_SECRET`: Una clave segura

## Ejecutar localmente

```bash
npm install
npm run postinstall
npm run dev
```

Abrir http://localhost:3000

## Scripts

```bash
npm run dev         # Desarrollo
npm run build       # Build producción
npm run start       # Servidor producción
npm run lint        # Linter
npm run postinstall # Regenerar Prisma client
```

## API Endpoints

### Autenticación
- `POST /api/auth` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth` - Verificar sesión

### Clientes
- `GET /api/clientes` - Listar
- `POST /api/clientes` - Crear
- `PUT /api/clientes/[id]` - Editar
- `DELETE /api/clientes/[id]` - Eliminar

### Categorías
- `GET /api/categorias` - Listar
- `POST /api/categorias` - Crear

### Productos
- `GET /api/productos` - Listar
- `POST /api/productos` - Crear
- `PUT /api/productos/[id]` - Editar
- `DELETE /api/productos/[id]` - Eliminar

### Ventas
- `GET /api/ventas` - Listar
- `POST /api/ventas` - Crear (decrementa stock)
- `PUT /api/ventas/[id]` - Cambiar estado
- `DELETE /api/ventas/[id]` - Eliminar

### Caja
- `GET /api/caja` - Ventas del día
- `POST /api/caja` - Cerrar caja
- `GET /api/caja/[id]/pdf` - PDF del cierre

### Inventario
- `GET /api/inventario` - Productos bajo umbral

### Usuarios (admin)
- `GET /api/usuarios` - Listar
- `POST /api/usuarios` - Crear
- `PUT /api/usuarios/[id]` - Editar
- `DELETE /api/usuarios/[id]` - Eliminar