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

  if (tipo === 'ventas') {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const ventas = await prisma.venta.findMany({
      where: {
        usuarioId: user.id,
        estado: 'COMPLETADA',
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        detalles: {
          include: { producto: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(ventas);
  }

  const cierres = await prisma.cierreCaja.findMany({
    where: { usuarioId: user.id },
    orderBy: { fecha: 'desc' },
    take: 30,
  });
  return NextResponse.json(cierres);
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const ventas = await prisma.venta.findMany({
    where: {
      usuarioId: user.id,
      estado: 'COMPLETADA',
      createdAt: { gte: startOfDay, lte: endOfDay },
    },
    include: {
      detalles: {
        include: { producto: true },
      },
    },
  });

  const productoCantidades: Record<string, { nombre: string; cantidad: number; total: number }> = {};
  
  let totalVentas = 0;
  
  for (const venta of ventas) {
    totalVentas += venta.total;
    for (const detalle of venta.detalles) {
      const nombre = detalle.producto.nombre + ' (' + detalle.producto.presentacion + ')';
      const detalleTotal = detalle.cantidad * detalle.producto.precio;
      if (!productoCantidades[nombre]) {
        productoCantidades[nombre] = { nombre, cantidad: 0, total: 0 };
      }
      productoCantidades[nombre].cantidad += detalle.cantidad;
      productoCantidades[nombre].total += detalleTotal;
    }
  }

  if (ventas.length === 0) {
    return NextResponse.json({ error: 'No hay ventas completadas hoy' }, { status: 400 });
  }

  const cierre = await prisma.cierreCaja.create({
    data: {
      usuarioId: user.id,
      totalVentas,
      cantidadVentas: ventas.length,
      detalles: productoCantidades as any,
    },
  });

  return NextResponse.json(cierre);
}