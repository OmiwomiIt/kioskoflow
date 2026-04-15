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
  const categoria = await prisma.categoria.findUnique({
    where: { id: parseInt(id), usuarioId: user.id },
  });
  if (!categoria) {
    return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
  }
  return NextResponse.json(categoria);
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
  const categoria = await prisma.categoria.update({
    where: { id: parseInt(id), usuarioId: user.id },
    data: { nombre: data.nombre },
  });
  return NextResponse.json(categoria);
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
  await prisma.categoria.delete({
    where: { id: parseInt(id), usuarioId: user.id },
  });
  return NextResponse.json({ success: true });
}