'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, AlertTriangle, Search, Eye, PackageX } from 'lucide-react';

interface Producto {
  id: number;
  nombre: string;
  stock: number;
  presentacion: string;
  categoria: { nombre: string } | null;
}

export default function InventarioPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [minStock, setMinStock] = useState('5');

  useEffect(() => {
    fetch('/api/productos').then(r => r.json()).then(data => {
      setProductos(data);
      setLoading(false);
    });
  }, []);

  const umbral = parseInt(minStock) || 5;
  const filtered = productos.filter(p => p.stock <= umbral);

  const totalStock = productos.reduce((sum, p) => sum + p.stock, 0);
  const sinStock = productos.filter(p => p.stock === 0).length;
  const bajoStock = filtered.length;

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
          <h1 className="text-3xl font-bold text-slate-900">Inventario</h1>
          <p className="text-slate-500">{productos.length} productos en catálogo</p>
        </div>
        <Link href="/productos">
          <Button className="bg-emerald-500">
            <Package className="w-4 h-4 mr-2" />
            Gestionar Productos
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg shadow-slate-200/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Stock</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{totalStock}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-sky-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg shadow-slate-200/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Sin Stock</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{sinStock}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                <PackageX className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg shadow-slate-200/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Bajo Stock (&lt;{umbral})</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{bajoStock}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg shadow-slate-200/50">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Buscar productos..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-12 h-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Stock menor a:</span>
              <Input
                type="number"
                value={minStock}
                onChange={e => setMinStock(e.target.value)}
                className="w-20 h-10"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400">No hay productos bajo el umbral</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered
                .filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()))
                .map(producto => (
                  <div
                    key={producto.id}
                    className={`flex items-center justify-between p-4 rounded-xl ${
                      producto.stock === 0 ? 'bg-red-50' : 'bg-orange-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        producto.stock === 0 ? 'bg-red-100' : 'bg-orange-100'
                      }`}>
                        {producto.stock === 0 ? (
                          <PackageX className="w-5 h-5 text-red-600" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-orange-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{producto.nombre}</p>
                        <p className="text-sm text-slate-500">
                          {producto.presentacion}
                          {producto.categoria && ` • ${producto.categoria.nombre}`}
                        </p>
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${
                      producto.stock === 0 ? 'text-red-600' : 'text-orange-600'
                    }`}>
                      {producto.stock}
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