import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const producto = await prisma.producto.findFirst({
    where: { id: parseInt(id), usuarioId: user.id },
    include: { categoria: true },
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
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const data = await request.json();
  const producto = await prisma.producto.update({
    where: { id: parseInt(id), usuarioId: user.id },
    data: {
      nombre: data.nombre,
      descripcion: data.descripcion || null,
      codigoBarra: data.codigoBarra || null,
      stock: data.stock !== undefined ? parseFloat(data.stock) : undefined,
      tipo: data.tipo || 'OTRO',
      presentacion: data.presentacion,
      precio: parseFloat(data.precio),
      activo: data.activo,
      permiteFraccion: data.permiteFraccion || false,
      unidadMedida: data.permiteFraccion ? data.unidadMedida : 'UN',
      categoriaId: data.categoriaId ? parseInt(data.categoriaId) : null,
    },
  });
  return NextResponse.json(producto);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;
  await prisma.producto.delete({
    where: { id: parseInt(id), usuarioId: user.id },
  });
  return NextResponse.json({ success: true });
}