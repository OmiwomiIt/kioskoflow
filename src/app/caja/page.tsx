'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, ShoppingCart, Clock, CheckCircle, RotateCcw } from 'lucide-react';

interface VentaDelDia {
  id: number;
  numero: string;
  total: number;
  createdAt: string;
  detalles: { cantidad: number; producto: { nombre: string }; total: number }[];
}

interface Cierre {
  id: number;
  fecha: string;
  totalVentas: number;
  cantidadVentas: number;
  detalles: Record<string, { nombre: string; cantidad: number; total: number }>;
}

export default function CajaPage() {
  const [cierres, setCierres] = useState<Cierre[]>([]);
  const [ventas, setVentas] = useState<VentaDelDia[]>([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [selectedCierre, setSelectedCierre] = useState<Cierre | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/caja').then(res => res.json()),
      fetch('/api/caja?tipo=ventas').then(res => res.json()),
    ]).then(([cierresData, ventasData]) => {
      setCierres(cierresData);
      setVentas(ventasData);
      setLoading(false);
    });
  }, []);

  async function handleCierre() {
    if (!confirm('¿Generar cierre de caja?')) return;
    setClosing(true);
    try {
      const res = await fetch('/api/caja', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Error al generar cierre');
        setClosing(false);
        return;
      }
      const cierre = await res.json();
      setCierres([cierre, ...cierres]);
      setSelectedCierre(cierre);
    } catch {
      alert('Error de conexión');
    }
    setClosing(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  const ventasDelDia = ventas;
  const totalVentasDia = ventasDelDia.reduce((sum, v) => sum + v.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Caja</h1>
          <p className="text-slate-500">Gestión de caja y cierres</p>
        </div>
        <Button 
          onClick={handleCierre} 
          disabled={closing}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
        >
          {closing ? (
            <span className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 animate-spin" />
              Cerrando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Cerrar Caja
            </span>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg shadow-slate-200/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Ventas de Hoy</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{ventasDelDia.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-sky-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg shadow-slate-200/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total de Hoy</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  $AR {totalVentasDia.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg shadow-slate-200/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Último Cierre</p>
                <p className="text-lg font-semibold text-slate-900 mt-1">
                  {cierres[0] ? new Date(cierres[0].fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedCierre && (
        <Card className="border-0 shadow-lg shadow-slate-200/50">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-semibold text-slate-900">
              Detalle del Cierre
              <span className="text-sm font-normal text-slate-500 ml-2">
                {new Date(selectedCierre.fecha).toLocaleString('es-AR')}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Producto</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Cantidad</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(selectedCierre.detalles).map((item, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="py-3 px-4">{item.nombre}</td>
                      <td className="py-3 px-4 text-right font-medium">{item.cantidad}</td>
                      <td className="py-3 px-4 text-right font-medium">
                        $AR {item.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50">
                    <td className="py-3 px-4 font-semibold">TOTAL</td>
                    <td className="py-3 px-4 text-right font-semibold">
                      {Object.values(selectedCierre.detalles).reduce((sum, i) => sum + i.cantidad, 0)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-600">
                      $AR {selectedCierre.totalVentas.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-lg shadow-slate-200/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Historial de Cierres</CardTitle>
        </CardHeader>
        <CardContent>
          {cierres.length === 0 ? (
            <p className="text-center text-slate-400 py-8">No hay cierres registrados</p>
          ) : (
            <div className="space-y-2">
              {cierres.map(cierre => (
                <div
                  key={cierre.id}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedCierre(cierre)}
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {new Date(cierre.fecha).toLocaleString('es-AR')}
                    </p>
                    <p className="text-sm text-slate-500">{cierre.cantidadVentas} ventas</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600">
                      $AR {cierre.totalVentas.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </p>
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