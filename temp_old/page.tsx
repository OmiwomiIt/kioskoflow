'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, ArrowLeft, Save, Send } from 'lucide-react';

interface Cliente {
  id: number;
  nombre: string;
}

interface Producto {
  id: number;
  nombre: string;
  tipo: 'AGUA' | 'SODA';
  presentacion: string;
  precio: number;
  activo: boolean;
}

interface DetalleItem {
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
  total: number;
}

export default function NuevoPresupuestoPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<number | null>(null);
  const [detalles, setDetalles] = useState<DetalleItem[]>([]);
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showProducto, setShowProducto] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/clientes').then(r => r.json()),
      fetch('/api/productos?activo=true').then(r => r.json()),
    ]).then(([clientesData, productosData]) => {
      setClientes(clientesData);
      setProductos(productosData.filter((p: Producto) => p.activo));
      setLoading(false);
    });
  }, []);

  function addProducto(producto: Producto) {
    const existente = detalles.find(d => d.producto.id === producto.id);
    if (existente) {
      setDetalles(detalles.map(d => 
        d.producto.id === producto.id 
          ? { ...d, cantidad: d.cantidad + 1, total: (d.cantidad + 1) * d.precioUnitario }
          : d
      ));
    } else {
      setDetalles([...detalles, { producto, cantidad: 1, precioUnitario: producto.precio, total: producto.precio }]);
    }
    setShowProducto(false);
  }

  function updateCantidad(productoId: number, cantidad: number) {
    if (cantidad < 1) return;
    setDetalles(detalles.map(d => 
      d.producto.id === productoId 
        ? { ...d, cantidad, total: cantidad * d.precioUnitario }
        : d
    ));
  }

  function removeProducto(productoId: number) {
    setDetalles(detalles.filter(d => d.producto.id !== productoId));
  }

  const total = detalles.reduce((sum, d) => sum + d.total, 0);

  async function handleSave(estado: 'BORRADOR' | 'ENVIADO') {
    if (!selectedCliente || detalles.length === 0) {
      setError('Selecciona un cliente y agrega productos');
      return;
    }
    setSaving(true);
    setError('');

    const data = {
      clienteId: selectedCliente,
      estado,
      observaciones: observaciones || null,
      detalles: detalles.map(d => ({
        productoId: d.producto.id,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario,
      })),
    };

    try {
      const res = await fetch('/api/presupuestos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push('/presupuestos');
      } else {
        const errData = await res.json();
        setError(errData.error || 'Error al guardar');
        setSaving(false);
      }
    } catch (err) {
      setError('Error de conexión');
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/presupuestos')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Nuevo Presupuesto</h1>
          <p className="text-slate-500">Crea un nuevo presupuesto</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCliente?.toString() || ''} onChange={e => setSelectedCliente(parseInt(e.target.value))}>
            <option value="">Seleccionar cliente...</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Productos</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowProducto(true)}>
            <Plus className="h-4 w-4 mr-2" /> Agregar Producto
          </Button>
        </CardHeader>
        <CardContent>
          {detalles.length === 0 ? (
            <p className="text-slate-400 text-center py-4">No hay productos agregados</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Precio Unitario</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detalles.map(d => (
                  <TableRow key={d.producto.id}>
                    <TableCell>
                      <div className="font-medium">{d.producto.nombre}</div>
                      <div className="text-xs text-slate-400">{d.producto.presentacion}</div>
                    </TableCell>
                    <TableCell>$AR {d.precioUnitario.toFixed(2)}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={d.cantidad}
                        onChange={e => updateCantidad(d.producto.id, parseInt(e.target.value) || 1)}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>$AR {d.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeProducto(d.producto.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Totales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>$AR {total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Observaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={observaciones}
            onChange={e => setObservaciones(e.target.value)}
            placeholder="Observaciones adicionales..."
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push('/presupuestos')}>Cancelar</Button>
        <Button variant="outline" onClick={() => handleSave('BORRADOR')} disabled={!selectedCliente || detalles.length === 0 || saving}>
          <Save className="h-4 w-4 mr-2" /> Guardar Borrador
        </Button>
        <Button onClick={() => handleSave('ENVIADO')} disabled={!selectedCliente || detalles.length === 0 || saving}>
          <Send className="h-4 w-4 mr-2" /> Enviar a Cliente
        </Button>
      </div>

      {showProducto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowProducto(false)} />
          <div className="relative z-50 w-full max-w-lg bg-white rounded-xl shadow-lg p-6 mx-4 max-h-[80vh] overflow-auto">
            <h2 className="text-xl font-semibold mb-4">Agregar Producto</h2>
            <div className="space-y-2">
              {productos.map(p => (
                <button
                  key={p.id}
                  onClick={() => addProducto(p)}
                  className="w-full text-left p-3 rounded-lg hover:bg-slate-50 border transition-colors"
                >
                  <div className="font-medium">{p.nombre}</div>
                  <div className="text-sm text-slate-500">{p.presentacion} - ${p.precio.toFixed(2)}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}