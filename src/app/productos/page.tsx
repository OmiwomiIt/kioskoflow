'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { Plus, Edit, Trash2, Package, Search, FolderOpen, Tag } from 'lucide-react';

interface Categoria {
  id: number;
  nombre: string;
  activo: boolean;
}

interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  presentacion: string;
  precio: number;
  activo: boolean;
  categoria: Categoria | null;
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '', presentacion: '', precio: '', categoriaId: '' });
  const [catForm, setCatForm] = useState({ nombre: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/productos').then(r => r.json()),
      fetch('/api/categorias').then(r => r.json()),
    ]).then(([productosData, categoriasData]) => {
      setProductos(productosData);
      setCategorias(categoriasData);
      setLoading(false);
    });
  }, []);

  const filtered = productos
    .filter(p => filter === 'ALL' || p.categoria?.id === parseInt(filter))
    .filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()));

  const getCatColor = (index: number) => {
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-orange-500', 'bg-purple-500', 'bg-pink-500', 'bg-cyan-500'];
    return colors[index % colors.length];
  };

  async function handleSave() {
    if (!form.nombre.trim() || !form.presentacion.trim() || !form.precio) return;
    setSaving(true);
    const data = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      presentacion: form.presentacion,
      precio: parseFloat(form.precio),
      tipo: 'OTRO',
      categoriaId: form.categoriaId ? parseInt(form.categoriaId) : null,
    };
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `/api/productos/${editId}` : '/api/productos';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const res = await fetch('/api/productos');
    setProductos(await res.json());
    setShowModal(false);
    setForm({ nombre: '', descripcion: '', presentacion: '', precio: '', categoriaId: '' });
    setEditId(null);
    setSaving(false);
  }

  async function handleSaveCategoria() {
    if (!catForm.nombre.trim()) return;
    setSaving(true);
    await fetch('/api/categorias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(catForm),
    });
    const res = await fetch('/api/categorias');
    setCategorias(await res.json());
    setCatForm({ nombre: '' });
    setShowCatModal(false);
    setSaving(false);
  }

  async function handleDeleteCategoria(id: number) {
    if (!confirm('¿Eliminar categoría?')) return;
    await fetch(`/api/categorias/${id}`, { method: 'DELETE' });
    const res = await fetch('/api/categorias');
    setCategorias(await res.json());
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
      presentacion: producto.presentacion,
      precio: producto.precio.toString(),
      categoriaId: producto.categoria?.id?.toString() || '',
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
    ...categorias.map((c, i) => ({ key: c.id.toString(), label: c.nombre, color: getCatColor(i) })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Productos</h1>
          <p className="text-slate-500">{productos.length} productos en catálogo</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCatModal(true)}>
            <FolderOpen className="h-4 w-4 mr-2" />
            Categorías
          </Button>
          <Button onClick={() => { setEditId(null); setForm({ nombre: '', descripcion: '', presentacion: '', precio: '', categoriaId: '' }); setShowModal(true); }} className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
            <Plus className="h-4 w-4 mr-2" /> Nuevo Producto
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2 flex-wrap">
          {filterButtons.map((btn, index) => (
            <Button
              key={btn.key}
              variant={filter === btn.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(btn.key)}
              className={filter === btn.key && btn.key !== 'ALL' ? (btn as any).color || 'bg-slate-700' : ''}
            >
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
          {filtered.map(producto => {
            const catIndex = categorias.findIndex(c => c.id === producto.categoria?.id);
            return (
              <Card key={producto.id} className={`border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all ${!producto.activo ? 'opacity-60' : ''}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${getCatColor(catIndex >= 0 ? catIndex : 0)} from-slate-500 to-slate-600`}>
                      <Tag className="w-6 h-6 text-white" />
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
                    {producto.categoria && (
                      <span className="text-xs text-slate-400">{producto.categoria.nombre}</span>
                    )}
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
            );
          })}
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
            <Label className="text-slate-700">Categoría</Label>
            <select
              value={form.categoriaId}
              onChange={e => setForm({ ...form, categoriaId: e.target.value })}
              className="h-12 mt-1 w-full rounded-lg border border-slate-200 px-3"
            >
              <option value="">Sin categoría</option>
              {categorias.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-slate-700">Presentación *</Label>
            <Input
              value={form.presentacion}
              onChange={e => setForm({ ...form, presentacion: e.target.value })}
              placeholder="500ml, 1L, pack x6, etc."
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

      <Modal open={showCatModal} onClose={() => setShowCatModal(false)} title="Gestionar Categorías">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={catForm.nombre}
              onChange={e => setCatForm({ nombre: e.target.value })}
              placeholder="Nueva categoría..."
              className="h-11"
            />
            <Button onClick={handleSaveCategoria} disabled={saving || !catForm.nombre.trim()} className="h-11">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {categorias.length === 0 ? (
              <p className="text-slate-400 text-center py-4">No hay categorías</p>
            ) : (
              categorias.map((cat, index) => (
                <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getCatColor(index)}`} />
                    <span className="font-medium">{cat.nombre}</span>
                  </div>
                  <button onClick={() => handleDeleteCategoria(cat.id)} className="p-1 hover:bg-red-100 rounded">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}