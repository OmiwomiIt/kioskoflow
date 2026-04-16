import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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

    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('VENTA', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Número: ${venta.numero}`, 20, 35);
    doc.text(`Fecha: ${new Date(venta.createdAt).toLocaleString('es-AR')}`, 20, 42);
    if (venta.cliente) {
      doc.text(`Cliente: ${venta.cliente.nombre}`, 20, 49);
    }
    doc.text(`Total: $AR ${venta.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, 20, 56);
    doc.text(`Estado: ${venta.estado}`, 20, 63);

    doc.setFontSize(14);
    doc.text('Detalle:', 20, 80);

    doc.setFontSize(10);
    let y = 90;
    doc.text('Producto', 20, y);
    doc.text('Cantidad', 120, y, { align: 'right' });
    doc.text('Total', 170, y, { align: 'right' });
    y += 5;
    doc.line(20, y, 190, y);
    y += 5;

    for (const detalle of venta.detalles) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const nombre = `${detalle.producto.nombre} (${detalle.producto.presentacion})`.substring(0, 40);
      const detalleTotal = detalle.cantidad * detalle.producto.precio;
      doc.text(nombre, 20, y);
      doc.text(detalle.cantidad.toString(), 120, y, { align: 'right' });
      doc.text(`$AR ${detalleTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, 170, y, { align: 'right' });
      y += 7;
    }

    y += 5;
    doc.line(20, y, 190, y);
    y += 7;
    doc.setFontSize(12);
    doc.text('TOTAL', 20, y);
    doc.text(`$AR ${venta.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, 170, y, { align: 'right' });

    if (venta.observaciones) {
      y += 15;
      doc.setFontSize(10);
      doc.text('Observaciones:', 20, y);
      y += 5;
      doc.text(venta.observaciones, 20, y);
    }

    doc.setFontSize(8);
    doc.text(`KioskoFlow - ${new Date().toLocaleDateString('es-AR')}`, 105, 285, { align: 'center' });

    const pdfOutput = doc.output('blob');
    
    return new NextResponse(pdfOutput, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="venta-${venta.numero}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF Error:', error);
    return NextResponse.json({ error: 'Error al generar PDF' }, { status: 500 });
  }
}