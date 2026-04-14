# KioskoFlow - Sistema de Gestión

Aplicación web para gestión de kioskos, almacenes y multirubros.

## Características

- **Autenticación**: Login con JWT, roles ADMIN y USUARIO
- **Dashboard**: Estadísticas del negocio
- **Clientes**: CRUD completo
- **Productos**: Catálogo de productos por categoría
- **Presupuestos**: Creación, edición, exportación PDF
- **Gestión de Usuarios**: Solo administradores
- **Diseño Móvil-First**: Bottom navigation en móvil, top tabs en PC
- **Moneda**: Pesos Argentinos ($AR)

## Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- Prisma ORM 7 + Neon PostgreSQL
- jsPDF + jsPDF-AutoTable para PDF
- shadcn/ui components
- bcrypt + jose para autenticación
- Vercel (deploy)

## Deploy

- **Producción**: https://kioskoflow.vercel.app/
- **Repositorio**: https://github.com/OmiwomiIt/kioskoflow

## Credenciales

El admin debe crearse en la base de datos de Neon:
- Email: admin@kioskoflow.com
- Password: admin123
- Rol: ADMIN

## Estructura del Proyecto

```
src/
├── prisma/
│   └── schema.prisma     # Modelo de datos
├── src/
│   ├── app/
│   │   ├── api/        # Endpoints REST
│   │   ├── login/      # Página de login
│   │   ├── clientes/   # CRUD clientes
│   │   ├── productos/  # CRUD productos
│   │   ├── presupuestos/ # CRUD presupuestos
│   │   └── usuarios/   # Gestión usuarios (admin)
│   ├── components/     # Componentes React
│   │   ├── ui/        # Componentes shadcn
│   │   └── auth/      # Provider auth
│   └── lib/           # Utilidades
├── .env               # Variables entorno
└── package.json       # Dependencias
```

## Variables de Entorno

### Desarrollo Local

Crear archivo `.env`:
```
DATABASE_URL="postgresql://..."
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

## Scripts Disponibles

```bash
npm run dev      # Desarrollo
npm run build   # Build producción
npm run start  # Servidor producción
npm run lint   # Linter
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

### Productos
- `GET /api/productos` - Listar
- `POST /api/productos` - Crear
- `PUT /api/productos/[id]` - Editar
- `DELETE /api/productos/[id]` - Eliminar

### Presupuestos
- `GET /api/presupuestos` - Listar
- `POST /api/presupuestos` - Crear
- `GET /api/presupuestos/[id]` - Ver
- `PUT /api/presupuestos/[id]` - Editar/Estado
- `DELETE /api/presupuestos/[id]` - Eliminar
- `GET /api/presupuestos/[id]/pdf` - Descargar PDF

### Usuarios (solo ADMIN)
- `GET /api/usuarios` - Listar
- `POST /api/usuarios` - Crear
- `PUT /api/usuarios/[id]` - Editar
- `DELETE /api/usuarios/[id]` - Eliminar