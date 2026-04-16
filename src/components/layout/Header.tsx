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

export default function Header({
  onToggleSidebar,
  sidebarCollapsed,
  usuario,
}: HeaderProps) {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  return (
    <header
      className={`h-16 flex items-center justify-between px-4 fixed top-0 right-0 z-30 transition-all duration-300 ${
        sidebarCollapsed ? 'left-16' : 'left-64'
      }`}
      style={{
        background: '#081320',
        borderBottom: '1px solid rgba(201,168,76,0.12)',
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg transition-colors"
          style={{ color: '#4A6A8A' }}
          onMouseOver={(e) =>
            (e.currentTarget.style.color = '#C9A84C')
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.color = '#4A6A8A')
          }
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="hidden md:flex items-center">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: '#2A4A6A' }}
            />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-56 pl-9 pr-4 py-2 rounded-lg text-sm outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                color: '#EDE8DC',
              }}
            />
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Notification bell */}
        <button
          className="relative p-2 rounded-lg transition-colors"
          style={{ color: '#4A6A8A' }}
          onMouseOver={(e) =>
            (e.currentTarget.style.color = '#C9A84C')
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.color = '#4A6A8A')
          }
        >
          <Bell className="w-5 h-5" />
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
            style={{ background: '#C9A84C' }}
          />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ml-1"
            style={{
              background: showUserMenu
                ? 'rgba(201,168,76,0.08)'
                : 'transparent',
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background =
                'rgba(201,168,76,0.06)')
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = showUserMenu
                ? 'rgba(201,168,76,0.08)'
                : 'transparent')
            }
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #C9A84C, #8A6E2A)',
                color: '#081320',
              }}
            >
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="hidden md:block text-left">
              <p
                className="text-xs font-medium leading-tight"
                style={{ color: '#B0C8E0' }}
              >
                {usuario?.nombreCompleto || 'Usuario'}
              </p>
              <p
                className="text-xs leading-tight capitalize"
                style={{ color: '#3A5A7A' }}
              >
                {usuario?.rol || 'Sin rol'}
              </p>
            </div>
            <ChevronDown
              className="w-3.5 h-3.5 hidden md:block"
              style={{ color: '#3A5A7A' }}
            />
          </button>

          {/* Dropdown */}
          {showUserMenu && (
            <div
              className="absolute right-0 mt-1 w-44 rounded-xl py-1 z-50"
              style={{
                background: '#0D1E35',
                border: '1px solid rgba(201,168,76,0.15)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              }}
            >
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  router.push('/dashboard/perfil');
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                style={{ color: '#7A96B8' }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background =
                    'rgba(255,255,255,0.04)';
                  e.currentTarget.style.color = '#EDE8DC';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#7A96B8';
                }}
              >
                <User className="w-4 h-4" />
                Mi Perfil
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  router.push('/dashboard/configuracion');
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                style={{ color: '#7A96B8' }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background =
                    'rgba(255,255,255,0.04)';
                  e.currentTarget.style.color = '#EDE8DC';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#7A96B8';
                }}
              >
                <Settings className="w-4 h-4" />
                Configuración
              </button>
              <div
                className="my-1"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                style={{ color: '#F87171' }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background =
                    'rgba(248,113,113,0.08)')
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = 'transparent')
                }
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
