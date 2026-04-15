'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, ArrowLeft, ShoppingCart, Droplets, Wine } from 'lucide-react';

interface Cliente {
  id: number;
  nombre: string;
}

interface Producto {
  id: number;
  nombre: string;
  tipo: 'AGUA' | 'SODA' | 'OTRO';
  presentacion: string;
  precio: number;
  activo: boolean;
  categoria: { nombre: string } | null;
}

interface DetalleItem {
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
}

export default function NuevaVentaPage() {
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [detalles, setDetalles] = useState<DetalleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showProducto, setShowProducto] = useState(false);

  useEffect(() => {
    fetch('/api/productos?activo=true').then(r => r.json()).then(data => {
      setProductos(data);
      setLoading(false);
    });
  }, []);

  const addProducto = (producto: Producto) => {
    const existente = detalles.find(d => d.productoId === producto.id);
    if (existente) {
      setDetalles(detalles.map(d => 
        d.productoId === producto.id 
          ? { ...d, cantidad: d.cantidad + 1, total: (d.cantidad + 1) * d.precioUnitario }
          : d
      ));
    } else {
      setDetalles([...detalles, { 
        productoId: producto.id, 
        productoNombre: `${producto.nombre} (${producto.presentacion})`,
        cantidad: 1, 
        precioUnitario: producto.precio, 
        total: producto.precio 
      }]);
    }
  };

  const updateCantidad = (productoId: number, cantidad: number) => {
    if (cantidad < 1) return;
    setDetalles(detalles.map(d => 
      d.productoId === productoId 
        ? { ...d, cantidad, total: cantidad * d.precioUnitario }
        : d
    ));
  };

  const removeProducto = (productoId: number) => {
    setDetalles(detalles.filter(d => d.productoId !== productoId));
  };

  const total = detalles.reduce((sum, d) => sum + d.total, 0);

  async function handleSave() {
    if (detalles.length === 0) return;
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ detalles }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al guardar');
        return;
      }

      router.push('/ventas');
    } catch {
      setError('Error de conexión');
    } finally {
      setSaving(false);
    }
  }

  const productosActivos = productos.filter(p => p.activo);

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'AGUA': return <Droplets className="w-5 h-5 text-sky-500" />;
      case 'SODA': return <Wine className="w-5 h-5 text-orange-500" />;
      default: return <ShoppingCart className="w-5 h-5 text-slate-500" />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'AGUA': return 'bg-sky-100';
      case 'SODA': return 'bg-orange-100';
      default: return 'bg-slate-100';
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/ventas')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Nueva Venta</h1>
            <p className="text-slate-500">Registrar venta</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg shadow-slate-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Productos</h2>
              <Button onClick={() => setShowProducto(!showProducto)} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Agregar
              </Button>
            </div>

            {showProducto && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {productosActivos.map(producto => (
                  <button
                    key={producto.id}
                    onClick={() => addProducto(producto)}
                    className={`p-3 rounded-xl text-left hover:scale-105 transition-transform ${getTipoColor(producto.tipo)}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {getTipoIcon(producto.tipo)}
                    </div>
                    <p className="font-medium text-sm text-slate-900">{producto.nombre}</p>
                    <p className="text-xs text-slate-500">{producto.presentacion}</p>
                    <p className="text-sm font-semibold text-slate-900 mt-1">
                      $AR {producto.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {!showProducto && (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400">Selecciona productos para agregar</p>
                <Button onClick={() => setShowProducto(true)} className="mt-4 bg-sky-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Ver Productos
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg shadow-slate-200/50">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Detalle de Venta</h2>

            {detalles.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400">Sin productos agregados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {detalles.map(detalle => (
                  <div key={detalle.productoId} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{detalle.productoNombre}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateCantidad(detalle.productoId, detalle.cantidad - 1)}
                        className="w-8 h-8 rounded-lg bg-slate-200 hover:bg-slate-300 flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">{detalle.cantidad}</span>
                      <button
                        onClick={() => updateCantidad(detalle.productoId, detalle.cantidad + 1)}
                        className="w-8 h-8 rounded-lg bg-slate-200 hover:bg-slate-300 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                    <div className="w-24 text-right">
                      <p className="font-medium">
                        $AR {detalle.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <button
                      onClick={() => removeProducto(detalle.productoId)}
                      className="p-2 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {detalles.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium text-slate-900">Total</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    $AR {total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm mb-4">
                    {error}
                  </div>
                )}
                <Button 
                  onClick={handleSave} 
                  disabled={saving || detalles.length === 0}
                  className="w-full h-12 text-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                >
                  {saving ? 'Guardando...' : 'Registrar Venta'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}