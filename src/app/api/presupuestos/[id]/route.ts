import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const presupuesto = await prisma.presupuesto.findUnique({
    where: { id: parseInt(id) },
    include: {
      cliente: true,
      detalles: { include: { producto: true } },
    },
  });
  if (!presupuesto) {
    return NextResponse.json({ error: 'Presupuesto no encontrado' }, { status: 404 });
  }
  return NextResponse.json(presupuesto);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await request.json();
  
  const existing = await prisma.presupuesto.findUnique({
    where: { id: parseInt(id) },
  });
  if (existing?.estado === 'ENVIADO' || existing?.estado === 'ACEPTADO') {
    if (data.detalles) {
      return NextResponse.json(
        { error: 'No se puede modificar un presupuesto enviado o aceptado' },
        { status: 400 }
      );
    }
  }

  let updateData: any = {};
  if (data.estado) updateData.estado = data.estado;
  if (data.observaciones !== undefined) updateData.observaciones = data.observaciones;

  if (data.detalles) {
    let total = 0;
    for (const item of data.detalles) {
      total += item.cantidad * item.precioUnitario;
    }
    updateData = { ...updateData, subtotal: total, iva: 0, total };

    await prisma.detallePresupuesto.deleteMany({
      where: { presupuestoId: parseInt(id) },
    });

    for (const item of data.detalles) {
      await prisma.detallePresupuesto.create({
        data: {
          presupuestoId: parseInt(id),
          productoId: item.productoId,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          total: item.cantidad * item.precioUnitario,
        },
      });
    }
  }

  const presupuesto = await prisma.presupuesto.update({
    where: { id: parseInt(id) },
    data: updateData,
    include: {
      cliente: true,
      detalles: { include: { producto: true } },
    },
  });
  return NextResponse.json(presupuesto);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.presupuesto.delete({
    where: { id: parseInt(id) },
  });
  return NextResponse.json({ success: true });
}