'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Plus, Trash2, ArrowLeft, ShoppingCart, Droplets, Wine, ScanBarcode, Search, Loader2 } from 'lucide-react';
import { BarcodeScanner } from '@/components/barcode-scanner';

interface Producto {
  id: number;
  nombre: string;
  codigoBarra: string | null;
  tipo: 'AGUA' | 'SODA' | 'OTRO';
  presentacion: string;
  precio: number;
  activo: boolean;
  permiteFraccion: boolean;
  unidadMedida: string;
}

interface DetalleItem {
  productoId: number;
  productoNombre: string;
  cantidad: number;
}

export default function NuevaVentaPage() {
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [detalles, setDetalles] = useState<DetalleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [productosMap, setProductosMap] = useState<Map<number, Producto>>(new Map());
  const [busquedaTexto, setBusquedaTexto] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  const getProducto = (id: number) => productosMap.get(id);

  const getDetalleTotal = (productoId: number, cantidad: number) => {
    const p = getProducto(productoId);
    return p ? cantidad * p.precio : 0;
  };

  const handleBarcodeScanned = async (decodedText: string) => {
    const found = productos.find(p => p.codigoBarra === decodedText);
    if (found) {
      addProducto(found);
    } else {
      setError('Producto no encontrado');
      setTimeout(() => setError(''), 3000);
    }
    setShowScanner(false);
    setBusquedaTexto('');
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

  const addProducto = (producto: Producto) => {
    const existente = detalles.find(d => d.productoId === producto.id);
    if (existente) {
      const incremento = producto.permiteFraccion ? 0.5 : 1;
      setDetalles(detalles.map(d => 
        d.productoId === producto.id 
          ? { ...d, cantidad: d.cantidad + incremento }
          : d
      ));
    } else {
      setDetalles([...detalles, { 
        productoId: producto.id, 
        productoNombre: `${producto.nombre} (${producto.presentacion})`,
        cantidad: 1,
      }]);
    }
    setMensajeExito(`${producto.nombre} agregado`);
    setTimeout(() => setMensajeExito(''), 2000);
  };

  const updateCantidad = (productoId: number, cantidad: number) => {
    if (cantidad < 0) return;
    setDetalles(detalles.map(d => 
      d.productoId === productoId 
        ? { ...d, cantidad }
        : d
    ));
  };

  const removeProducto = (productoId: number) => {
    setDetalles(detalles.filter(d => d.productoId !== productoId));
  };

  const total = detalles.reduce((sum, d) => sum + getDetalleTotal(d.productoId, d.cantidad), 0);

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
      default: return <ShoppingCart className="w-5 h-5 text-stone-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full animate-spin border-2 border-orange-500/30"></div>
          <div className="absolute inset-0 rounded-full border-2 border-orange-500/60"></div>
        </div>
        <p className="mt-4 text-stone-600">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/ventas')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-stone-900 tracking-tight">Nueva Venta</h1>
            <p className="text-stone-500 mt-1">Registrar venta</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-2xl bg-orange-50 flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 text-orange-600" />
          </div>
          <span className="text-xs text-stone-500">Modo venta activa</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-8">
        {/* Left Panel: Product Search */}
        <section className="lg:sticky lg:top-[5rem]">
          <div className="space-y-6">
            <div className="space-y-4">
              <label htmlFor="search" className="text-sm font-semibold text-stone-800">
                Buscar productos
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <Input
                  id="search"
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
                  className="pl-10 h-11"
                />
                <Button 
                  variant="outline" 
                  onClick={() => setShowScanner(true)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-10"
                >
                  <ScanBarcode className="w-4 h-4" />
                </Button>
              </div>
              
              {error && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}
              
              {mensajeExito && (
                <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-sm">
                  {mensajeExito}
                </div>
              )}
              
              {busquedaTexto.length > 0 && productosFiltrados.length > 0 && (
                <div className="mt-4 max-h-[300px] overflow-y-auto">
                  <div className="divide-y divide-stone-100">
                    {productosFiltrados.slice(0, 8).map(producto => (
                      <div 
                        key={producto.id} 
                        className="flex items-center gap-3 p-4 hover:bg-orange-50 transition-colors cursor-pointer"
                        onClick={() => addProducto(producto)}
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-orange-50">
                          {getTipoIcon(producto.tipo)}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="font-medium text-stone-900">{producto.nombre}</p>
                          <p className="text-xs text-stone-500">{producto.presentacion}</p>
                          <p className="text-sm font-semibold text-stone-900 tabular-nums">
                            $AR {producto.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {busquedaTexto.length === 0 && (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <p className="text-stone-400">Escribe para buscar productos</p>
                </div>
              )}
            </div>
            
            {!busquedaTexto && productos.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-stone-800">Productos recientes</h2>
                  <Button variant="outline" size="sm" onClick={() => setBusquedaTexto('')}>
                    Ver todos
                  </Button>
                </div>
                <div className="space-y-3">
                  {productos.slice(0, 4).map(producto => (
                    <div 
                      key={producto.id} 
                      className="flex items-center gap-3 p-3 hover:bg-orange-50 transition-colors cursor-pointer rounded-lg"
                      onClick={() => addProducto(producto)}
                    >
                      <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-orange-50">
                        {getTipoIcon(producto.tipo)}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="font-medium text-stone-900">{producto.nombre}</p>
                        <p className="text-xs text-stone-500">{producto.presentacion}</p>
                        <p className="text-sm font-semibold text-stone-900 tabular-nums">
                          $AR {producto.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
        
        <section className="space-y-6">
          <div className="border-0 rounded-2xl bg-white shadow-sm border border-stone-100">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-stone-900 tracking-tight mb-4">Detalle de Venta</h2>
              
              {detalles.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-stone-200 mx-auto mb-4" />
                  <p className="text-stone-500">Sin productos agregados</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setBusquedaTexto('')} 
                    className="mt-4"
                  >
                    Agregar productos
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {detalles.map(detalle => {
                      const producto = productosMap.get(detalle.productoId);
                      const permiteFraccion = producto?.permiteFraccion;
                      const unidadMedida = producto?.unidadMedida;
                      return (
                        <div 
                          key={detalle.productoId} 
                          className="flex items-center justify-between p-4 bg-stone-50 rounded-xl"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-stone-900">{detalle.productoNombre}</p>
                            {permiteFraccion && unidadMedida && (
                              <p className="text-xs text-stone-400">{unidadMedida}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {permiteFraccion ? (
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0"
                                value={detalle.cantidad || ''}
                                onChange={e => {
                                  const val = parseFloat(e.target.value);
                                  if (isNaN(val) || val === 0) {
                                    updateCantidad(detalle.productoId, 0);
                                  } else {
                                    updateCantidad(detalle.productoId, val);
                                  }
                                }}
                                onFocus={e => e.target.select()}
                                className="w-20 h-9 rounded-lg border border-stone-200 px-2 text-center font-medium tabular-nums"
                              />
                            ) : (
                              <>
                                <button
                                  onClick={() => updateCantidad(detalle.productoId, detalle.cantidad - 1)}
                                  className="w-8 h-8 rounded-lg bg-stone-200 hover:bg-stone-300 flex items-center justify-center transition-colors"
                                >
                                  –
                                </button>
                                <span className="w-8 text-center font-medium tabular-nums">{detalle.cantidad}</span>
                                <button
                                  onClick={() => updateCantidad(detalle.productoId, detalle.cantidad + 1)}
                                  className="w-8 h-8 rounded-lg bg-stone-200 hover:bg-stone-300 flex items-center justify-center transition-colors"
                                >
                                  +
                                </button>
                              </>
                            )}
                          </div>
                          <div className="w-24 text-right">
                            <p className="font-medium text-stone-900 tabular-nums">
                              $AR {getDetalleTotal(detalle.productoId, detalle.cantidad).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <button
                            onClick={() => removeProducto(detalle.productoId)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-stone-100">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-medium text-stone-900">Total</span>
                      <span className="text-3xl font-bold text-orange-600 tracking-tight tabular-nums">
                        $AR {total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    
                    {error && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                        {error}
                      </div>
                    )}
                    
                    <Button 
                      onClick={handleSave} 
                      disabled={saving || detalles.length === 0}
                      className="w-full h-12 text-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25 transition-all duration-200 btn-active"
                    >
                      {saving ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Guardando...
                        </span>
                      ) : (
                        'Registrar Venta'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}