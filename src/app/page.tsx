'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Package, ShoppingCart, DollarSign, Plus, ArrowRight, ArrowUpRight, Loader2 } from 'lucide-react';

interface Stats {
  clientes: number;
  productos: number;
  ventas: number;
  ventasMes: number;
  totalMes: number;
  ventasHoy: number;
  totalHoy: number;
}

interface Recent {
  numero: string;
  total: number;
  createdAt: string;
  estado: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    clientes: 0,
    productos: 0,
    ventas: 0,
    ventasMes: 0,
    totalMes: 0,
    ventasHoy: 0,
    totalHoy: 0,
  });
  const [recent, setRecent] = useState<Recent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [clientesRes, productosRes, ventasRes, cajaRes] = await Promise.all([
        fetch('/api/clientes'),
        fetch('/api/productos?activo=true'),
        fetch('/api/ventas'),
        fetch('/api/caja'),
      ]);
      const clientes = await clientesRes.json();
      const productos = await productosRes.json();
      const ventas = await ventasRes.json();
      const cierres = await cajaRes.json();

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const ventasDelMes = ventas.filter((v: any) => new Date(v.createdAt) >= startOfMonth && v.estado === 'COMPLETADA');
      const ventasDeHoy = ventas.filter((v: any) => new Date(v.createdAt) >= startOfDay && v.estado === 'COMPLETADA');
      
      setStats({
        clientes: clientes.length,
        productos: productos.length,
        ventas: ventas.length,
        ventasMes: ventasDelMes.length,
        totalMes: ventasDelMes.reduce((sum: number, v: any) => sum + v.total, 0),
        ventasHoy: ventasDeHoy.length,
        totalHoy: ventasDeHoy.reduce((sum: number, v: any) => sum + v.total, 0),
      });
      
      setRecent(ventas.filter((v: any) => v.estado === 'COMPLETADA').slice(0, 5));
      setLoading(false);
    }
    fetchData();
  }, []);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'COMPLETADA': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ANULADA': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-14 h-14 mx-auto">
            <div className="absolute inset-0 rounded-full animate-spin border-2 border-orange-500/30"></div>
            <div className="absolute inset-0 rounded-full border-2 border-orange-500/60"></div>
          </div>
          <p className="text-stone-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-stone-900 tracking-tight">Dashboard</h1>
          <p className="text-stone-500 text-sm mt-1">Resumen de tu negocio</p>
        </div>
        <Link
          href="/ventas/nueva"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25 btn-active"
        >
          <Plus className="w-4 h-4" />
          Nueva Venta
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-xs text-stone-500 uppercase tracking-wide font-medium">Clientes</p>
              <p className="text-3xl font-bold text-stone-900 tabular-nums">{stats.clientes.toLocaleString('es-AR')}</p>
              <p className="text-sm text-stone-600 mt-1">Total registrados</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-stone-500 uppercase tracking-wide font-medium">Productos</p>
              <p className="text-3xl font-bold text-stone-900 tabular-nums">{stats.productos.toLocaleString('es-AR')}</p>
              <p className="text-sm text-stone-600 mt-1">En catálogo</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl shadow-sm border border-orange-200 p-6">
          <div className="space-y-1">
            <p className="text-xs text-orange-700 uppercase tracking-wide font-medium">Ventas del mes</p>
            <p className="text-3xl font-bold text-orange-900 tabular-nums">$AR {stats.totalMes.toLocaleString('es-AR', { minimumFractionDigits: 0 })}</p>
            <p className="text-sm text-orange-700 mt-1">{stats.ventasMes} ventas</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100">
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <h2 className="text-xl font-bold text-stone-900">Ventas Recientes</h2>
              <Link href="/ventas" className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                Ver todas <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-6">
              {recent.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <p className="text-stone-400">No hay ventas aún</p>
                  <Link href="/ventas/nueva" className="text-orange-600 text-sm font-medium mt-2 inline-block">
                    Registrar primera venta
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recent.map((v) => (
                    <Link
                      key={v.numero}
                      href={`/ventas/${v.numero.replace('VENTA-', '')}`}
                      className="flex items-center justify-between p-4 hover:bg-stone-50 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-stone-900">{v.numero}</p>
                          <p className="text-xs text-stone-500">{new Date(v.createdAt).toLocaleString('es-AR')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getEstadoColor(v.estado)}`}>
                          {v.estado}
                        </span>
                        <div className="text-right">
                          <p className="font-semibold text-stone-900 tabular-nums">$AR {v.total.toLocaleString('es-AR', { minimumFractionDigits: 0 })}</p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-stone-300" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
            <h3 className="text-lg font-bold text-stone-900 mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              <Link
                href="/ventas/nueva"
                className="flex items-center justify-between p-3.5 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-stone-700">Nueva Venta</span>
                </div>
                <ArrowRight className="w-4 h-4 text-orange-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
              </Link>
              <Link
                href="/clientes"
                className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-stone-900 flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-stone-700">Ver Clientes</span>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-stone-600 group-hover:translate-x-1 transition-all" />
              </Link>
              <Link
                href="/productos"
                className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-stone-900 flex items-center justify-center">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-stone-700">Ver Productos</span>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-stone-600 group-hover:translate-x-1 transition-all" />
              </Link>
              <Link
                href="/caja"
                className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-stone-900 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-stone-700">Cerrar Caja</span>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-stone-600 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
            <h3 className="text-lg font-bold text-stone-900 mb-4">Resumen del Mes</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-stone-100">
                <span className="text-sm text-stone-600">Ventas del mes</span>
                <span className="text-sm font-semibold text-stone-900 tabular-nums">{stats.ventasMes}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-stone-100">
                <span className="text-sm text-stone-600">Ventas de hoy</span>
                <span className="text-sm font-semibold text-orange-600 tabular-nums">{stats.ventasHoy}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-stone-600">Total hoy</span>
                <span className="text-sm font-bold text-stone-900 tabular-nums">$AR {stats.totalHoy.toLocaleString('es-AR', { minimumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}