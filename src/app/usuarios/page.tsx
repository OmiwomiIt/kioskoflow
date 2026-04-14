'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import { useAuth } from '@/components/auth/provider';
import { Plus, Pencil, Trash2, ArrowLeft, Loader2 } from 'lucide-react';

interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: 'ADMIN' | 'USUARIO';
  activo: boolean;
  createdAt: string;
}

export default function UsuariosPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [form, setForm] = useState<{ nombre: string; email: string; password: string; rol: 'ADMIN' | 'USUARIO' }>({ nombre: '', email: '', password: '', rol: 'USUARIO' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user?.rol !== 'ADMIN') {
      router.push('/');
    } else {
      fetchUsuarios();
    }
  }, [user, authLoading, router]);

  const fetchUsuarios = async () => {
    const res = await fetch('/api/usuarios');
    if (res.ok) {
      const data = await res.json();
      setUsuarios(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const url = editando ? `/api/usuarios/${editando.id}` : '/api/usuarios';
    const res = await fetch(url, {
      method: editando ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setShowModal(false);
      setEditando(null);
      setForm({ nombre: '', email: '', password: '', rol: 'USUARIO' });
      fetchUsuarios();
    } else {
      const data = await res.json();
      setError(data.error || 'Error al guardar');
    }
    setSaving(false);
  };

  const handleEdit = (u: Usuario) => {
    setEditando(u);
    setForm({ nombre: u.nombre, email: u.email, password: '', rol: u.rol });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    const res = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
    if (res.ok) fetchUsuarios();
  };

  const openNew = () => {
    setEditando(null);
    setForm({ nombre: '', email: '', password: '', rol: 'USUARIO' });
    setError('');
    setShowModal(true);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-slate-100 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Usuarios</h1>
            <p className="text-slate-500">Gestión de usuarios del sistema</p>
          </div>
        </div>
        <Button onClick={openNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Nuevo Usuario
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                    No hay usuarios
                  </TableCell>
                </TableRow>
              ) : (
                usuarios.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.nombre}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        u.rol === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.rol === 'ADMIN' ? 'Administrador' : 'Usuario'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        u.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(u)} className="p-2 hover:bg-slate-100 rounded">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(u.id)} className="p-2 hover:bg-red-50 rounded text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal open={showModal} onOpenChange={setShowModal} title={editando ? 'Editar Usuario' : 'Nuevo Usuario'}>
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <Input
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                disabled={!!editando}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Contraseña {editando && '(dejar vacío para mantener)'}
              </label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required={!editando}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rol</label>
              <select
                value={form.rol}
                onChange={(e) => setForm({ ...form, rol: e.target.value as 'ADMIN' | 'USUARIO' })}
                className="w-full h-10 rounded-lg border border-slate-300 px-3"
              >
                <option value="USUARIO">Usuario</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
      </Modal>
    </div>
  );
}