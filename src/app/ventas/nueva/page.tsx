'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Plus, Trash2, ArrowLeft, ShoppingCart, Droplets, Wine, ScanBarcode, Search } from 'lucide-react';
import { BarcodeScanner } from '@/components/barcode-scanner';

interface Cliente {
  id: number;
  nombre: string;
}

interface Producto {
  id: number;
  nombre: string;
  codigoBarra: string | null;
  tipo: 'AGUA' | 'SODA' | 'OTRO';
  presentacion: string;
  precio: number;
  activo: boolean;
  categoria: { nombre: string } | null;
  permiteFraccion: boolean;
  unidadMedida: string;
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
  const [showProducto, setShowProducto] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [productosMap, setProductosMap] = useState<Map<number, Producto>>(new Map());
  const [busquedaTexto, setBusquedaTexto] = useState('');

  const handleBarcodeScanned = async (decodedText: string) => {
    const found = productos.find(p => p.codigoBarra === decodedText);
    if (found) {
      addProducto(found);
    } else {
      setError('Producto no encontrado');
      setTimeout(() => setError(''), 3000);
    }
    setShowScanner(false);
  };

  useEffect(() => {
    fetch('/api/productos?activo=true').then(r => r.json()).then(data => {
      setProductos(data);
      const map = new Map();
      data.forEach((p: Producto) => map.set(p.id, p));
      setProductosMap(map);
      setLoading(false);
    });
  }, []);

  const buscarPorTexto = (texto: string) => {
    const found = productosFiltrados.find(p => 
      p.codigoBarra === texto || 
      p.nombre.toLowerCase() === texto.toLowerCase()
    );
    if (found) {
      addProducto(found);
      setBusquedaTexto('');
    } else {
      setError('Producto no encontrado');
      setTimeout(() => setError(''), 3000);
    }
  };

  const addProducto = (producto: Producto) => {
    const existente = detalles.find(d => d.productoId === producto.id);
    if (existente) {
      const incremento = producto.permiteFraccion ? 0.5 : 1;
      setDetalles(detalles.map(d => 
        d.productoId === producto.id 
          ? { ...d, cantidad: d.cantidad + incremento, total: (d.cantidad + incremento) * d.precioUnitario }
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
    if (cantidad <= 0) return;
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

  const productosFiltrados = productos.filter(p => p.activo && 
    (busquedaTexto === '' || 
     p.nombre.toLowerCase().includes(busquedaTexto.toLowerCase()) ||
     p.codigoBarra?.includes(busquedaTexto) ||
     p.presentacion.toLowerCase().includes(busquedaTexto.toLowerCase()))
  );

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
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por código o nombre..."
                  value={busquedaTexto}
                  onChange={e => setBusquedaTexto(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const txt = busquedaTexto.trim();
                      if (txt) {
                        const found = productosFiltrados.find(p => 
                          p.codigoBarra === txt || 
                          p.nombre.toLowerCase() === txt.toLowerCase()
                        );
                        if (found) {
                          addProducto(found);
                          setBusquedaTexto('');
                        } else {
                          setError('Producto no encontrado');
                          setTimeout(() => setError(''), 3000);
                        }
                      }
                    }
                  }}
                  className="pl-10 h-10"
                />
              </div>
              <Button variant="outline" onClick={() => setShowScanner(true)} disabled={false} className="h-10">
                <ScanBarcode className="w-4 h-4" />
              </Button>
            </div>

            {error && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm mb-4">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Productos</h2>
              <span className="text-sm text-slate-500">{productosFiltrados.length} disponibles</span>
            </div>

            {showProducto && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 max-h-96 overflow-y-auto">
                {productosFiltrados.map(producto => (
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
                {detalles.map(detalle => {
                  const producto = productosMap.get(detalle.productoId);
                  const permiteFraccion = producto?.permiteFraccion;
                  const unidadMedida = producto?.unidadMedida;
                  return (
                    <div key={detalle.productoId} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{detalle.productoNombre}</p>
                        {permiteFraccion && unidadMedida && (
                          <p className="text-xs text-slate-400">{unidadMedida}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {permiteFraccion ? (
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={detalle.cantidad}
                            onChange={e => {
                              const val = parseFloat(e.target.value);
                              if (val > 0) {
                                updateCantidad(detalle.productoId, val);
                              }
                            }}
                            className="w-20 h-9 rounded-lg border border-slate-200 px-2 text-center font-medium"
                          />
                        ) : (
                          <>
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
                          </>
                        )}
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
                  );
                })}
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

      <Modal open={showScanner} onClose={() => setShowScanner(false)} title="Escanear Código">
        <BarcodeScanner onScan={handleBarcodeScanned} onClose={() => setShowScanner(false)} />
      </Modal>
    </div>
  );
}