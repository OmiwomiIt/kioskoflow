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
    
    const cierre = await prisma.cierreCaja.findFirst({
      where: { id: parseInt(id), usuarioId: user.id },
    });

    if (!cierre) {
      return NextResponse.json({ error: 'Cierre no encontrado' }, { status: 404 });
    }

    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('CIERRE DE CAJA', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date(cierre.fecha).toLocaleString('es-AR')}`, 20, 35);
    doc.text(`Total Ventas: $AR ${cierre.totalVentas.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, 20, 42);
    doc.text(`Cantidad de Ventas: ${cierre.cantidadVentas}`, 20, 49);

    doc.setFontSize(14);
    doc.text('Detalle:', 20, 65);

    doc.setFontSize(10);
    let y = 75;
    doc.text('Producto', 20, y);
    doc.text('Cantidad', 120, y, { align: 'right' });
    doc.text('Total', 170, y, { align: 'right' });
    y += 5;
    doc.line(20, y, 190, y);
    y += 5;

    const detalles = cierre.detalles as Record<string, { nombre: string; cantidad: number; total: number }>;
    let totalCantidad = 0;
    
    for (const item of Object.values(detalles)) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const nombre = item.nombre.substring(0, 40);
      doc.text(nombre, 20, y);
      doc.text(item.cantidad.toString(), 120, y, { align: 'right' });
      doc.text(`$AR ${item.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, 170, y, { align: 'right' });
      totalCantidad += item.cantidad;
      y += 7;
    }

    y += 5;
    doc.line(20, y, 190, y);
    y += 7;
    doc.setFontSize(12);
    doc.text('TOTAL', 20, y);
    doc.text(totalCantidad.toString(), 120, y, { align: 'right' });
    doc.text(`$AR ${cierre.totalVentas.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, 170, y, { align: 'right' });

    doc.setFontSize(8);
    doc.text(`KioskoFlow - ${new Date().toLocaleDateString('es-AR')}`, 105, 285, { align: 'center' });

    const pdfOutput = doc.output('blob');
    
    return new NextResponse(pdfOutput, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="cierre-${new Date(cierre.fecha).toISOString().split('T')[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF Error:', error);
    return NextResponse.json({ error: 'Error al generar PDF' }, { status: 500 });
  }
}