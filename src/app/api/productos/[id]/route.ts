import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const producto = await prisma.producto.findUnique({
    where: { id: parseInt(id) },
  });
  if (!producto) {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
  }
  return NextResponse.json(producto);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await request.json();
  const producto = await prisma.producto.update({
    where: { id: parseInt(id) },
    data: {
      nombre: data.nombre,
      descripcion: data.descripcion || null,
      tipo: data.tipo,
      presentacion: data.presentacion,
      precio: parseFloat(data.precio),
      activo: data.activo,
    },
  });
  return NextResponse.json(producto);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.producto.delete({
    where: { id: parseInt(id) },
  });
  return NextResponse.json({ success: true });
}