'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  UserCog, 
  LogOut, 
  Menu, 
  X,
  ClipboardList,
  DollarSign
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/components/auth/provider';
import { useTheme } from '@/components/theme-provider';
import { Moon, Sun } from 'lucide-react';

const navigation = [
  { name: 'Inicio', href: '/', icon: LayoutDashboard },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Productos', href: '/productos', icon: Package },
  { name: 'Inventario', href: '/inventario', icon: ClipboardList },
  { name: 'Ventas', href: '/ventas', icon: ShoppingCart },
  { name: 'Caja', href: '/caja', icon: DollarSign },
];

function isActive(href: string, pathname: string) {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}

function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-stone-950 border-r border-stone-200 dark:border-stone-800">
      <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-stone-800">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/20">
            <Package className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-stone-900 dark:text-stone-100 tracking-tight">KioskoFlow</span>
        </Link>
        {onClose && (
          <button 
            onClick={onClose} 
            className="lg:hidden p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-stone-500 dark:text-stone-400" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1.5">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, pathname);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25 font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.name}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/90" />
              )}
            </Link>
          );
        })}
        {user?.rol === 'ADMIN' && (
          <Link
            href="/usuarios"
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-200',
              pathname === '/usuarios'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25 font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100'
            )}
          >
            <UserCog className="w-5 h-5" />
            Usuarios
          </Link>
        )}
      </nav>

      <div className="p-4 border-t border-stone-100 dark:border-stone-800">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          {theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
        </button>
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-sm">
            <span className="text-sm font-bold text-white">
              {user?.nombre?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">{user?.nombre}</p>
            <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
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
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <header className="hidden lg:flex fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border-b border-stone-200/50 dark:border-stone-800/50 z-50 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="p-2.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
          >
            <Menu className="w-5 h-5 text-stone-600 dark:text-stone-400" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/20">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-stone-800 dark:text-stone-100 tracking-tight">KioskoFlow</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors text-stone-600 dark:text-stone-400"
            title="Cambiar tema"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <Link
            href="/ventas/nueva"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-sm font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25 btn-active"
          >
            <ShoppingCart className="w-4 h-4" />
            Nueva Venta
          </Link>
        </div>
      </header>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => setSidebarOpen(false)} 
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 animate-in slide-in-from-left duration-300">
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
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-stone-200/50 px-2 py-2 z-50 safe-area-bottom lg:hidden shadow-2xl shadow-black/5">
      <div className="flex justify-around items-center">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, pathname);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-2 rounded-2xl min-w-[64px] transition-all duration-200',
                active
                  ? 'text-orange-600'
                  : 'text-stone-400'
              )}
            >
              <div className={cn(
                'p-2 rounded-xl transition-all duration-200',
                active 
                  ? 'bg-orange-100' 
                  : 'hover:bg-stone-100'
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] mt-1.5 font-medium">{item.name}</span>
            </Link>
          );
        })}
        {user?.rol === 'ADMIN' && (
          <Link
            href="/usuarios"
            className={cn(
              'flex flex-col items-center justify-center py-2 px-2 rounded-2xl min-w-[64px] transition-all duration-200',
              pathname === '/usuarios'
                ? 'text-orange-600'
                : 'text-stone-400'
            )}
          >
            <div className={cn(
              'p-2 rounded-xl transition-all duration-200',
              pathname === '/usuarios' 
                ? 'bg-orange-100' 
                : 'hover:bg-stone-100'
            )}>
              <UserCog className="h-5 w-5" />
            </div>
            <span className="text-[10px] mt-1.5 font-medium">Usuarios</span>
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
  const { theme, toggleTheme } = useTheme();

  const pageTitle = navigation.find(n => isActive(n.href, pathname))?.name || 'KioskoFlow';

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border-b border-stone-200/50 dark:border-stone-800/50 z-40 flex items-center justify-between px-4 shadow-sm">
      <h1 className="text-lg font-semibold text-stone-800 dark:text-stone-100 tracking-tight">{pageTitle}</h1>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors text-stone-600 dark:text-stone-400"
          title="Cambiar tema"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
        <Link
          href="/ventas/nueva"
          className="p-2.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg shadow-orange-500/20 btn-active"
        >
          <ShoppingCart className="w-5 h-5 text-white" />
        </Link>
        <button 
          onClick={() => setShowMenu(!showMenu)} 
          className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
            <span className="text-sm font-semibold text-white">
              {user?.nombre?.charAt(0).toUpperCase()}
            </span>
          </div>
        </button>
      </div>
      {showMenu && (
        <div className="absolute top-14 right-4 bg-white dark:bg-stone-800 rounded-2xl shadow-xl border border-stone-100 dark:border-stone-700 p-2 min-w-[200px] z-50 overflow-hidden animate-in scale-in duration-200">
          <div className="px-4 py-3.5 border-b border-stone-100 dark:border-stone-700">
            <p className="font-semibold text-stone-800 dark:text-stone-100">{user?.nombre}</p>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{user?.email}</p>
            <span className="inline-block mt-2.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
              {user?.rol}
            </span>
          </div>
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              window.location.href = '/login';
            }}
            className="flex items-center gap-2.5 w-full px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400 font-medium transition-colors"
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
    <div className="min-h-screen bg-[var(--background)] pb-20 lg:pb-0">
      <TopNav />
      <MobileHeader />
      <main className="lg:pt-16 pt-14 p-4 lg:pl-4">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}