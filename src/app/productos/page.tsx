'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Plus, Edit, Trash2, Droplets, Wine, Package, Search } from 'lucide-react';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  tipo: 'AGUA' | 'SODA';
  presentacion: string;
  precio: number;
  activo: boolean;
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'AGUA' | 'SODA'>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '', tipo: 'AGUA' as 'AGUA' | 'SODA', presentacion: '', precio: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/productos').then(res => res.json()).then(data => {
      setProductos(data);
      setLoading(false);
    });
  }, []);

  const filtered = productos
    .filter(p => filter === 'ALL' || p.tipo === filter)
    .filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()));

  async function handleSave() {
    if (!form.nombre.trim() || !form.presentacion.trim() || !form.precio) return;
    setSaving(true);
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `/api/productos/${editId}` : '/api/productos';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, precio: parseFloat(form.precio) }),
    });
    const res = await fetch('/api/productos');
    setProductos(await res.json());
    setShowModal(false);
    setForm({ nombre: '', descripcion: '', tipo: 'AGUA', presentacion: '', precio: '' });
    setEditId(null);
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar producto?')) return;
    await fetch(`/api/productos/${id}`, { method: 'DELETE' });
    const res = await fetch('/api/productos');
    setProductos(await res.json());
  }

  async function handleToggle(id: number, activo: boolean) {
    await fetch(`/api/productos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo }),
    });
    const res = await fetch('/api/productos');
    setProductos(await res.json());
  }

  function openEdit(producto: Producto) {
    setEditId(producto.id);
    setForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      tipo: producto.tipo,
      presentacion: producto.presentacion,
      precio: producto.precio.toString(),
    });
    setShowModal(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  const filterButtons = [
    { key: 'ALL', label: 'Todos', icon: Package },
    { key: 'AGUA', label: 'Agua', icon: Droplets },
    { key: 'SODA', label: 'Soda', icon: Wine },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Productos</h1>
          <p className="text-slate-500">{productos.length} productos en catálogo</p>
        </div>
        <Button onClick={() => { setEditId(null); setForm({ nombre: '', descripcion: '', tipo: 'AGUA', presentacion: '', precio: '' }); setShowModal(true); }} className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
          <Plus className="h-4 w-4 mr-2" /> Nuevo Producto
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2">
          {filterButtons.map(btn => (
            <Button
              key={btn.key}
              variant={filter === btn.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(btn.key as 'ALL' | 'AGUA' | 'SODA')}
              className={filter === btn.key ? (btn.key === 'AGUA' ? 'bg-sky-500' : btn.key === 'SODA' ? 'bg-orange-500' : 'bg-slate-700') : ''}
            >
              <btn.icon className="h-4 w-4 mr-1" />
              {btn.label}
            </Button>
          ))}
        </div>
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Buscar productos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-12 h-10 bg-white"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-0 shadow-lg shadow-slate-200/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 text-lg">No hay productos registrados</p>
            <Button onClick={() => setShowModal(true)} className="mt-4 bg-emerald-500 hover:bg-emerald-600">
              <Plus className="h-4 w-4 mr-2" /> Agregar primer producto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(producto => (
            <Card key={producto.id} className={`border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all ${!producto.activo ? 'opacity-60' : ''}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${producto.tipo === 'AGUA' ? 'bg-gradient-to-br from-sky-400 to-sky-600' : 'bg-gradient-to-br from-orange-400 to-orange-600'}`}>
                    {producto.tipo === 'AGUA' ? (
                      <Droplets className="w-6 h-6 text-white" />
                    ) : (
                      <Wine className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(producto)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <Edit className="h-4 w-4 text-slate-400" />
                    </button>
                    <button onClick={() => handleDelete(producto.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold text-slate-900 text-lg">{producto.nombre}</h3>
                  <p className="text-sm text-slate-500">{producto.presentacion}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-2xl font-bold text-slate-900">$AR {producto.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                  <button
                    onClick={() => handleToggle(producto.id, !producto.activo)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${producto.activo ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                  >
                    {producto.activo ? 'Activo' : 'Inactivo'}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? 'Editar Producto' : 'Nuevo Producto'}>
        <div className="space-y-4">
          <div>
            <Label className="text-slate-700">Nombre *</Label>
            <Input
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              placeholder="Nombre del producto"
              className="h-12 mt-1"
            />
          </div>
          <div>
            <Label className="text-slate-700">Tipo *</Label>
            <Select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value as 'AGUA' | 'SODA' })} className="h-12 mt-1">
              <option value="AGUA">Agua</option>
              <option value="SODA">Soda</option>
            </Select>
          </div>
          <div>
            <Label className="text-slate-700">Presentación *</Label>
            <Input
              value={form.presentacion}
              onChange={e => setForm({ ...form, presentacion: e.target.value })}
              placeholder="500ml, 1L, 20L, etc."
              className="h-12 mt-1"
            />
          </div>
          <div>
            <Label className="text-slate-700">Precio *</Label>
            <Input
              type="number"
              step="0.01"
              value={form.precio}
              onChange={e => setForm({ ...form, precio: e.target.value })}
              placeholder="0.00"
              className="h-12 mt-1"
            />
          </div>
          <div>
            <Label className="text-slate-700">Descripción</Label>
            <Input
              value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Descripción opcional"
              className="h-12 mt-1"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowModal(false)} className="h-11">Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !form.nombre.trim() || !form.presentacion.trim() || !form.precio} className="h-11 bg-emerald-500 hover:bg-emerald-600">
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}