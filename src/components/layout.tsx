'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, Package, FileText, UserCog, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/components/auth/provider';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Productos', href: '/productos', icon: Package },
  { name: 'Ventas', href: '/ventas', icon: FileText },
  { name: 'Caja', href: '/caja', icon: UserCog },
];

function isActive(href: string, pathname: string) {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}

function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <Link href="/" className="text-xl font-bold text-white flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center">
            <Package className="w-4 h-4 text-white" />
          </div>
          KioskoFlow
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, pathname);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.name}
              {active && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          );
        })}
        {user?.rol === 'ADMIN' && (
          <Link
            href="/usuarios"
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
              pathname === '/usuarios'
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            )}
          >
            <UserCog className="w-5 h-5" />
            Usuarios
            {pathname === '/usuarios' && <ChevronRight className="w-4 h-4 ml-auto" />}
          </Link>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center">
            <span className="text-sm font-semibold text-white">
              {user?.nombre?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.nombre}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-sky-500/20 text-sky-400">
            {user?.rol}
          </span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

function TopNav() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <header className="hidden lg:flex fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <Link href="/" className="text-lg font-bold text-sky-600">KioskoFlow</Link>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/ventas/nueva"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-lg text-sm font-medium hover:from-sky-600 hover:to-sky-700 transition-all shadow-sm"
          >
            <Package className="w-4 h-4" />
            Nueva Venta
          </Link>
        </div>
      </header>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 animate-in slide-in-from-left">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 z-50 safe-area-bottom lg:hidden shadow-lg shadow-slate-200/50">
      <div className="flex justify-around items-center">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, pathname);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-3 rounded-xl min-w-[64px] transition-all',
                active
                  ? 'text-sky-600 bg-sky-50'
                  : 'text-slate-400'
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs mt-1 font-medium">{item.name}</span>
            </Link>
          );
        })}
        {user?.rol === 'ADMIN' && (
          <Link
            href="/usuarios"
            className={cn(
              'flex flex-col items-center justify-center py-2 px-3 rounded-xl min-w-[64px] transition-all',
              pathname === '/usuarios'
                ? 'text-sky-600 bg-sky-50'
                : 'text-slate-400'
            )}
          >
            <UserCog className="h-6 w-6" />
            <span className="text-xs mt-1 font-medium">Usuarios</span>
          </Link>
        )}
      </div>
    </nav>
  );
}

function MobileHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const pageTitle = navigation.find(n => isActive(n.href, pathname))?.name || 'KioskoFlow';

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4 shadow-sm">
      <h1 className="text-lg font-semibold text-slate-800">{pageTitle}</h1>
      <div className="flex items-center gap-2">
        <Link
          href="/ventas/nueva"
          className="p-2 bg-sky-500 rounded-lg"
        >
          <Package className="w-5 h-5 text-white" />
        </Link>
        <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-slate-100 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {user?.nombre?.charAt(0).toUpperCase()}
            </span>
          </div>
        </button>
      </div>
      {showMenu && (
        <div className="absolute top-14 right-4 bg-white rounded-xl shadow-xl border border-slate-200 p-2 min-w-[200px] z-50">
          <div className="px-3 py-3 border-b border-slate-100">
            <p className="font-semibold text-slate-800">{user?.nombre}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-600">
              {user?.rol}
            </span>
          </div>
          <button
            onClick={() => window.location.href = '/api/auth/logout'}
            className="flex items-center gap-2 w-full px-3 py-3 text-left hover:bg-red-50 rounded-lg text-red-600 font-medium"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </div>
      )}
    </header>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/login' || pathname.startsWith('/login')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 lg:pb-0">
      <TopNav />
      <MobileHeader />
      <main className="lg:pt-16 pt-14 p-4 lg:pl-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}