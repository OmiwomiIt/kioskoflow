'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, Package, FileText, UserCog, LogOut, Plus } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/components/auth/provider';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Productos', href: '/productos', icon: Package },
  { name: 'Presupuestos', href: '/presupuestos', icon: FileText },
];

function isActive(href: string, pathname: string) {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}

function TopNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="hidden lg:flex fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-50 items-center justify-between px-4">
      <div className="flex items-center gap-1">
        <Link href="/" className="text-lg font-bold text-sky-600 mr-8">KioskoFlow</Link>
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, pathname);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-sky-50 text-sky-700'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
        {user?.rol === 'ADMIN' && (
          <Link
            href="/usuarios"
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname === '/usuarios'
                ? 'bg-sky-50 text-sky-700'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            <UserCog className="h-4 w-4" />
            Usuarios
          </Link>
        )}
      </div>
      <div className="relative">
        <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
            <span className="text-sm font-medium text-sky-700">
              {user?.nombre?.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-sm text-slate-700">{user?.nombre}</span>
        </button>
        {showMenu && (
          <div className="absolute top-full right-0 mt-1 bg-white rounded-xl shadow-lg border border-slate-200 p-2 min-w-[180px]">
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
      </div>
    </header>
  );
}

function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-1 z-50 safe-area-bottom lg:hidden">
      <div className="flex justify-around items-center">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, pathname);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-3 rounded-lg min-w-[64px]',
                active
                  ? 'text-sky-600'
                  : 'text-slate-400'
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function MobileHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const pageTitle = navigation.find(n => isActive(n.href, pathname))?.name || 'KioskoFlow';

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4">
      <h1 className="text-lg font-semibold text-slate-800">{pageTitle}</h1>
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
      {showMenu && (
        <div className="absolute top-14 right-4 bg-white rounded-xl shadow-lg border border-slate-200 p-2 min-w-[180px] z-50">
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

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/login' || pathname.startsWith('/login')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 lg:pb-0">
      <TopNav />
      <MobileHeader />
      <main className="lg:pt-14 pt-14 p-4 lg:pl-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}