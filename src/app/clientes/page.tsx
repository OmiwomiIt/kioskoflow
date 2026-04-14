'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { Plus, Search, Edit, Trash2, Users, Phone, Mail, MapPin } from 'lucide-react';

interface Cliente {
  id: number;
  nombre: string;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
}

export default function ClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', direccion: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/clientes').then(res => res.json()).then(data => {
      setClientes(data);
      setLoading(false);
    });
  }, []);

  const filtered = clientes.filter(c => 
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSave() {
    if (!form.nombre.trim()) return;
    setSaving(true);
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `/api/clientes/${editId}` : '/api/clientes';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const res = await fetch('/api/clientes');
    setClientes(await res.json());
    setShowModal(false);
    setForm({ nombre: '', email: '', telefono: '', direccion: '' });
    setEditId(null);
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar cliente?')) return;
    await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
    const res = await fetch('/api/clientes');
    setClientes(await res.json());
  }

  function openEdit(cliente: Cliente) {
    setEditId(cliente.id);
    setForm({
      nombre: cliente.nombre,
      email: cliente.email || '',
      telefono: cliente.telefono || '',
      direccion: cliente.direccion || '',
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clientes</h1>
          <p className="text-slate-500">{clientes.length} clientes registrados</p>
        </div>
        <Button onClick={() => { setEditId(null); setForm({ nombre: '', email: '', telefono: '', direccion: '' }); setShowModal(true); }} className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700">
          <Plus className="h-4 w-4 mr-2" /> Nuevo Cliente
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input
          placeholder="Buscar clientes por nombre o email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-12 h-12 text-base bg-white border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="border-0 shadow-lg shadow-slate-200/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 text-lg">No hay clientes registrados</p>
            <Button onClick={() => setShowModal(true)} className="mt-4 bg-sky-500 hover:bg-sky-600">
              <Plus className="h-4 w-4 mr-2" /> Agregar primer cliente
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(cliente => (
            <Card key={cliente.id} className="border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <span className="text-lg font-semibold text-white">
                        {cliente.nombre.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{cliente.nombre}</h3>
                      <p className="text-sm text-slate-500">Cliente</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(cliente)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <Edit className="h-4 w-4 text-slate-400" />
                    </button>
                    <button onClick={() => handleDelete(cliente.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  {cliente.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Mail className="h-4 w-4" />
                      <span>{cliente.email}</span>
                    </div>
                  )}
                  {cliente.telefono && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Phone className="h-4 w-4" />
                      <span>{cliente.telefono}</span>
                    </div>
                  )}
                  {cliente.direccion && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <MapPin className="h-4 w-4" />
                      <span>{cliente.direccion}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? 'Editar Cliente' : 'Nuevo Cliente'}>
        <div className="space-y-4">
          <div>
            <Label className="text-slate-700">Nombre *</Label>
            <Input
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              placeholder="Nombre del cliente"
              className="h-12 mt-1"
            />
          </div>
          <div>
            <Label className="text-slate-700">Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="email@ejemplo.com"
              className="h-12 mt-1"
            />
          </div>
          <div>
            <Label className="text-slate-700">Teléfono</Label>
            <Input
              value={form.telefono}
              onChange={e => setForm({ ...form, telefono: e.target.value })}
              placeholder="Teléfono"
              className="h-12 mt-1"
            />
          </div>
          <div>
            <Label className="text-slate-700">Dirección</Label>
            <Input
              value={form.direccion}
              onChange={e => setForm({ ...form, direccion: e.target.value })}
              placeholder="Dirección"
              className="h-12 mt-1"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowModal(false)} className="h-11">Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !form.nombre.trim()} className="h-11 bg-sky-500 hover:bg-sky-600">
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}