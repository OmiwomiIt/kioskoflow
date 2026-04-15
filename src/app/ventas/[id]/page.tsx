'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Download, Send, Check, X } from 'lucide-react';

interface Detalle {
  cantidad: number;
  producto: { nombre: string; presentacion: string };
  precioUnitario: number;
  total: number;
}

interface Presupuesto {
  id: number;
  numero: string;
  estado: 'BORRADOR' | 'ENVIADO' | 'ACEPTADO' | 'RECHAZADO';
  subtotal: number;
  iva: number;
  total: number;
  observaciones: string | null;
  createdAt: string;
  updatedAt: string;
  cliente: { nombre: string; email: string | null; telefono: string | null; direccion: string | null };
  detalles: Detalle[];
}

export default function VerPresupuestoPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [presupuesto, setPresupuesto] = useState<Presupuesto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(p => {
      fetch(`/api/presupuestos/${p.id}`).then(res => res.json()).then(data => {
        setPresupuesto(data);
        setLoading(false);
      });
    });
  }, [params]);

  async function handleEstado(estado: 'ENVIADO' | 'ACEPTADO' | 'RECHAZADO') {
    if (!presupuesto) return;
    await fetch(`/api/presupuestos/${presupuesto.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    });
    router.refresh();
  }

  async function handleDownload() {
    window.open(`/api/presupuestos/${presupuesto?.id}/pdf`, '_blank');
  }

  const estadoColors: Record<string, string> = {
    BORRADOR: 'bg-slate-100 text-slate-700',
    ENVIADO: 'bg-blue-100 text-blue-700',
    ACEPTADO: 'bg-green-100 text-green-700',
    RECHAZADO: 'bg-red-100 text-red-700',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (!presupuesto) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">Presupuesto no encontrado</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/presupuestos')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/presupuestos')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Presupuesto {presupuesto.numero}</h1>
          <p className="text-slate-500">Fecha: {new Date(presupuesto.createdAt).toLocaleDateString('es-MX')}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className={`px-3 py-1 rounded-full font-medium ${estadoColors[presupuesto.estado]}`}>
          {presupuesto.estado}
        </span>
        <Button variant="outline" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" /> Descargar PDF
        </Button>
        {presupuesto.estado === 'BORRADOR' && (
          <Button onClick={() => handleEstado('ENVIADO')}>
            <Send className="h-4 w-4 mr-2" /> Enviar a Cliente
          </Button>
        )}
        {presupuesto.estado === 'ENVIADO' && (
          <>
            <Button variant="default" onClick={() => handleEstado('ACEPTADO')}>
              <Check className="h-4 w-4 mr-2" /> Aceptar
            </Button>
            <Button variant="destructive" onClick={() => handleEstado('RECHAZADO')}>
              <X className="h-4 w-4 mr-2" /> Rechazar
            </Button>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <p className="font-medium">{presupuesto.cliente.nombre}</p>
            {presupuesto.cliente.email && <p className="text-slate-500">{presupuesto.cliente.email}</p>}
            {presupuesto.cliente.telefono && <p className="text-slate-500">{presupuesto.cliente.telefono}</p>}
            {presupuesto.cliente.direccion && <p className="text-slate-500">{presupuesto.cliente.direccion}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
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
              {presupuesto.detalles.map((d, i) => (
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
            <span>$AR {presupuesto.total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {presupuesto.observaciones && (
        <Card>
          <CardHeader>
            <CardTitle>Observaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">{presupuesto.observaciones}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}