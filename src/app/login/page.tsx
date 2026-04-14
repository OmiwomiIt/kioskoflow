'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Store, Loader2 } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-sky-400 to-sky-600 rounded-3xl flex items-center justify-center shadow-lg shadow-sky-500/30">
            <Store className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">KioskoFlow</h1>
          <p className="text-slate-400 text-lg">Sistema de Gestión</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm backdrop-blur-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Correo electrónico
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@kioskoflow.com"
                className="h-14 text-base bg-white/10 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 backdrop-blur-sm"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Contraseña
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-14 text-base bg-white/10 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 backdrop-blur-sm"
                required
                autoComplete="current-password"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-base bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 rounded-xl font-semibold shadow-lg shadow-sky-500/25 transition-all duration-200"
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

        <p className="text-center text-sm text-slate-500 mt-8">
          Ingresa tus credenciales para continuar
        </p>
      </div>
    </div>
  );
}