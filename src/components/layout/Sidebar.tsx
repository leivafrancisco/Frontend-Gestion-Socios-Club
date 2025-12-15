'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Calendar,
  Activity,
  ChevronDown,
  ChevronRight,
  UserPlus,
  ClipboardList,
  Receipt,
  DollarSign,
  CalendarDays,
  CalendarCheck,
  Dumbbell,
  ListChecks,
  UserCog,
  Settings,
  Database,
} from 'lucide-react';
import { authService } from '@/lib/api/auth';

// Función para normalizar el nombre del rol del backend a los valores usados internamente
const normalizeRole = (rol: string | undefined): string | null => {
  if (!rol) return null;
  const rolLower = rol.toLowerCase();
  
  // Mapeo de roles del backend a roles internos
  if (rolLower === 'administrador' || rolLower === 'admin') return 'admin';
  if (rolLower === 'superadmin' || rolLower === 'superadministrador') return 'superadmin';
  if (rolLower === 'recepcionista') return 'recepcionista';
  
  return rolLower; // Para cualquier otro rol, devolver en minúsculas
};

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
        roles: ['superadmin', 'admin', 'recepcionista'], // Admin, superadmin y recepcionista pueden ver el listado
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
    label: 'Usuarios',
    icon: <UserCog className="w-5 h-5" />,
    href: '/dashboard/usuarios',
    roles: ['superadmin'], // Solo superadmin puede gestionar usuarios
  },
  {
    label: 'Configuración',
    icon: <Settings className="w-5 h-5" />,
    roles: ['superadmin'], // Solo superadmin puede acceder a configuración
    children: [
      {
        label: 'Backup',
        href: '/dashboard/configuracion/backup',
        icon: <Database className="w-4 h-4" />,
      },
      {
        label: 'Auditoría',
        href: '/dashboard/configuracion/auditoria',
        icon: <ClipboardList className="w-4 h-4" />,
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
    // Normalizar el rol usando la función de mapeo
    setUserRole(normalizeRole(usuario?.rol));
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
      <div className="h-16 flex items-center justify-center gap-3 border-b border-gray-700 px-2">
        {isCollapsed ? (
          <div className="w-10 h-10 relative">
            <Image
              src="/assets/images/regatas.jpg"
              alt="RC"
              fill
              className="rounded-full object-cover"
            />
          </div>
        ) : (
          <>
            <div className="w-10 h-10 relative flex-shrink-0">
              <Image
                src="/assets/images/regatas.jpg"
                alt="Regatas Corrientes"
                fill
                className="rounded-full object-cover"
              />
            </div>
            <span className="text-lg font-bold text-blue-400">Regatas Corrientes</span>
          </>
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
