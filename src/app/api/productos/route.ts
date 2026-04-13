import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get('tipo');
  const activo = searchParams.get('activo');
  
  const where: any = {};
  if (tipo) where.tipo = tipo;
  if (activo !== null) where.activo = activo === 'true';

  const productos = await prisma.producto.findMany({
    where,
    orderBy: { nombre: 'asc' },
  });
  return NextResponse.json(productos);
}

export async function POST(request: Request) {
  const data = await request.json();
  const producto = await prisma.producto.create({
    data: {
      nombre: data.nombre,
      descripcion: data.descripcion || null,
      tipo: data.tipo,
      presentacion: data.presentacion,
      precio: parseFloat(data.precio),
      activo: true,
    },
  });
  return NextResponse.json(producto, { status: 201 });
}
