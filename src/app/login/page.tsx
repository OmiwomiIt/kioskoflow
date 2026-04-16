'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Store, Loader2, ShoppingBag } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al iniciar sesión');
        return;
      }

      window.location.href = '/';
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf9] px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pattern-dots opacity-40" />
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-stone-300/30 rounded-full blur-3xl" />
      
      <div className="w-full max-w-md relative">
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/20">
            <ShoppingBag className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-stone-800 mb-1.5 tracking-tight">KioskoFlow</h1>
          <p className="text-stone-500 text-sm">Sistema de gestión para kioscos</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-stone-200/50 p-8 border border-stone-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2.5">
                Correo electrónico
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@kioskoflow.com"
                className="h-12"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2.5">
                Contraseña
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12"
                required
                autoComplete="current-password"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Iniciando...
                </span>
              ) : (
                'Iniciar sesión'
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          Credentials: admin@kioskoflow.com / admin123
        </p>
      </div>
    </div>
  );
}