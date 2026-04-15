import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

const defaultCategories = [
  { nombre: 'Bebidas con Gas' },
  { nombre: 'Bebidas sin Alcohol' },
  { nombre: 'Bebidas Alcohólicas' },
  { nombre: 'Agua' },
  { nombre: 'Golosinas' },
  { nombre: 'Alfajores' },
  { nombre: 'Galletas' },
  { nombre: 'Panadería' },
  { nombre: 'Lácteos' },
  { nombre: 'Fiambre' },
  { nombre: 'Perfumería' },
  { nombre: 'Limpieza' },
  { nombre: 'Bazar' },
  { nombre: 'Cigarrillos' },
];

const defaultProducts = [
  { nombre: 'Coca-Cola', presentacion: '500ml', precio: 2500, categoria: 'Bebidas con Gas' },
  { nombre: 'Coca-Cola', presentacion: '1.5L', precio: 4500, categoria: 'Bebidas con Gas' },
  { nombre: 'Coca-Cola', presentacion: '2.25L', precio: 6500, categoria: 'Bebidas con Gas' },
  { nombre: 'Pepsi', presentacion: '500ml', precio: 2300, categoria: 'Bebidas con Gas' },
  { nombre: 'Pepsi', presentacion: '1.5L', precio: 4200, categoria: 'Bebidas con Gas' },
  { nombre: 'Sprite', presentacion: '500ml', precio: 2300, categoria: 'Bebidas con Gas' },
  { nombre: 'Fanta', presentacion: '500ml', precio: 2300, categoria: 'Bebidas con Gas' },
  { nombre: '7Up', presentacion: '500ml', precio: 2300, categoria: 'Bebidas con Gas' },
  { nombre: 'Inca Kola', presentacion: '500ml', precio: 2400, categoria: 'Bebidas con Gas' },
  { nombre: 'Speed', presentacion: '250ml', precio: 2800, categoria: 'Bebidas con Gas' },
  { nombre: 'Red Bull', presentacion: '250ml', precio: 5500, categoria: 'Bebidas con Gas' },
  { nombre: 'H2O', presentacion: '500ml', precio: 1800, categoria: 'Bebidas sin Alcohol' },
  { nombre: 'cco', presentacion: '500ml', precio: 1600, categoria: 'Bebidas sin Alcohol' },
  { nombre: 'Levite Naranja', presentacion: '500ml', precio: 1800, categoria: 'Bebidas sin Alcohol' },
  { nombre: 'Levite Manzana', presentacion: '500ml', precio: 1800, categoria: 'Bebidas sin Alcohol' },
  { nombre: 'Suerox', presentacion: '630ml', precio: 2200, categoria: 'Bebidas sin Alcohol' },
  { nombre: 'Poleo', presentacion: '500ml', precio: 1500, categoria: 'Bebidas sin Alcohol' },
  { nombre: 'Cepita', presentacion: '200ml', precio: 1200, categoria: 'Bebidas sin Alcohol' },
  { nombre: 'Baggio Manzana', presentacion: '1L', precio: 2800, categoria: 'Bebidas sin Alcohol' },
  { nombre: 'Baggio Naranja', presentacion: '1L', precio: 2800, categoria: 'Bebidas sin Alcohol' },
  { nombre: 'Cerveza Heineken', presentacion: '330ml', precio: 3500, categoria: 'Bebidas Alcohólicas' },
  { nombre: 'Cerveza Stella Artois', presentacion: '330ml', precio: 3200, categoria: 'Bebidas Alcohólicas' },
  { nombre: 'Cerveza Corona', presentacion: '355ml', precio: 3100, categoria: 'Bebidas Alcohólicas' },
  { nombre: 'Cerveza Budweiser', presentacion: '355ml', precio: 3000, categoria: 'Bebidas Alcohólicas' },
  { nombre: 'Cerveza Quilmes', presentacion: '1L', precio: 2800, categoria: 'Bebidas Alcohólicas' },
  { nombre: 'Cerveza Quilmes', presentacion: '470ml', precio: 1800, categoria: 'Bebidas Alcohólicas' },
  { nombre: 'Cerveza Brahma', presentacion: '1L', precio: 2600, categoria: 'Bebidas Alcohólicas' },
  { nombre: 'Fernet Branca', presentacion: '750ml', precio: 18000, categoria: 'Bebidas Alcohólicas' },
  { nombre: 'Fernet Juanita', presentacion: '750ml', precio: 8500, categoria: 'Bebidas Alcohólicas' },
  { nombre: 'Gin Bulldog', presentacion: '750ml', precio: 22000, categoria: 'Bebidas Alcohólicas' },
  { nombre: 'Smirnoff', presentacion: '750ml', precio: 15000, categoria: 'Bebidas Alcohólicas' },
  { nombre: 'Vodka Sbirro', presentacion: '700ml', precio: 8500, categoria: 'Bebidas Alcohólicas' },
  { nombre: 'Carta Vieja', presentacion: '750ml', precio: 12000, categoria: 'Bebidas Alcohólicas' },
  { nombre: 'Felino Blend', presentacion: '750ml', precio: 9500, categoria: 'Bebidas Alcohólicas' },
  { nombre: 'Cerveza Andes', presentacion: '1L', precio: 3200, categoria: 'Bebidas Alcohólicas' },
  { nombre: 'Agua Sin Gas', presentacion: '500ml', precio: 1200, categoria: 'Agua' },
  { nombre: 'Agua Con Gas', presentacion: '500ml', precio: 1400, categoria: 'Agua' },
  { nombre: 'Agua Villavicencio', presentacion: '600ml', precio: 1800, categoria: 'Agua' },
  { nombre: 'Agua Eco', presentacion: '500ml', precio: 1500, categoria: 'Agua' },
  { nombre: 'Agua Pure Life', presentacion: '500ml', precio: 1400, categoria: 'Agua' },
  { nombre: 'Soda', presentacion: '500ml', precio: 1000, categoria: 'Agua' },
  { nombre: 'Soda', presentacion: '1L', precio: 1500, categoria: 'Agua' },
  { nombre: 'Aire', presentacion: '500ml', precio: 1200, categoria: 'Agua' },
  { nombre: 'Chocolate', presentacion: '30g', precio: 1500, categoria: 'Golosinas' },
  { nombre: 'Chocolate', presentacion: '100g', precio: 3500, categoria: 'Golosinas' },
  { nombre: 'Chocolate', presentacion: '250g', precio: 7500, categoria: 'Golosinas' },
  { nombre: 'Alfajor', presentacion: '45g', precio: 1200, categoria: 'Golosinas' },
  { nombre: 'Bon O Bon', presentacion: '48g', precio: 1500, categoria: 'Golosinas' },
  { nombre: 'Bon Bon', presentacion: '42g', precio: 1400, categoria: 'Golosinas' },
  { nombre: 'Submarino', presentacion: '38g', precio: 1300, categoria: 'Golosinas' },
  { nombre: 'Chupete', presentacion: 'un', precio: 800, categoria: 'Golosinas' },
  { nombre: 'Caramelos', presentacion: '50g', precio: 1200, categoria: 'Golosinas' },
  { nombre: 'Obleas', presentacion: 'un', precio: 1000, categoria: 'Golosinas' },
  { nombre: 'Chizitos', presentacion: '100g', precio: 1800, categoria: 'Golosinas' },
  { nombre: 'Panchitos', presentacion: '100g', precio: 1800, categoria: 'Golosinas' },
  { nombre: 'Pepas', presentacion: '85g', precio: 1500, categoria: 'Golosinas' },
  { nombre: 'Surtido Arcor', presentacion: '110g', precio: 2200, categoria: 'Golosinas' },
  { nombre: "M&M's", presentacion: '45g', precio: 2500, categoria: 'Golosinas' },
  { nombre: 'Skittles', presentacion: '45g', precio: 2200, categoria: 'Golosinas' },
  { nombre: 'Twix', presentacion: '50g', precio: 2800, categoria: 'Golosinas' },
  { nombre: 'KitKat', presentacion: '41g', precio: 2200, categoria: 'Golosinas' },
  { nombre: 'Alfajor triple', presentacion: '55g', precio: 1800, categoria: 'Alfajores' },
  { nombre: 'Alfajor Havanna', presentacion: '45g', precio: 2200, categoria: 'Alfajores' },
  { nombre: 'Alfajor Jorgito', presentacion: '35g', precio: 1500, categoria: 'Alfajores' },
  { nombre: 'Alfajor Cordobés', presentacion: '50g', precio: 1800, categoria: 'Alfajores' },
  { nombre: 'Quetto', presentacion: '30g', precio: 1200, categoria: 'Alfajores' },
  { nombre: 'Cappi', presentacion: '34g', precio: 1100, categoria: 'Alfajores' },
  { nombre: 'Block', presentacion: '38g', precio: 1400, categoria: 'Alfajores' },
  { nombre: 'Ballina', presentacion: '30g', precio: 1300, categoria: 'Alfajores' },
  { nombre: 'Saladito', presentacion: '30g', precio: 1200, categoria: 'Alfajores' },
  { nombre: 'Galletitas Criollitas', presentacion: '109g', precio: 1800, categoria: 'Galletas' },
  { nombre: 'Galletitas Pitusas', presentacion: '100g', precio: 1700, categoria: 'Galletas' },
  { nombre: 'Galletitas Chokitok', presentacion: '116g', precio: 2200, categoria: 'Galletas' },
  { nombre: 'Galletitas Pepitos', presentacion: '100g', precio: 1800, categoria: 'Galletas' },
  { nombre: 'Galletitas Melba', presentacion: '80g', precio: 1500, categoria: 'Galletas' },
  { nombre: 'Galletitas Express', presentacion: '90g', precio: 1600, categoria: 'Galletas' },
  { nombre: 'Galletitas Oreo', presentacion: '119g', precio: 2800, categoria: 'Galletas' },
  { nombre: 'Galletitas Waffer', presentacion: '100g', precio: 1800, categoria: 'Galletas' },
  { nombre: 'Facturas', presentacion: 'un', precio: 800, categoria: 'Panadería' },
  { nombre: 'Medialunas', presentacion: 'un', precio: 700, categoria: 'Panadería' },
  { nombre: 'Croissants', presentacion: 'un', precio: 900, categoria: 'Panadería' },
  { nombre: 'Donas', presentacion: 'un', precio: 1000, categoria: 'Panadería' },
  { nombre: 'Rosquillas', presentacion: 'un', precio: 800, categoria: 'Panadería' },
  { nombre: 'Panchos', presentacion: 'un', precio: 3500, categoria: 'Panadería' },
  { nombre: 'Leche', presentacion: '1L', precio: 2200, categoria: 'Lácteos' },
  { nombre: 'Yogur Bebible', presentacion: '1L', precio: 2800, categoria: 'Lácteos' },
  { nombre: 'Yogur Griego', presentacion: '170g', precio: 2200, categoria: 'Lácteos' },
  { nombre: 'Queso untable', presentacion: '200g', precio: 3500, categoria: 'Lácteos' },
  { nombre: 'Queso rallado', presentacion: '150g', precio: 4500, categoria: 'Lácteos' },
  { nombre: 'Ricota', presentacion: '200g', precio: 2800, categoria: 'Lácteos' },
  { nombre: 'Manteca', presentacion: '200g', precio: 3500, categoria: 'Lácteos' },
  { nombre: 'Crema de leche', presentacion: '200g', precio: 2800, categoria: 'Lácteos' },
  { nombre: 'Jamón', presentacion: '100g', precio: 3500, categoria: 'Fiambre' },
  { nombre: 'Queso paleta', presentacion: '100g', precio: 4000, categoria: 'Fiambre' },
  { nombre: 'Salchicha', presentacion: 'un', precio: 1800, categoria: 'Fiambre' },
  { nombre: 'Salchicha Frankfurt', presentacion: 'un', precio: 2200, categoria: 'Fiambre' },
  { nombre: 'Paty', presentacion: 'un', precio: 2500, categoria: 'Fiambre' },
  { nombre: 'Mortadela', presentacion: '100g', precio: 2800, categoria: 'Fiambre' },
  { nombre: 'Jabón de tocador', presentacion: '125g', precio: 1800, categoria: 'Perfumería' },
  { nombre: 'Shampoo', presentacion: '350ml', precio: 5500, categoria: 'Perfumería' },
  { nombre: 'Acondicionador', presentacion: '350ml', precio: 5000, categoria: 'Perfumería' },
  { nombre: 'Desodorante', presentacion: '50ml', precio: 4500, categoria: 'Perfumería' },
  { nombre: 'Crema Corporal', presentacion: '200ml', precio: 4500, categoria: 'Perfumería' },
  { nombre: 'Pasta dental', presentacion: '70g', precio: 3200, categoria: 'Perfumería' },
  { nombre: 'Cepillo dental', presentacion: 'un', precio: 2500, categoria: 'Perfumería' },
  { nombre: 'Detergente', presentacion: '500ml', precio: 2800, categoria: 'Limpieza' },
  { nombre: 'Jabón líquido', presentacion: '500ml', precio: 2500, categoria: 'Limpieza' },
  { nombre: 'Lavandina', presentacion: '1L', precio: 2200, categoria: 'Limpieza' },
  { nombre: 'Limpiador piso', presentacion: '500ml', precio: 3500, categoria: 'Limpieza' },
  { nombre: 'Limpiador multiviral', presentacion: '500ml', precio: 3800, categoria: 'Limpieza' },
  { nombre: 'Esponja', presentacion: 'un', precio: 1200, categoria: 'Limpieza' },
  { nombre: 'Paño de piso', presentacion: 'un', precio: 1500, categoria: 'Limpieza' },
  { nombre: 'Bolsa de basura', presentacion: '10u', precio: 2500, categoria: 'Limpieza' },
  { nombre: 'Encendedor', presentacion: 'un', precio: 1500, categoria: 'Bazar' },
  { nombre: 'Vela', presentacion: 'un', precio: 1800, categoria: 'Bazar' },
  { nombre: 'Fósforos', presentacion: 'un', precio: 800, categoria: 'Bazar' },
  { nombre: 'Bolsa de nylon', presentacion: 'un', precio: 500, categoria: 'Bazar' },
  { nombre: 'Pitillo', presentacion: 'un', precio: 300, categoria: 'Bazar' },
  { nombre: 'Servilletas', presentacion: '20u', precio: 1200, categoria: 'Bazar' },
  { nombre: 'Vaso descartable', presentacion: '25u', precio: 1500, categoria: 'Bazar' },
  { nombre: 'Papel alumínio', presentacion: '30m', precio: 3500, categoria: 'Bazar' },
  { nombre: 'Papel film', presentacion: '30m', precio: 3200, categoria: 'Bazar' },
  { nombre: 'Cigarrillos', presentacion: 'un', precio: 5500, categoria: 'Cigarrillos' },
  { nombre: 'Cigarrillos', presentacion: '10u', precio: 3000, categoria: 'Cigarrillos' },
  { nombre: 'Cigarrillos', presentacion: 'un', precio: 4500, categoria: 'Cigarrillos' },
  { nombre: 'Cigarrillos', presentacion: 'un', precio: 4800, categoria: 'Cigarrillos' },
  { nombre: 'Cigarros', presentacion: 'un', precio: 2500, categoria: 'Cigarrillos' },
];

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user || user.rol !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { force } = await request.json();
  
  const tieneProductos = await prisma.producto.count({
    where: { usuarioId: user.id },
  });

  if (tieneProductos > 0 && !force) {
    return NextResponse.json({ 
      message: 'El usuario ya tiene productos. Usa force=true para regenerar.',
      actuales: tieneProductos 
    });
  }

  if (force) {
    await prisma.producto.deleteMany({ where: { usuarioId: user.id } });
    await prisma.categoria.deleteMany({ where: { usuarioId: user.id } });
  }

  const categoriaMap: Record<string, number> = {};

  for (const cat of defaultCategories) {
    const created = await prisma.categoria.create({
      data: {
        nombre: cat.nombre,
        activo: true,
        usuarioId: user.id,
      },
    });
    categoriaMap[cat.nombre] = created.id;
  }

  for (const prod of defaultProducts) {
    const catId = categoriaMap[prod.categoria];
    if (catId) {
      await prisma.producto.create({
        data: {
          nombre: prod.nombre,
          presentacion: prod.presentacion,
          precio: prod.precio,
          stock: 0,
          tipo: 'OTRO',
          activo: true,
          usuarioId: user.id,
          categoriaId: catId,
        },
      });
    }
  }

  return NextResponse.json({ 
    message: 'Datos por defecto generados',
    categorias: defaultCategories.length,
    productos: defaultProducts.length 
  });
}

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user || user.rol !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const prods = await prisma.producto.count({ where: { usuarioId: user.id } });
  const cats = await prisma.categoria.count({ where: { usuarioId: user.id } });

  return NextResponse.json({ productos: prods, categorias: cats });
}