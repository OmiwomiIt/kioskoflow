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
  const venta = await prisma.venta.findFirst({
    where: { id: parseInt(id), usuarioId: user.id },
    include: {
      cliente: true,
      detalles: { include: { producto: true } },
    },
  });
  if (!venta) {
    return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 });
  }
  return NextResponse.json(venta);
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
  
  if (data.estado === 'ANULADA') {
    const venta = await prisma.venta.update({
      where: { id: parseInt(id), usuarioId: user.id },
      data: { estado: 'ANULADA' },
    });
    return NextResponse.json(venta);
  }

  return NextResponse.json({ error: 'Acción no permitida' }, { status: 400 });
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
  await prisma.venta.update({
    where: { id: parseInt(id), usuarioId: user.id },
    data: { estado: 'ANULADA' },
  });
  return NextResponse.json({ success: true });
}