'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingCart, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Venta {
  id: number;
  numero: string;
  estado: 'COMPLETADA' | 'ANULADA';
  total: number;
  createdAt: string;
  cliente: { nombre: string } | null;
  cantidadItems: number;
}

export default function VentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [filter]);

  async function fetchData() {
    try {
      const url = filter === 'ALL' ? '/api/ventas' : `/api/ventas?estado=${filter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setVentas(data.map((v: any) => ({ ...v, cantidadItems: v.detalles?.length || 0 })));
      } else {
        setVentas([]);
      }
    } catch (err) {
      console.error('Error:', err);
      setVentas([]);
    }
    setLoading(false);
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Anular venta?')) return;
    try {
      const res = await fetch(`/api/ventas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Error:', err);
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'COMPLETADA': return 'bg-emerald-100 text-emerald-600';
      case 'ANULADA': return 'bg-red-100 text-red-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'COMPLETADA': return <CheckCircle className="w-4 h-4" />;
      case 'ANULADA': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Ventas</h1>
          <p className="text-slate-500">{ventas.length} ventas registradas</p>
        </div>
        <Link href="/ventas/nueva" className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 flex items-center gap-2 px-4 py-3 text-white rounded-xl font-medium">
          <Plus className="w-5 h-5" />
          Nueva Venta
        </Link>
      </div>

      <div className="flex gap-2">
        <Button variant={filter === 'ALL' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('ALL')}>
          Todas
        </Button>
        <Button variant={filter === 'COMPLETADA' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('COMPLETADA')} className={filter === 'COMPLETADA' ? 'bg-emerald-500' : ''}>
          <CheckCircle className="w-4 h-4 mr-1" />
          Completadas
        </Button>
        <Button variant={filter === 'ANULADA' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('ANULADA')} className={filter === 'ANULADA' ? 'bg-red-500' : ''}>
          <XCircle className="w-4 h-4 mr-1" />
          Anuladas
        </Button>
      </div>

      <Card className="border-0 shadow-lg shadow-slate-200/50">
        <CardContent className="p-0">
          {ventas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <ShoppingCart className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 text-lg">No hay ventas registradas</p>
              <Link href="/ventas/nueva" className="mt-4 bg-sky-500 hover:bg-sky-600 px-4 py-2 text-white rounded-lg font-medium">
                Registrar primera venta
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {ventas.map(venta => (
                <div key={venta.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                  <Link href={`/ventas/${venta.numero.replace('VENTA-', '')}`} className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-sky-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{venta.numero}</p>
                      <p className="text-sm text-slate-500">
                        {venta.cliente?.nombre || 'Sin cliente'} • {venta.cantidadItems} productos
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getEstadoColor(venta.estado)}`}>
                      {getEstadoIcon(venta.estado)}
                      {venta.estado}
                    </span>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        $AR {venta.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(venta.createdAt).toLocaleString('es-AR')}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(venta.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}