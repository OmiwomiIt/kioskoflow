'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingCart, Trash2, ArrowUpRight } from 'lucide-react';

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

  const filters = [
    { key: 'ALL', label: 'Todas' },
    { key: 'COMPLETADA', label: 'Completadas' },
    { key: 'ANULADA', label: 'Anuladas' },
  ];

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'COMPLETADA':
        return 'bg-emerald-50 text-emerald-600';
      case 'ANULADA':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-stone-100 text-stone-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 tracking-tight">Ventas</h1>
          <p className="text-stone-500 text-sm mt-0.5">{ventas.length} ventas registradas</p>
        </div>
        <Link href="/ventas/nueva">
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Venta
          </Button>
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              filter === f.key
                ? 'bg-orange-500 text-white'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {ventas.length === 0 ? (
        <Card className="border-0 shadow-md shadow-stone-200/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
              <ShoppingCart className="w-7 h-7 text-stone-400" />
            </div>
            <p className="text-stone-500 font-medium">No hay ventas</p>
            <Link href="/ventas/nueva">
              <Button className="mt-4">Registrar primera venta</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {ventas.map((venta) => (
            <Card key={venta.id} className="border-0 shadow-md shadow-stone-200/50 card-hover">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Link href={`/ventas/${venta.id}`} className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-stone-800">{venta.numero}</p>
                        <p className="text-xs text-stone-400">
                          {new Date(venta.createdAt).toLocaleString('es-AR')} · {venta.cantidadItems} items
                        </p>
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getEstadoBadge(venta.estado)}`}>
                      {venta.estado === 'COMPLETADA' ? 'Completada' : 'Anulada'}
                    </span>
                    <p className="font-bold text-stone-800">$AR {venta.total.toLocaleString('es-AR', { minimumFractionDigits: 0 })}</p>
                    <div className="flex gap-1">
                      {venta.estado === 'COMPLETADA' && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(venta.id);
                          }}
                          className="p-2 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      )}
                      <Link
                        href={`/ventas/${venta.id}`}
                        className="p-2 hover:bg-stone-100 rounded-xl transition-colors"
                      >
                        <ArrowUpRight className="w-4 h-4 text-stone-400" />
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}