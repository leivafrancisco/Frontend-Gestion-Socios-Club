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
  Activity
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
  const sociosActivos = socios.filter(s => s.estaActivo).length;
  const sociosInactivos = socios.filter(s => !s.estaActivo).length;

  const stats = [
    {
      label: 'Total Socios',
      value: totalSocios,
      icon: <Users className="w-6 h-6" />,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
    {
      label: 'Socios Activos',
      value: sociosActivos,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      label: 'Socios Inactivos',
      value: sociosInactivos,
      icon: <XCircle className="w-6 h-6" />,
      color: 'red',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
    },
    {
      label: 'Crecimiento',
      value: '+12%',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Bienvenido al panel de administracion del club</p>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <p className={`text-3xl font-bold mt-1 ${stat.textColor}`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-xl`}>
                    <div className={stat.textColor}>{stat.icon}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rapidas</h2>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/dashboard/socios/nuevo" className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Nuevo Socio</span>
                </Link>
                <button className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Registrar Pago</span>
                </button>
                <button className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Marcar Asistencia</span>
                </button>
                <Link href="/dashboard/actividades/nueva" className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                  <Activity className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">Nueva Actividad</span>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h2>
              <div className="space-y-4">
                {socios.slice(0, 5).map((socio) => (
                  <div key={socio.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {socio.nombre} {socio.apellido}
                      </p>
                      <p className="text-xs text-gray-500">
                        Socio #{socio.numeroSocio}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      socio.estaActivo
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {socio.estaActivo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                ))}
                {socios.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No hay socios registrados
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Ultimos Socios Registrados</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Socio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DNI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {socios.slice(0, 10).map((socio) => (
                    <tr key={socio.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {socio.nombre.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {socio.nombre} {socio.apellido}
                            </p>
                            <p className="text-xs text-gray-500">#{socio.numeroSocio}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {socio.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {socio.dni || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {socio.estaActivo ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactivo
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {socios.length === 0 && (
                <div className="text-center py-12 text-gray-500">
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
