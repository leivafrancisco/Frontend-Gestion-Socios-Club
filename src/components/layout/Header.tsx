'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/api/auth';
import {
  Menu,
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
  usuario: {
    nombreCompleto: string;
    rol: string;
    email?: string;
  } | null;
}

export default function Header({ onToggleSidebar, sidebarCollapsed, usuario }: HeaderProps) {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  return (
    <header className={`h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 fixed top-0 right-0 z-30 transition-all duration-300 ${sidebarCollapsed ? 'left-16' : 'left-64'}`}>
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        {/* Search Bar */}
        <div className="hidden md:flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-64 pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-700">
                {usuario?.nombreCompleto || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {usuario?.rol || 'Sin rol'}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  router.push('/dashboard/perfil');
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <User className="w-4 h-4" />
                Mi Perfil
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  router.push('/dashboard/configuracion');
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Settings className="w-4 h-4" />
                Configuracion
              </button>
              <hr className="my-1 border-gray-200" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
