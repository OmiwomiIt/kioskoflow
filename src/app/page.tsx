'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, ShoppingCart, DollarSign, Plus, ArrowRight, ArrowUpRight } from 'lucide-react';

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

  const statCards = [
    { title: 'Clientes', value: stats.clientes, icon: Users, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600' },
    { title: 'Productos', value: stats.productos, icon: Package, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { title: 'Ventas del Mes', value: `$AR ${stats.totalMes.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`, subtitle: `${stats.ventasMes} ventas`, icon: ShoppingCart, color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50', text: 'text-orange-600' },
    { title: 'Hoy', value: `$AR ${stats.totalHoy.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`, subtitle: `${stats.ventasHoy} ventas`, icon: DollarSign, color: 'from-stone-500 to-stone-600', bg: 'bg-stone-100', text: 'text-stone-600' },
  ];

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'COMPLETADA': return 'bg-emerald-50 text-emerald-600';
      case 'ANULADA': return 'bg-red-50 text-red-600';
      default: return 'bg-stone-100 text-stone-600';
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
    <div className="space-y-6 animate-stagger">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 tracking-tight">Dashboard</h1>
          <p className="text-stone-500 text-sm mt-0.5">Resumen de tu negocio</p>
        </div>
        <Link
          href="/ventas/nueva"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25 btn-active"
        >
          <Plus className="w-4 h-4" />
          Nueva Venta
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-0 shadow-md shadow-stone-200/50 overflow-hidden card-hover">
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">{stat.title}</p>
                  <p className="text-xl font-bold text-stone-800 mt-1">{stat.value}</p>
                  {stat.subtitle && <p className="text-xs text-stone-400 mt-0.5">{stat.subtitle}</p>}
                </div>
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.text}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-md shadow-stone-200/50 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-stone-100">
              <CardTitle className="text-lg font-semibold text-stone-800">Ventas Recientes</CardTitle>
              <Link href="/ventas" className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                Ver todas <ArrowRight className="w-4 h-4" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {recent.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-3">
                    <ShoppingCart className="w-6 h-6 text-stone-400" />
                  </div>
                  <p className="text-stone-400">No hay ventas aún</p>
                  <Link href="/ventas/nueva" className="text-orange-600 text-sm font-medium mt-2 inline-block">
                    Registrar primera venta
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-stone-50">
                  {recent.map((p) => (
                    <Link
                      key={p.numero}
                      href={`/ventas/${p.numero.replace('VENTA-', '')}`}
                      className="flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-stone-800">{p.numero}</p>
                          <p className="text-xs text-stone-400">{new Date(p.createdAt).toLocaleString('es-AR')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getEstadoColor(p.estado)}`}>
                          {p.estado}
                        </span>
                        <div className="text-right">
                          <p className="font-semibold text-stone-800">$AR {p.total.toLocaleString('es-AR', { minimumFractionDigits: 0 })}</p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-stone-300" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-0 shadow-md shadow-stone-200/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-stone-800">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
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
                  <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center">
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
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
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
                  <div className="w-9 h-9 rounded-xl bg-stone-600 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-stone-700">Cerrar Caja</span>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-stone-600 group-hover:translate-x-1 transition-all" />
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md shadow-stone-200/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-stone-800">Resumen del Mes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-500">Ventas del mes</span>
                  <span className="text-sm font-semibold text-stone-800">{stats.ventasMes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-500">Ventas de hoy</span>
                  <span className="text-sm font-semibold text-orange-600">{stats.ventasHoy}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <span className="text-sm text-stone-500">Total hoy</span>
                  <span className="text-sm font-bold text-stone-800">$AR {stats.totalHoy.toLocaleString('es-AR', { minimumFractionDigits: 0 })}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}