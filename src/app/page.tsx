'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, ShoppingCart, TrendingUp, Clock, CheckCircle, DollarSign, Plus, ArrowRight, FileText, UserCog } from 'lucide-react';

interface Stats {
  clientes: number;
  productos: number;
  ventas: number;
  ventasMes: number;
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
        ventasHoy: ventasDeHoy.length,
        totalHoy: ventasDeHoy.reduce((sum: number, v: any) => sum + v.total, 0),
      });
      
      setRecent(ventas.filter((v: any) => v.estado === 'COMPLETADA').slice(0, 5));
      setLoading(false);
    }
    fetchData();
  }, []);

  const statCards = [
    { title: 'Clientes', value: stats.clientes, icon: Users, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10' },
    { title: 'Productos', value: stats.productos, icon: Package, color: 'from-emerald-500 to-emerald-600', bgColor: 'bg-emerald-500/10' },
    { title: 'Ventas del Mes', value: stats.ventasMes, subtitle: `${stats.ventas} total`, icon: ShoppingCart, color: 'from-sky-500 to-sky-600', bgColor: 'bg-sky-500/10' },
    { title: 'Hoy', value: `$AR ${stats.totalHoy.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, subtitle: `${stats.ventasHoy} ventas`, icon: DollarSign, color: 'from-emerald-500 to-emerald-600', bgColor: 'bg-emerald-500/10' },
  ];

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'COMPLETADA': return 'bg-emerald-100 text-emerald-600';
      case 'ANULADA': return 'bg-red-100 text-red-600';
      default: return 'bg-slate-100 text-slate-600';
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Resumen de tu negocio</p>
        </div>
        <Link
          href="/ventas/nueva"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-xl font-medium hover:from-sky-600 hover:to-sky-700 transition-all shadow-lg shadow-sky-500/25"
        >
          <Plus className="w-5 h-5" />
          Nueva Venta
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-0 shadow-lg shadow-slate-200/50 overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                  {stat.subtitle && <p className="text-xs text-slate-400 mt-1">{stat.subtitle}</p>}
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color.replace('from-', 'text-').replace(' to-', '/')}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg shadow-slate-200/50">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100">
              <CardTitle className="text-lg font-semibold text-slate-900">Ventas Recientes</CardTitle>
              <Link href="/ventas" className="text-sm text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1">
                Ver todas <ArrowRight className="w-4 h-4" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {recent.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400">No hay ventas aún</p>
                  <Link href="/ventas/nueva" className="text-sky-600 text-sm font-medium mt-2 inline-block">
                    Registrar primera venta
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recent.map((p) => (
                    <Link
                      key={p.numero}
                      href={`/ventas/${p.numero.replace('VENTA-', '')}`}
                      className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-sky-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{p.numero}</p>
                          <p className="text-sm text-slate-500">{new Date(p.createdAt).toLocaleString('es-AR')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(p.estado)}`}>
                          {p.estado}
                        </span>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">$AR {p.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-0 shadow-lg shadow-slate-200/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                href="/ventas/nueva"
                className="flex items-center justify-between p-4 rounded-xl bg-sky-50 hover:bg-sky-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-500 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-slate-700">Nueva Venta</span>
                </div>
                <ArrowRight className="w-5 h-5 text-sky-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
              </Link>
              <Link
                href="/clientes"
                className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-slate-700">Ver Clientes</span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
              </Link>
              <Link
                href="/productos"
                className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-slate-700">Ver Productos</span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
              </Link>
              <Link
                href="/caja"
                className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-slate-700">Cerrar Caja</span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-slate-200/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Resumen del Mes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Ventas del mes</span>
                  <span className="font-semibold text-slate-900">{stats.ventasMes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Ventas de hoy</span>
                  <span className="font-semibold text-emerald-600">{stats.ventasHoy}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Total hoy</span>
                  <span className="font-semibold text-orange-600">$AR {stats.totalHoy.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}