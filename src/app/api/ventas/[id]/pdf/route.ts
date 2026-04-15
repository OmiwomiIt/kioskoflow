import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function generatePDF(presupuesto: any) {
  const { generatePDF } = await import('@/lib/pdf');
  return generatePDF({
    numero: presupuesto.numero,
    createdAt: presupuesto.createdAt,
    cliente: {
      nombre: presupuesto.cliente.nombre,
      email: presupuesto.cliente.email,
      telefono: presupuesto.cliente.telefono,
      direccion: presupuesto.cliente.direccion,
    },
    detalles: presupuesto.detalles.map((d: any) => ({
      cantidad: d.cantidad,
      producto: {
        nombre: d.producto.nombre,
        presentacion: d.producto.presentacion,
      },
      precioUnitario: d.precioUnitario,
      total: d.total,
    })),
    subtotal: presupuesto.subtotal,
    iva: presupuesto.iva,
    total: presupuesto.total,
    observaciones: presupuesto.observaciones,
    estado: presupuesto.estado,
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    
    const presupuesto = await prisma.presupuesto.findFirst({
      where: { id: parseInt(id), usuarioId: user.id },
      include: {
        cliente: true,
        detalles: { include: { producto: true } },
      },
    });

    if (!presupuesto) {
      return NextResponse.json({ error: 'Presupuesto no encontrado' }, { status: 404 });
    }

    const doc = await generatePDF(presupuesto);
    
    return new NextResponse(doc.output('blob'), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="presupuesto-${presupuesto.numero}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF Error:', error);
    return NextResponse.json({ error: 'Error al generar PDF' }, { status: 500 });
  }
}