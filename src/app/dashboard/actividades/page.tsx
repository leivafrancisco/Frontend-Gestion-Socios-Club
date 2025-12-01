'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { actividadesService, type Actividad } from '@/lib/api/actividades';
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ActividadesPage() {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarActividades();
  }, []);

  const cargarActividades = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await actividadesService.obtenerTodas();
      setActividades(data);
    } catch (err: any) {
      console.error('Error al cargar actividades:', err);
      setError('Error al cargar las actividades');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminar = async (id: number, nombre: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la actividad "${nombre}"?`)) {
      return;
    }

    try {
      await actividadesService.eliminar(id);
      setActividades(actividades.filter(a => a.id !== id));
    } catch (err: any) {
      console.error('Error al eliminar actividad:', err);
      alert('Error al eliminar la actividad');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Actividades</h1>
          <p className="text-gray-600">Gestión de actividades y servicios del club</p>
        </div>
        <Link
          href="/dashboard/actividades/nueva"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Actividad
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Stats Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total de Actividades</p>
            <p className="text-2xl font-bold text-gray-900">{actividades.length}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio Mensual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Creación
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {actividades.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No hay actividades registradas
                  </td>
                </tr>
              ) : (
                actividades.map((actividad) => (
                  <tr key={actividad.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {actividad.nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-md truncate">
                        {actividad.descripcion || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-green-600">
                        ${actividad.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(actividad.fechaCreacion), "dd/MM/yyyy", { locale: es })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/actividades/${actividad.id}/editar`}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </Link>
                        <button
                          onClick={() => handleEliminar(actividad.id, actividad.nombre)}
                          className="inline-flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
