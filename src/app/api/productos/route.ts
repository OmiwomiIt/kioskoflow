import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get('tipo');
  const activo = searchParams.get('activo');
  const categoriaId = searchParams.get('categoriaId');
  
  const where: any = { usuarioId: user.id };
  if (tipo) where.tipo = tipo;
  if (activo !== null) where.activo = activo === 'true';
  if (categoriaId) where.categoriaId = parseInt(categoriaId);
  if (searchParams.get('codigoBarra')) {
    where.codigoBarra = searchParams.get('codigoBarra');
  }
  if (searchParams.get('stock')) {
    where.stock = { lte: parseInt(searchParams.get('stock')!) };
  }

  const productos = await prisma.producto.findMany({
    where,
    include: { categoria: true },
    orderBy: { nombre: 'asc' },
  });
  return NextResponse.json(productos);
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const data = await request.json();
  const producto = await prisma.producto.create({
    data: {
      nombre: data.nombre,
      descripcion: data.descripcion || null,
      codigoBarra: data.codigoBarra || null,
      stock: data.stock ? parseInt(data.stock) : 0,
      tipo: data.tipo,
      presentacion: data.presentacion,
      precio: parseFloat(data.precio),
      activo: true,
      usuarioId: user.id,
      categoriaId: data.categoriaId ? parseInt(data.categoriaId) : null,
    },
  });
  return NextResponse.json(producto, { status: 201 });
}