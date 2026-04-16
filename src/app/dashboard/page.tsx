'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { sociosService, type Socio } from '@/lib/api/socios';
import {
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar,
  CreditCard,
  Activity,
} from 'lucide-react';

export default function DashboardPage() {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      const data = await sociosService.obtenerTodos({ page: 1, pageSize: 100 });
      setSocios(data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalSocios = socios.length;
  const sociosActivos = socios.filter((s) => s.estaActivo).length;
  const sociosInactivos = socios.filter((s) => !s.estaActivo).length;

  const stats = [
    {
      label: 'Total Socios',
      value: totalSocios,
      icon: <Users className="w-5 h-5" />,
      accent: '#C9A84C',
    },
    {
      label: 'Socios Activos',
      value: sociosActivos,
      icon: <CheckCircle className="w-5 h-5" />,
      accent: '#2DD4BF',
    },
    {
      label: 'Socios Inactivos',
      value: sociosInactivos,
      icon: <XCircle className="w-5 h-5" />,
      accent: '#F87171',
    },
    {
      label: 'Crecimiento',
      value: '+12%',
      icon: <TrendingUp className="w-5 h-5" />,
      accent: '#818CF8',
    },
  ];

  const quickActions = [
    {
      href: '/dashboard/socios/nuevo',
      icon: <Users className="w-4 h-4" />,
      label: 'Nuevo Socio',
      accent: '#C9A84C',
    },
    {
      href: '/dashboard/pagos/nuevo',
      icon: <CreditCard className="w-4 h-4" />,
      label: 'Registrar Pago',
      accent: '#2DD4BF',
    },
    {
      href: '/dashboard/asistencias/marcar',
      icon: <Calendar className="w-4 h-4" />,
      label: 'Marcar Asistencia',
      accent: '#818CF8',
    },
    {
      href: '/dashboard/actividades/nueva',
      icon: <Activity className="w-4 h-4" />,
      label: 'Nueva Actividad',
      accent: '#F97316',
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1
          className="font-display mb-1"
          style={{ fontSize: '2rem', fontWeight: 600, color: '#EDE8DC', letterSpacing: '0.02em' }}
        >
          Dashboard
        </h1>
        <p className="text-sm" style={{ color: '#4A6A8A' }}>
          Bienvenido al panel de administración del club
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div
            className="w-10 h-10 rounded-full border-2 animate-spin"
            style={{
              borderColor: 'rgba(201,168,76,0.15)',
              borderTopColor: '#C9A84C',
            }}
          />
        </div>
      ) : (
        <>
          {/* ── Stats Grid ──────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl p-5 relative overflow-hidden"
                style={{
                  background: '#0D1E35',
                  border: '1px solid rgba(255,255,255,0.06)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
              >
                {/* Top accent line */}
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{
                    background: `linear-gradient(90deg, ${stat.accent}, transparent)`,
                  }}
                />
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className="text-xs uppercase mb-3"
                      style={{ color: '#4A6A8A', letterSpacing: '0.1em' }}
                    >
                      {stat.label}
                    </p>
                    <p
                      className="font-display"
                      style={{
                        fontSize: '2.5rem',
                        fontWeight: 600,
                        color: stat.accent,
                        lineHeight: 1,
                      }}
                    >
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className="p-2.5 rounded-lg"
                    style={{
                      background: `${stat.accent}18`,
                      color: stat.accent,
                    }}
                  >
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Quick Actions + Recent Activity ─────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Quick Actions */}
            <div
              className="rounded-xl p-6"
              style={{
                background: '#0D1E35',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <h2
                className="font-display mb-5"
                style={{ fontSize: '1.15rem', fontWeight: 500, color: '#EDE8DC' }}
              >
                Acciones Rápidas
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-center gap-2.5 p-3.5 rounded-lg transition-all duration-150"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.borderColor = `${action.accent}35`)
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.borderColor =
                        'rgba(255,255,255,0.06)')
                    }
                  >
                    <span style={{ color: action.accent }}>{action.icon}</span>
                    <span
                      className="text-sm font-medium"
                      style={{ color: '#7A96B8' }}
                    >
                      {action.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div
              className="rounded-xl p-6"
              style={{
                background: '#0D1E35',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <h2
                className="font-display mb-5"
                style={{ fontSize: '1.15rem', fontWeight: 500, color: '#EDE8DC' }}
              >
                Últimos Socios
              </h2>
              <div className="space-y-2">
                {socios.slice(0, 5).map((socio) => (
                  <div
                    key={socio.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.02)' }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                      style={{
                        background: 'rgba(201,168,76,0.12)',
                        color: '#C9A84C',
                      }}
                    >
                      {socio.nombre.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: '#B0C8E0' }}
                      >
                        {socio.nombre} {socio.apellido}
                      </p>
                      <p className="text-xs truncate" style={{ color: '#2A4A6A' }}>
                        #{socio.numeroSocio}
                      </p>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
                      style={
                        socio.estaActivo
                          ? { background: 'rgba(45,212,191,0.1)', color: '#2DD4BF' }
                          : { background: 'rgba(248,113,113,0.1)', color: '#F87171' }
                      }
                    >
                      {socio.estaActivo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                ))}
                {socios.length === 0 && (
                  <p className="text-sm text-center py-4" style={{ color: '#2A4A6A' }}>
                    No hay socios registrados
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Members Table ────────────────────────────────── */}
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: '#0D1E35',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div
              className="px-6 py-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <h2
                className="font-display"
                style={{ fontSize: '1.15rem', fontWeight: 500, color: '#EDE8DC' }}
              >
                Últimos Socios Registrados
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {['Socio', 'Email', 'DNI', 'Estado'].map((col) => (
                      <th
                        key={col}
                        className="px-6 py-3 text-left text-xs font-medium uppercase"
                        style={{ color: '#3A5A7A', letterSpacing: '0.1em' }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {socios.slice(0, 10).map((socio, i) => (
                    <tr
                      key={socio.id}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                        background:
                          i % 2 === 1
                            ? 'rgba(255,255,255,0.01)'
                            : 'transparent',
                      }}
                    >
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                            style={{
                              background: 'rgba(201,168,76,0.1)',
                              color: '#C9A84C',
                            }}
                          >
                            {socio.nombre.charAt(0)}
                          </div>
                          <div>
                            <p
                              className="text-sm font-medium"
                              style={{ color: '#B0C8E0' }}
                            >
                              {socio.nombre} {socio.apellido}
                            </p>
                            <p className="text-xs" style={{ color: '#2A4A6A' }}>
                              #{socio.numeroSocio}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td
                        className="px-6 py-3.5 whitespace-nowrap text-sm"
                        style={{ color: '#4A6A8A' }}
                      >
                        {socio.email}
                      </td>
                      <td
                        className="px-6 py-3.5 whitespace-nowrap text-sm"
                        style={{ color: '#4A6A8A' }}
                      >
                        {socio.dni || '—'}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                          style={
                            socio.estaActivo
                              ? {
                                  background: 'rgba(45,212,191,0.1)',
                                  color: '#2DD4BF',
                                }
                              : {
                                  background: 'rgba(248,113,113,0.1)',
                                  color: '#F87171',
                                }
                          }
                        >
                          {socio.estaActivo ? (
                            <>
                              <CheckCircle className="w-3 h-3" /> Activo
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" /> Inactivo
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {socios.length === 0 && (
                <div
                  className="text-center py-12 text-sm"
                  style={{ color: '#2A4A6A' }}
                >
                  No se encontraron socios
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
