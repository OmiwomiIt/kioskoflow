'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, Package, FileText, Menu, X, UserCog, LogOut, Plus } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/components/auth/provider';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Productos', href: '/productos', icon: Package },
  { name: 'Presupuestos', href: '/presupuestos', icon: FileText },
];

function BottomNav() {
  const pathname = usePathname();
  
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-1 z-50 safe-area-bottom">
      <div className="flex justify-around items-center">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-3 rounded-lg min-w-[64px]',
                active
                  ? 'text-sky-600'
                  : 'text-slate-400 hover:text-slate-600'
              )}
            >
              <Icon className={cn('h-6 w-6', active && 'fill-sky-50')} />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const pageTitle = navigation.find(n => isActive(n.href))?.name || 'Sodería';

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 z-40">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2">
            <Menu className="h-6 w-6 text-slate-600" />
          </button>
          <h1 className="text-lg font-semibold text-slate-800">{pageTitle}</h1>
        </div>
        <div className="flex items-center gap-2">
          {user?.rol === 'ADMIN' && (
            <Link href="/usuarios" className="p-2 hover:bg-slate-100 rounded-lg">
              <UserCog className="h-5 w-5 text-slate-600" />
            </Link>
          )}
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-slate-100 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
              <span className="text-sm font-medium text-sky-700">
                {user?.nombre?.charAt(0).toUpperCase()}
              </span>
            </div>
          </button>
        </div>
      </div>

      {showMenu && (
        <div className="absolute top-14 right-4 bg-white rounded-xl shadow-lg border border-slate-200 p-2 z-50 min-w-[180px]">
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="font-medium text-slate-800">{user?.nombre}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <p className="text-xs text-sky-600 mt-1">{user?.rol}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-slate-100 rounded-lg text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      )}
    </header>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      <div className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 lg:hidden overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-sky-600">Sodería</h1>
            <button onClick={onClose} className="p-2">
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">Sistema de Presupuestos</p>
        </div>
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, pathname);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg',
                  active
                    ? 'bg-sky-50 text-sky-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        {user?.rol === 'ADMIN' && (
          <div className="p-4 border-t border-slate-200">
            <Link
              href="/usuarios"
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg',
                pathname === '/usuarios'
                  ? 'bg-sky-50 text-sky-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              <UserCog className="h-5 w-5" />
              Usuarios
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

function isActive(href: string, pathname: string) {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === '/login' || pathname.startsWith('/login')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 lg:pb-8">
      <Header />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="pt-14 p-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}