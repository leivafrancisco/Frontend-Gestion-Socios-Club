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

const normalizeRole = (rol: string | undefined): string | null => {
  if (!rol) return null;
  const rolLower = rol.toLowerCase();
  if (rolLower === 'administrador' || rolLower === 'admin') return 'admin';
  if (rolLower === 'superadmin' || rolLower === 'superadministrador') return 'superadmin';
  if (rolLower === 'recepcionista') return 'recepcionista';
  return rolLower;
};

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href?: string;
  roles?: string[];
  children?: {
    label: string;
    href: string;
    icon: React.ReactNode;
    roles?: string[];
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
        roles: ['admin', 'superadmin'],
      },
    ],
  },
  {
    label: 'Membresias',
    icon: <CreditCard className="w-5 h-5" />,
    roles: ['admin', 'superadmin'],
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
    children: [
      {
        label: 'Historial de Pagos',
        href: '/dashboard/pagos',
        icon: <Receipt className="w-4 h-4" />,
        roles: ['admin', 'superadmin'],
      },
      {
        label: 'Registrar Pago',
        href: '/dashboard/pagos/nuevo',
        icon: <DollarSign className="w-4 h-4" />,
      },
      {
        label: 'Estadísticas',
        href: '/dashboard/pagos/estadisticas',
        icon: <Activity className="w-4 h-4" />,
        roles: ['admin', 'superadmin'],
      },
    ],
  },
  {
    label: 'Asistencias',
    icon: <Calendar className="w-5 h-5" />,
    roles: ['superadmin', 'admin', 'recepcionista'],
    children: [
      {
        label: 'Registro de Asistencias',
        href: '/dashboard/asistencias',
        icon: <CalendarDays className="w-4 h-4" />,
        roles: ['superadmin', 'admin', 'recepcionista'],
      },
      {
        label: 'Marcar Asistencia',
        href: '/dashboard/asistencias/marcar',
        icon: <CalendarCheck className="w-4 h-4" />,
      },
    ],
  },
  {
    label: 'Actividades',
    icon: <Activity className="w-5 h-5" />,
    roles: ['superadmin'],
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
    roles: ['superadmin'],
  },
  {
    label: 'Configuración',
    icon: <Settings className="w-5 h-5" />,
    roles: ['superadmin'],
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

  const canViewItem = (roles?: string[]) => {
    if (!roles || roles.length === 0) return true;
    if (!userRole) return false;
    return roles.includes(userRole);
  };

  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter((item) => canViewItem(item.roles))
      .map((item) => {
        if (item.children) {
          const filteredChildren = item.children.filter((child) =>
            canViewItem(child.roles)
          );
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
      className={`fixed left-0 top-0 h-full flex flex-col transition-all duration-300 z-40 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      style={{
        background: '#050E1A',
        borderRight: '1px solid rgba(201,168,76,0.1)',
      }}
    >
      {/* ── Logo ─────────────────────────────────────────── */}
      <div
        className={`h-16 flex items-center flex-shrink-0 ${
          isCollapsed ? 'justify-center px-3' : 'gap-3 px-4'
        }`}
        style={{ borderBottom: '1px solid rgba(201,168,76,0.1)' }}
      >
        <div
          className="relative flex-shrink-0 rounded-full overflow-hidden"
          style={{
            width: 36,
            height: 36,
            border: '1.5px solid rgba(201,168,76,0.5)',
            boxShadow: '0 0 14px rgba(201,168,76,0.12)',
          }}
        >
          <Image
            src="/assets/images/regatas.jpg"
            alt="RC"
            fill
            className="object-cover"
          />
        </div>
        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <div
              className="text-sm font-semibold leading-tight truncate font-display"
              style={{ color: '#C9A84C', letterSpacing: '0.06em' }}
            >
              REGATAS
            </div>
            <div
              className="text-xs leading-tight truncate"
              style={{ color: '#2A4A6A', letterSpacing: '0.04em' }}
            >
              CORRIENTES
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation ───────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-none">
        <ul className="space-y-0.5 px-2">
          {visibleMenuItems.map((item) => (
            <li key={item.label}>
              {item.href ? (
                <Link
                  href={item.href}
                  className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  {item.icon}
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => toggleExpand(item.label)}
                    className={`nav-parent-btn ${
                      item.children && isParentActive(item.children)
                        ? 'parent-active'
                        : ''
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className="flex items-center gap-[10px]">
                      {item.icon}
                      {!isCollapsed && <span>{item.label}</span>}
                    </div>
                    {!isCollapsed && item.children && (
                      <span style={{ color: '#2A4A6A' }}>
                        {expandedItems.includes(item.label) ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </span>
                    )}
                  </button>

                  {!isCollapsed &&
                    item.children &&
                    expandedItems.includes(item.label) && (
                      <ul
                        className="mt-0.5 ml-3 space-y-0.5 pl-3"
                        style={{ borderLeft: '1px solid rgba(201,168,76,0.1)' }}
                      >
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className={`nav-subitem ${
                                isActive(child.href) ? 'active' : ''
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

      {/* ── Footer ───────────────────────────────────────── */}
      {!isCollapsed && (
        <div
          className="flex-shrink-0 px-4 py-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <p className="text-xs truncate" style={{ color: '#1E3A54' }}>
            Sistema de Gestión v1.0
          </p>
        </div>
      )}
    </aside>
  );
}
