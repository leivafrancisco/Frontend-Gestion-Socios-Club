'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { asistenciaService, type AsistenciaDto } from '@/lib/api/asistencias';
import { Calendar, Search, X, User, Clock, CreditCard, CalendarCheck } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AsistenciasPage() {
  const [asistencias, setAsistencias] = useState<AsistenciaDto[]>([]);
  const [asistenciasFiltradas, setAsistenciasFiltradas] = useState<AsistenciaDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [asistenciaSeleccionada, setAsistenciaSeleccionada] = useState<AsistenciaDto | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [fechaFiltro, setFechaFiltro] = useState('');

  useEffect(() => {
    cargarAsistencias();
  }, []);

  useEffect(() => {
    filtrarAsistencias();
  }, [busqueda, asistencias]);

  const cargarAsistencias = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await asistenciaService.obtenerAsistencias();
      setAsistencias(data);
      setAsistenciasFiltradas(data);
    } catch (err: any) {
      console.error('Error al cargar asistencias:', err);
      setError('Error al cargar las asistencias');
    } finally {
      setIsLoading(false);
    }
  };

  const filtrarAsistencias = () => {
    if (!busqueda.trim()) {
      setAsistenciasFiltradas(asistencias);
      return;
    }

    const busquedaLower = busqueda.toLowerCase().trim();
    const filtradas = asistencias.filter(
      (asistencia) =>
        asistencia.nombreSocio.toLowerCase().includes(busquedaLower) ||
        asistencia.numeroSocio.toLowerCase().includes(busquedaLower)
    );
    setAsistenciasFiltradas(filtradas);
  };

  const abrirModal = (asistencia: AsistenciaDto) => {
    setAsistenciaSeleccionada(asistencia);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setAsistenciaSeleccionada(null);
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
          <h1 className="text-2xl font-bold text-gray-900">Registro de Asistencias</h1>
          <p className="text-gray-600">Historial completo de asistencias del club</p>
        </div>
        <Link
          href="/dashboard/asistencias/marcar"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <CalendarCheck className="w-4 h-4" />
          Marcar Asistencia
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Buscador */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Buscar por nombre de socio o número de socio..."
          />
        </div>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de Asistencias</p>
              <p className="text-2xl font-bold text-gray-900">{asistenciasFiltradas.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Asistencias Hoy</p>
              <p className="text-2xl font-bold text-gray-900">
                {asistenciasFiltradas.filter((a) =>
                  format(new Date(a.fechaHoraIngreso), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                ).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CalendarCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Socios Únicos</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(asistenciasFiltradas.map((a) => a.idSocio)).size}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <User className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nº Socio
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre del Socio
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha y Hora
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {asistenciasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-gray-500">
                    {busqueda ? 'No se encontraron asistencias con ese criterio de búsqueda' : 'No hay asistencias registradas'}
                  </td>
                </tr>
              ) : (
                asistenciasFiltradas.map((asistencia) => (
                  <tr
                    key={asistencia.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => abrirModal(asistencia)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{asistencia.id}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900">{asistencia.numeroSocio}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{asistencia.nombreSocio}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {format(new Date(asistencia.fechaHoraIngreso), "dd/MM/yyyy", { locale: es })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(asistencia.fechaHoraIngreso), "HH:mm:ss", { locale: es })}
                          </div>
                        </div>
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
      {mostrarModal && asistenciaSeleccionada && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={cerrarModal}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* Header del Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600">
              <h2 className="text-xl font-semibold text-white">Detalles de Asistencia</h2>
              <button
                onClick={cerrarModal}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="px-6 py-6 space-y-6">
              {/* ID de Asistencia */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                <p className="text-sm text-blue-600 font-medium mb-1">ID de Asistencia</p>
                <p className="text-2xl font-bold text-blue-700">#{asistenciaSeleccionada.id}</p>
              </div>

              {/* Información del Socio */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-600" />
                  Información del Socio
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Número de Socio</label>
                    <p className="text-lg font-semibold text-gray-900">{asistenciaSeleccionada.numeroSocio}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Nombre Completo</label>
                    <p className="text-lg font-semibold text-gray-900">{asistenciaSeleccionada.nombreSocio}</p>
                  </div>
                </div>
              </div>

              {/* Fecha y Hora de Ingreso */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-600" />
                  Fecha y Hora de Ingreso
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-green-600 mb-2">
                      <Calendar className="w-4 h-4" />
                      Fecha
                    </label>
                    <p className="text-xl font-bold text-green-700">
                      {format(new Date(asistenciaSeleccionada.fechaHoraIngreso), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                    </p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-purple-600 mb-2">
                      <Clock className="w-4 h-4" />
                      Hora
                    </label>
                    <p className="text-xl font-bold text-purple-700">
                      {format(new Date(asistenciaSeleccionada.fechaHoraIngreso), "HH:mm:ss", { locale: es })}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
