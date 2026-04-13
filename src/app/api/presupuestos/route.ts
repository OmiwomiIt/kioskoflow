import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

async function generateNumero() {
  const last = await prisma.presupuesto.findFirst({
    orderBy: { createdAt: 'desc' },
  });
  const num = last ? parseInt(last.numero.replace('PRE-', '')) + 1 : 1;
  return `PRE-${num.toString().padStart(5, '0')}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const estado = searchParams.get('estado');
  const clienteId = searchParams.get('clienteId');
  
  const where: any = {};
  if (estado) where.estado = estado;
  if (clienteId) where.clienteId = parseInt(clienteId);

  const presupuestos = await prisma.presupuesto.findMany({
    where,
    include: {
      cliente: true,
      detalles: {
        include: { producto: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(presupuestos);
}

export async function POST(request: Request) {
  const data = await request.json();
  const numero = await generateNumero();
  
  let total = 0;
  for (const item of data.detalles) {
    total += item.cantidad * item.precioUnitario;
  }

  const presupuesto = await prisma.presupuesto.create({
    data: {
      numero,
      clienteId: data.clienteId,
      subtotal: total,
      iva: 0,
      total,
      observaciones: data.observaciones || null,
      estado: data.estado || 'BORRADOR',
      detalles: {
        create: data.detalles.map((item: any) => ({
          productoId: item.productoId,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          total: item.cantidad * item.precioUnitario,
        })),
      },
    },
    include: {
      cliente: true,
      detalles: { include: { producto: true } },
    },
  });
  return NextResponse.json(presupuesto, { status: 201 });
}
