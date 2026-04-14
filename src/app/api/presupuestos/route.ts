import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

async function generateNumero(usuarioId: number) {
  const last = await prisma.presupuesto.findFirst({
    where: { usuarioId },
    orderBy: { createdAt: 'desc' },
  });
  const num = last ? parseInt(last.numero.replace('PRE-', '')) + 1 : 1;
  return `PRE-${num.toString().padStart(5, '0')}`;
}

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const estado = searchParams.get('estado');
  const clienteId = searchParams.get('clienteId');
  
  const where: any = { usuarioId: user.id };
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
  let user;
  try {
    user = await getUserFromRequest(request);
  } catch (err) {
    console.error('Auth error:', err);
    return NextResponse.json({ error: 'Error de autenticación' }, { status: 401 });
  }
  
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }
  
  if (!data.clienteId || !data.detalles || data.detalles.length === 0) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
  }

  const numero = await generateNumero(user.id);
  
  let total = 0;
  for (const item of data.detalles) {
    total += item.cantidad * item.precioUnitario;
  }

  try {
    const presupuesto = await prisma.presupuesto.create({
      data: {
        numero,
        clienteId: data.clienteId,
        usuarioId: user.id,
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
  } catch (err) {
    console.error('DB error:', err);
    return NextResponse.json({ error: 'Error al guardar en base de datos' }, { status: 500 });
  }
}