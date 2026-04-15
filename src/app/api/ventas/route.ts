import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

async function generateNumero(usuarioId: number) {
  const last = await prisma.venta.findFirst({
    where: { usuarioId },
    orderBy: { numero: 'desc' },
  });
  let num = 1;
  if (last) {
    const lastNum = parseInt(last.numero.replace('VENTA-', ''));
    if (!isNaN(lastNum)) {
      num = lastNum + 1;
    }
  }
  let nuevoNumero = `VENTA-${num.toString().padStart(5, '0')}`;
  let existing = await prisma.venta.findUnique({ where: { numero: nuevoNumero } });
  let attempts = 0;
  while (existing && attempts < 100) {
    num++;
    nuevoNumero = `VENTA-${num.toString().padStart(5, '0')}`;
    existing = await prisma.venta.findUnique({ where: { numero: nuevoNumero } });
    attempts++;
  }
  return nuevoNumero;
}

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const estado = searchParams.get('estado');
  
  const where: any = { usuarioId: user.id };
  if (estado) where.estado = estado;

  const ventas = await prisma.venta.findMany({
    where,
    include: {
      cliente: true,
      detalles: {
        include: { producto: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(ventas);
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const data = await request.json();
  
  if (!data.detalles || data.detalles.length === 0) {
    return NextResponse.json({ error: 'Faltan productos' }, { status: 400 });
  }

  const numero = await generateNumero(user.id);
  
  let total = 0;
  for (const item of data.detalles) {
    total += item.cantidad * item.precioUnitario;
  }

  const venta = await prisma.venta.create({
    data: {
      numero,
      clienteId: data.clienteId || null,
      usuarioId: user.id,
      subtotal: total,
      iva: 0,
      total,
      observaciones: data.observaciones || null,
      estado: 'COMPLETADA',
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

  return NextResponse.json(venta, { status: 201 });
}