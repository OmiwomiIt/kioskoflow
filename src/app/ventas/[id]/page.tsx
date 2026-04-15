'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Download } from 'lucide-react';

interface Detalle {
  cantidad: number;
  producto: { nombre: string; presentacion: string };
  precioUnitario: number;
  total: number;
}

interface Venta {
  id: number;
  numero: string;
  estado: 'COMPLETADA' | 'ANULADA';
  subtotal: number;
  iva: number;
  total: number;
  observaciones: string | null;
  createdAt: string;
  updatedAt: string;
  cliente: { nombre: string } | null;
  detalles: Detalle[];
}

export default function VerVentaPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [venta, setVenta] = useState<Venta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(p => {
      fetch(`/api/ventas/${p.id}`).then(res => res.json()).then(data => {
        setVenta(data);
        setLoading(false);
      });
    });
  }, [params]);

  async function handleEstado(estado: 'ANULADA') {
    if (!venta) return;
    await fetch(`/api/ventas/${venta.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    });
    router.refresh();
  }

  async function handleDownload() {
    window.open(`/api/ventas/${venta?.id}/pdf`, '_blank');
  }

  const estadoColors: Record<string, string> = {
    COMPLETADA: 'bg-emerald-100 text-emerald-700',
    ANULADA: 'bg-red-100 text-red-700',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (!venta) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">Venta no encontrada</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/ventas')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/ventas')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Venta {venta.numero}</h1>
          <p className="text-slate-500">Fecha: {new Date(venta.createdAt).toLocaleDateString('es-AR')}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className={`px-3 py-1 rounded-full font-medium ${estadoColors[venta.estado]}`}>
          {venta.estado}
        </span>
        {venta.estado === 'COMPLETADA' && (
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" /> Descargar PDF
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalles</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Precio Unitario</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {venta.detalles.map((d, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="font-medium">{d.producto.nombre}</div>
                    <div className="text-xs text-slate-400">{d.producto.presentacion}</div>
                  </TableCell>
                  <TableCell>{d.cantidad}</TableCell>
                  <TableCell>$AR {d.precioUnitario.toFixed(2)}</TableCell>
                  <TableCell>$AR {d.total.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>$AR {venta.total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {venta.observaciones && (
        <Card>
          <CardHeader>
            <CardTitle>Observaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">{venta.observaciones}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}