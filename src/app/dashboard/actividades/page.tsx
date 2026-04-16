'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { actividadesService, type Actividad } from '@/lib/api/actividades';
import { Plus, Edit, Trash2, DollarSign, X, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ActividadesPage() {
  const router = useRouter();
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actividadSeleccionada, setActividadSeleccionada] = useState<Actividad | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    const usuarioStr = localStorage.getItem('usuario');
    if (!usuarioStr) { router.push('/login'); return; }
    try {
      const usuario = JSON.parse(usuarioStr);
      if (usuario.rol?.toLowerCase() !== 'superadmin') { router.push('/dashboard'); return; }
    } catch { router.push('/login'); return; }
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

  const abrirModal = (actividad: Actividad) => {
    setActividadSeleccionada(actividad);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setActividadSeleccionada(null);
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
                  Precio Mensual
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
                  Fecha de Creación
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-44">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {actividades.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                    No hay actividades registradas
                  </td>
                </tr>
              ) : (
                actividades.map((actividad) => (
                  <tr
                    key={actividad.id}
                    className="cursor-pointer transition-colors hover:bg-gray-50"
                    onClick={() => abrirModal(actividad)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {actividad.nombre}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-500 max-w-xs truncate" title={actividad.descripcion || '-'}>
                        {actividad.descripcion || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-semibold text-green-600">
                        ${actividad.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(actividad.fechaCreacion), "dd/MM/yyyy", { locale: es })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/dashboard/actividades/${actividad.id}/editar`}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                          title="Editar actividad"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Editar</span>
                        </Link>
                        <button
                          onClick={() => handleEliminar(actividad.id, actividad.nombre)}
                          className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors"
                          title="Eliminar actividad"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Eliminar</span>
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

      {/* Modal de Detalles */}
      {mostrarModal && actividadSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={cerrarModal}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* Header del Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Detalles de la Actividad
              </h2>
              <button
                onClick={cerrarModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="px-6 py-6 space-y-6">
              {/* ID y Nombre */}
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Nombre</label>
                  <p className="text-lg font-semibold text-gray-900">{actividadSeleccionada.nombre}</p>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                  <FileText className="w-4 h-4" />
                  Descripción
                </label>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {actividadSeleccionada.descripcion || 'Sin descripción'}
                  </p>
                </div>
              </div>

              {/* Precio y Fecha */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                    <DollarSign className="w-4 h-4" />
                    Precio Mensual
                  </label>
                  <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                    <p className="text-2xl font-bold text-green-600">
                      ${actividadSeleccionada.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                    <Calendar className="w-4 h-4" />
                    Fecha de Creación
                  </label>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                    <p className="text-lg font-semibold text-blue-700">
                      {format(new Date(actividadSeleccionada.fechaCreacion), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg flex justify-end gap-3">
              <button
                onClick={cerrarModal}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cerrar
              </button>
              <Link
                href={`/dashboard/actividades/${actividadSeleccionada.id}/editar`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Editar Actividad
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
