'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Calendar,
  Activity,
  Settings,
  ChevronDown,
  ChevronRight,
  UserPlus,
  UserCheck,
  ClipboardList,
  Receipt,
  DollarSign,
  CalendarDays,
  CalendarCheck,
  Dumbbell,
  ListChecks,
  UserCog,
  Shield,
  Database,
} from 'lucide-react';
import { authService } from '@/lib/api/auth';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href?: string;
  roles?: string[]; // Roles permitidos para ver este item (undefined = todos)
  children?: {
    label: string;
    href: string;
    icon: React.ReactNode;
    roles?: string[]; // Roles permitidos para ver este subitem
  }[];
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    href: '/dashboard',
  },
  {
    label: 'Socios',
    icon: <Users className="w-5 h-5" />,
    // Recepcionistas, admins y superadmins pueden ver socios
    children: [
      {
        label: 'Listado de Socios',
        href: '/dashboard/socios',
        icon: <ClipboardList className="w-4 h-4" />,
      },
      {
        label: 'Nuevo Socio',
        href: '/dashboard/socios/nuevo',
        icon: <UserPlus className="w-4 h-4" />,
        roles: ['admin', 'superadmin'], // Solo admin y superadmin pueden crear socios
      },
    ],
  },
  {
    label: 'Membresias',
    icon: <CreditCard className="w-5 h-5" />,
    roles: ['admin', 'superadmin'], // Solo admin y superadmin
    children: [
      {
        label: 'Todas las Membresias',
        href: '/dashboard/membresias',
        icon: <ClipboardList className="w-4 h-4" />,
      },
      {
        label: 'Nueva Membresia',
        href: '/dashboard/membresias/nueva',
        icon: <CreditCard className="w-4 h-4" />,
      },
    ],
  },
  {
    label: 'Pagos',
    icon: <DollarSign className="w-5 h-5" />,
    // Todos pueden ver pagos
    children: [
      {
        label: 'Historial de Pagos',
        href: '/dashboard/pagos',
        icon: <Receipt className="w-4 h-4" />,
        roles: ['admin', 'superadmin'], // Solo admin y superadmin ven historial
      },
      {
        label: 'Registrar Pago',
        href: '/dashboard/pagos/nuevo',
        icon: <DollarSign className="w-4 h-4" />,
        // Todos pueden registrar pagos
      },
      {
        label: 'Estadísticas',
        href: '/dashboard/pagos/estadisticas',
        icon: <Activity className="w-4 h-4" />,
        roles: ['admin', 'superadmin'], // Solo admin y superadmin ven estadísticas
      },
    ],
  },
  {
    label: 'Asistencias',
    icon: <Calendar className="w-5 h-5" />,
    roles: ['superadmin', 'admin', 'recepcionista'], // Admin, superadmin y recepcionista
    children: [
      {
        label: 'Registro de Asistencias',
        href: '/dashboard/asistencias',
        icon: <CalendarDays className="w-4 h-4" />,
        roles: ['superadmin', 'admin'], // Solo admin y superadmin ven historial completo
      },
      {
        label: 'Marcar Asistencia',
        href: '/dashboard/asistencias/marcar',
        icon: <CalendarCheck className="w-4 h-4" />,
        // Admin, superadmin y recepcionista pueden marcar asistencia
      },
    ],
  },
  {
    label: 'Actividades',
    icon: <Activity className="w-5 h-5" />,
    roles: ['superadmin'], // Solo superadmin puede gestionar actividades
    children: [
      {
        label: 'Todas las Actividades',
        href: '/dashboard/actividades',
        icon: <ListChecks className="w-4 h-4" />,
      },
      {
        label: 'Nueva Actividad',
        href: '/dashboard/actividades/nueva',
        icon: <Dumbbell className="w-4 h-4" />,
      },
    ],
  },
  {
    label: 'Configuracion',
    icon: <Settings className="w-5 h-5" />,
    roles: ['admin', 'superadmin'], // Solo admin y superadmin
    children: [
      {
        label: 'Usuarios',
        href: '/dashboard/usuarios',
        icon: <UserCog className="w-4 h-4" />,
        roles: ['superadmin'], // Solo superadmin puede gestionar usuarios
      },
      {
        label: 'Staff',
        href: '/dashboard/configuracion/roles',
        icon: <Shield className="w-4 h-4" />,
        roles: ['superadmin'], // Solo superadmin puede gestionar roles
      },
      {
        label: 'Sistema',
        href: '/dashboard/configuracion/sistema',
        icon: <Database className="w-4 h-4" />,
        roles: ['superadmin'], // Solo superadmin puede ver configuración de sistema
      },
    ],
  },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Socios']);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const usuario = authService.getUsuario();
    // Normalizar a minúsculas para evitar problemas de comparación
    setUserRole(usuario?.rol?.toLowerCase() || null);
  }, []);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (href: string) => pathname === href;
  const isParentActive = (children: { href: string }[]) =>
    children.some((child) => pathname.startsWith(child.href));

  // Filtrar items del menú según el rol del usuario
  const canViewItem = (roles?: string[]) => {
    if (!roles || roles.length === 0) return true; // Sin restricciones
    if (!userRole) return false; // No hay usuario logueado
    return roles.includes(userRole);
  };

  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter(item => canViewItem(item.roles))
      .map(item => {
        if (item.children) {
          const filteredChildren = item.children.filter(child => canViewItem(child.roles));
          // Si no quedan hijos visibles, no mostrar el padre
          if (filteredChildren.length === 0) return null;
          return { ...item, children: filteredChildren };
        }
        return item;
      })
      .filter(Boolean) as MenuItem[];
  };

  const visibleMenuItems = filterMenuItems(menuItems);

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 z-40 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-700">
        {isCollapsed ? (
          <span className="text-2xl font-bold text-blue-400">C</span>
        ) : (
          <span className="text-xl font-bold text-blue-400">Club Manager</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-4 px-2">
        <ul className="space-y-1">
          {visibleMenuItems.map((item) => (
            <li key={item.label}>
              {item.href ? (
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {item.icon}
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => toggleExpand(item.label)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                      item.children && isParentActive(item.children)
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      {!isCollapsed && <span>{item.label}</span>}
                    </div>
                    {!isCollapsed && item.children && (
                      <span className="text-gray-400">
                        {expandedItems.includes(item.label) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </span>
                    )}
                  </button>

                  {/* Submenu */}
                  {!isCollapsed &&
                    item.children &&
                    expandedItems.includes(item.label) && (
                      <ul className="mt-1 ml-4 space-y-1">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                isActive(child.href)
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                              }`}
                            >
                              {child.icon}
                              <span>{child.label}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                </>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
