'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { membresiasService, type Membresia } from '@/lib/api/membresias';
import {
  CreditCard,
  Plus,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Edit,
  Search,
  X,
  Filter,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type EstadoVigencia = 'todas' | 'vigentes' | 'vencidas' | 'proximas_vencer';

export default function MembresiasPage() {
  const [membresias, setMembresias] = useState<Membresia[]>([]);
  const [membresiasFiltradas, setMembresiasFiltradas] = useState<Membresia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoVigencia, setEstadoVigencia] = useState<EstadoVigencia>('todas');

  useEffect(() => {
    cargarMembresias();
  }, []);

  useEffect(() => {
    filtrarMembresias();
  }, [searchTerm, estadoVigencia, membresias]);

  const cargarMembresias = async () => {
    try {
      setIsLoading(true);
      const data = await membresiasService.obtenerTodas();
      setMembresias(data);
      setMembresiasFiltradas(data);
    } catch (error) {
      console.error('Error al cargar membresías:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filtrarMembresias = () => {
    let filtradas = [...membresias];

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const termino = searchTerm.toLowerCase();
      filtradas = filtradas.filter(m =>
        m.nombreSocio.toLowerCase().includes(termino) ||
        m.numeroSocio.toLowerCase().includes(termino)
      );
    }

    // Filtrar por estado de vigencia
    if (estadoVigencia !== 'todas') {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const en7Dias = new Date();
      en7Dias.setDate(en7Dias.getDate() + 7);
      en7Dias.setHours(23, 59, 59, 999);

      filtradas = filtradas.filter(m => {
        const fechaFin = new Date(m.fechaFin);
        fechaFin.setHours(0, 0, 0, 0);

        switch (estadoVigencia) {
          case 'vigentes':
            // Vigentes: fecha fin es mayor a hoy + 7 días
            return fechaFin > en7Dias;
          case 'vencidas':
            // Vencidas: fecha fin es menor a hoy
            return fechaFin < hoy;
          case 'proximas_vencer':
            // Próximas a vencer: fecha fin está entre hoy y los próximos 7 días
            return fechaFin >= hoy && fechaFin <= en7Dias;
          default:
            return true;
        }
      });
    }

    setMembresiasFiltradas(filtradas);
  };

  const limpiarBusqueda = () => {
    setSearchTerm('');
  };

  const obtenerEstadoVigenciaMembresia = (fechaFin: string) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const en7Dias = new Date();
    en7Dias.setDate(en7Dias.getDate() + 7);
    en7Dias.setHours(23, 59, 59, 999);

    const fechaFinMembresia = new Date(fechaFin);
    fechaFinMembresia.setHours(0, 0, 0, 0);

    if (fechaFinMembresia < hoy) {
      return {
        label: 'Vencida',
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: <AlertTriangle className="w-3 h-3" />,
      };
    } else if (fechaFinMembresia >= hoy && fechaFinMembresia <= en7Dias) {
      return {
        label: 'Por vencer',
        color: 'bg-orange-100 text-orange-700 border-orange-200',
        icon: <Clock className="w-3 h-3" />,
      };
    } else {
      return {
        label: 'Vigente',
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: <CheckCircle className="w-3 h-3" />,
      };
    }
  };

  // Función para formatear fecha en dd/mm/aaaa
  const formatearFecha = (fechaString: string): string => {
    const fecha = new Date(fechaString);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  };

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta membresía? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setIsDeleting(true);
      await membresiasService.eliminar(id);
      await cargarMembresias();
    } catch (error: any) {
      console.error('Error al eliminar membresía:', error);
      alert(error.response?.data?.message || 'Error al eliminar la membresía. Por favor, intenta nuevamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Membresías</h1>
          <p className="text-gray-600">Gestiona las membresías de los socios</p>
        </div>
        <Link
          href="/dashboard/membresias/nueva"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Membresía
        </Link>
      </div>

      {/* Buscador y Filtros */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Buscador */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre de socio o número de socio..."
              className="w-full pl-11 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            {searchTerm && (
              <button
                onClick={limpiarBusqueda}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filtro por Estado de Vigencia */}
          <div className="relative md:w-64">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={estadoVigencia}
              onChange={(e) => setEstadoVigencia(e.target.value as EstadoVigencia)}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white cursor-pointer"
            >
              <option value="todas">Todas las membresías</option>
              <option value="vigentes">Vigentes (al día)</option>
              <option value="proximas_vencer">Próximas a vencer (7 días)</option>
              <option value="vencidas">Vencidas</option>
            </select>
          </div>
        </div>

        {/* Contador de resultados */}
        {(searchTerm || estadoVigencia !== 'todas') && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <p className="text-gray-600">
              Mostrando {membresiasFiltradas.length} de {membresias.length} membresías
            </p>
            {(searchTerm || estadoVigencia !== 'todas') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setEstadoVigencia('todas');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Membresías</p>
            <p className="text-xl font-bold text-gray-900">{membresiasFiltradas.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pagadas</p>
            <p className="text-xl font-bold text-green-600">
              {membresiasFiltradas.filter((m) => m.estaPaga).length}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="bg-red-100 p-2 rounded-lg">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pendientes</p>
            <p className="text-xl font-bold text-red-600">
              {membresiasFiltradas.filter((m) => !m.estaPaga).length}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Recaudado</p>
            <p className="text-xl font-bold text-purple-600">
              ${membresiasFiltradas.reduce((sum, m) => sum + m.totalPagado, 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : membresiasFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm
                  ? 'No se encontraron membresías que coincidan con la búsqueda'
                  : 'No hay membresías registradas'}
              </p>
              {searchTerm && (
                <button
                  onClick={limpiarBusqueda}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Socio
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actividades
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Pagado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {membresiasFiltradas.map((membresia) => (
                  <tr key={membresia.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {membresia.nombreSocio}
                          </p>
                          <p className="text-xs text-gray-500">#{membresia.numeroSocio}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <div>
                            <div>{formatearFecha(membresia.fechaInicio)}</div>
                            <div className="text-xs text-gray-500">a {formatearFecha(membresia.fechaFin)}</div>
                          </div>
                        </div>
                        {(() => {
                          const estado = obtenerEstadoVigenciaMembresia(membresia.fechaFin);
                          return (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${estado.color}`}>
                              {estado.icon}
                              <span className="ml-1">{estado.label}</span>
                            </span>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {membresia.actividades.length} actividad(es)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-medium text-gray-900">
                        ${membresia.totalCargado.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm text-gray-600">
                        ${membresia.totalPagado.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {membresia.estaPaga ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Pagada
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <XCircle className="w-3 h-3 mr-1" />
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Ver detalle */}
                        <Link
                          href={`/dashboard/membresias/${membresia.id}`}
                          className="p-2 rounded-lg border-2 border-blue-600 bg-blue-600 hover:bg-blue-700 hover:border-blue-700 transition-colors group"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4 text-white" />
                        </Link>

                        {/* Editar */}
                        <Link
                          href={`/dashboard/membresias/${membresia.id}/editar`}
                          className="p-2 rounded-lg border-2 border-green-600 bg-green-600 hover:bg-green-700 hover:border-green-700 transition-colors"
                          title="Editar membresía"
                        >
                          <Edit className="w-4 h-4 text-white" />
                        </Link>

                        {/* Eliminar */}
                        <button
                          onClick={() => handleEliminar(membresia.id)}
                          disabled={isDeleting}
                          className="p-2 rounded-lg border-2 border-red-600 bg-red-600 hover:bg-red-700 hover:border-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {membresiasFiltradas.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Mostrando {membresiasFiltradas.length} membresías
              {searchTerm && ` de ${membresias.length} totales`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
