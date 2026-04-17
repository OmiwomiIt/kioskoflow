---
name: neon-db-optimization
description: Analiza el proyecto KioskoFlow y la base de datos Neon para identificar datos innecesarios, redundancias y oportunidades de optimización. Usa esta skill cuando el usuario pide optimizar la base de datos, reducir datos innecesarios, o analizar el schema para mejoras.
license: MIT
---

# Skill: Neon DB Optimization for KioskoFlow

This skill analyzes the KioskoFlow project to identify unnecessary data generation, redundancies, and optimization opportunities in the Neon PostgreSQL database.

## When to Use

- User asks to optimize database
- User wants to reduce unnecessary data storage
- User wants to analyze schema for inefficiencies
- User wants to clean up unused fields or relations
- User wants database performance improvements

## Analysis Framework

### Step 1: Examine Schema (prisma/schema.prisma)

Look for:
- **Campos sin uso** - Fields not referenced in any API route
- **Relaciones innecesarias** - Unused relations that add overhead
- **Datos derivables** - Fields that can be computed from other data
- **Enum sparseness** - Enums with few used values
- **JSON overuse** - JSON fields when structured fields would work
- **Missing indexes** - Fields queried frequently without indexes

### Step 2: Examine API Routes

Check `src/app/api/*/route.ts` for:
- **Datos que se crean pero nunca se leen** - Fields written but never read
- **Duplicación** - Same data stored in multiple places
- **Soft deletes** - Soft-deleted data that could be hard deleted
- **Historial innecesario** - Audit logs or history tables not needed
- **Caché redundante** - Computed values stored that could be derived

### Step 3: Query Patterns

Analyze how data is queried:
- **N+1 queries** - Multiple queries that could be combined
- **Missing select** - Fetching all fields when only some needed
- **Pagination missing** - No pagination on large datasets
- **No filtering** - Loading all data when filtering is possible

## Common Optimizations for KioskoFlow

### 1. Reducir campos en Producto
```prisma
// ❌ Antes - campos que no se usan
model Producto {
  descripcion   String?   // No se usa en ninguna UI
  costo         Float?    // Nunca se calcula margen
  stockMinimo   Int       // No hay alerta de stock bajo
}

// ✅ Optimizado
model Producto {
  // Solo campos esenciales para ventas
}
```

### 2. Simplificar DetalleVenta
```prisma
// ❌ Antes - datos redundantes
model DetalleVenta {
  precioUnitario Float  // Se puede obtener de producto.precio
  total          Float  // cantidad * precioUnitario
}

// ✅ Optimizado - calcular al vuelo
model DetalleVenta {
  cantidad Float  // Solo almacenar lo que no se puede derivar
  // total se calcula: cantidad * producto.precio
}
```

### 3. Agregar índices donde faltan
```prisma
// Agregar índices para queries frecuentes
model Venta {
  numero      String  @unique  // ✅ Ya existe
  createdAt   DateTime @index  // Para filtrar por fecha
  usuarioId   Int @index       // Para ventas por usuario
  estado      String @index    // Para filtrar por estado
}
```

### 4. Datos que se generan pero no se usan
- **CierreCaja.detalles JSON** - Guardar todo el detalle es innecesario
- **Venta.iva** - Siempre 0, campo innecesario
- **Producto.tipo** - Podría derivarse de categoría

### 5. Limpiar datos huérfanos
- Productos sin categoría
- Clientes sin ventas
- Ventas con detalles eliminados

## Implementation Checklist

1. **Mapear uso real de campos**
   - Buscar en todas las API routes qué campos se leen/escriben
   - Identificar campos que siempre son null

2. **Identificar datos derivables**
   - Total en DetalleVenta = cantidad * precio
   - Subtotal en Venta = SUM(detalles.total)
   - Tipo de producto puede derivarse de categoría

3. **Proponer índices**
   - Queries frecuentes en GET /api/ventas
   - Búsquedas en /api/productos
   - Filtros comunes en clientes

4. **Documentar cambios**
   - Explicar por qué cada cambio mejora rendimiento
   - Estimar impacto (espacio, velocidad)

## Output Format

When analyzing, provide:

```
## Análisis de [tabla/campo]

### Estado Actual
- Usado en: [lista de API routes]
- Frecuencia de acceso: [alta/media/baja]
- Tamaño promedio: [si aplica]

### Problema Identificado
[Descripción del problema]

### Optimización Sugerida
[Cambio específico a realizar]

### Impacto
- Storage: [ahorro estimado]
- Performance: [mejora estimada]
```

## Example: Analyzing Venta.iva

```bash
# Buscar uso de iva en el código
grep -r "iva" src/app/api/
```

Results show:
- `iva` is always set to 0
- Never displayed in UI
- Never used in calculations

**Recommendation**: Remove `iva` field from Venta model, calculate taxes on-the-fly if needed in future.

## Commands to Run

```bash
# Ver tamaño de tablas (en Neon Console)
SELECT pg_size_pretty(pg_total_relation_size('"Venta"'));
SELECT pg_size_pretty(pg_total_relation_size('"Producto"'));

# Ver registros huérfanos
SELECT COUNT(*) FROM "Producto" WHERE "categoriaId" IS NULL;
SELECT COUNT(*) FROM "Venta" WHERE "clienteId" IS NULL;

# Ver campos con muchos nulls
SELECT COUNT(*) as total, 
       SUM(CASE WHEN "campo" IS NULL THEN 1 ELSE 0 END) as nulos
FROM "Tabla";
```

## Remember

- Always backup before making schema changes
- Test that changes don't break existing functionality
- Consider migration path for existing data
- Document any data loss from deletions