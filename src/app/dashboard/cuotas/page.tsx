'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { cuotasService, CuotaDto, ResumenCuotasDto, CuotaEstado } from '@/lib/api/cuotas';
import {
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Clock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  ListFilter,
  Search,
} from 'lucide-react';

export default function ResumenCuotasPage() {
  const [resumen, setResumen] = useState<ResumenCuotasDto | null>(null);
  const [cuotas, setCuotas] = useState<CuotaDto[]>([]);
  const [loadingResumen, setLoadingResumen] = useState(true);
  const [loadingCuotas, setLoadingCuotas] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Filtros y paginación
  const [estadoFiltro, setEstadoFiltro] = useState<CuotaEstado | 'todas'>('todas');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const cargarResumen = async () => {
    try {
      setLoadingResumen(true);
      const data = await cuotasService.obtenerResumen();
      setResumen(data);
    } catch (error) {
      console.error('Error al cargar resumen de cuotas:', error);
    } finally {
      setLoadingResumen(false);
    }
  };

  const cargarCuotas = async (termOverride?: string) => {
    try {
      setLoadingCuotas(true);
      const activeTerm = termOverride !== undefined ? termOverride : searchTerm;

      const filtros: any = {
        page: page,
        pageSize: pageSize,
      };
      if (activeTerm.trim()) {
        filtros.search = activeTerm.trim();
      }
      if (estadoFiltro !== 'todas') {
        filtros.estado = estadoFiltro;
      }
      
      const data = await cuotasService.obtenerTodas(filtros);
      setCuotas(data);
      setHasMore(data.length === pageSize);
    } catch (error) {
      console.error('Error al cargar listado de cuotas:', error);
    } finally {
      setLoadingCuotas(false);
    }
  };

  const handleSearch = () => {
    if (page !== 1) {
      setPage(1);
    } else {
      cargarCuotas();
    }
  };

  const ejecutarActualizacion = async () => {
    const confirmar = window.confirm(
      '¿Desea ejecutar el proceso de mantenimiento para marcar como vencidas las cuotas pendientes cuya fecha de vencimiento ya expiró?'
    );
    if (!confirmar) return;

    try {
      setUpdating(true);
      const res = await cuotasService.actualizarVencidas();
      alert(res.message);
      await Promise.all([cargarResumen(), cargarCuotas()]);
    } catch (error) {
      console.error('Error al actualizar cuotas vencidas:', error);
      alert('Ocurrió un error al actualizar el estado de las cuotas.');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    cargarResumen();
  }, []);

  useEffect(() => {
    cargarCuotas();
  }, [estadoFiltro, page]);

  const formatearFecha = (fechaString: string): string => {
    if (!fechaString) return '-';
    const fechaParaParsear = fechaString.includes('T') ? fechaString : fechaString + 'T00:00:00';
    const fecha = new Date(fechaParaParsear);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  };

  const getBadgeStyle = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pagada':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'vencida':
        return 'bg-red-100 text-red-700 border border-red-200 animate-pulse';
      case 'pendiente':
      default:
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
    }
  };

  // cuotasFiltradas se elimina, se utiliza cuotas directamente

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1
            className="font-display mb-1"
            style={{ fontSize: '2rem', fontWeight: 600, color: '#EDE8DC', letterSpacing: '0.02em' }}
          >
            Control de Cuotas e Ingresos
          </h1>
          <p className="text-sm text-gray-500">
            Monitoreo de recaudación, morosidad y estados de pagos.
          </p>
        </div>
        <button
          onClick={ejecutarActualizacion}
          disabled={updating}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {updating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {updating ? 'Procesando...' : 'Actualizar Vencidas'}
        </button>
      </div>

      {/* Grid de Estadísticas */}
      {loadingResumen ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 h-28 animate-pulse" />
          ))}
        </div>
      ) : resumen ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card Pendientes */}
          <div
            className="bg-white border border-gray-200 rounded-xl p-5 relative overflow-hidden"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, #FBB24A, transparent)' }}
            />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase font-semibold text-gray-500 tracking-wider">
                  Monto Pendiente Total
                </p>
                <h3 className="text-2xl font-bold mt-2 text-yellow-600">
                  ${resumen.montoTotalPendiente.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {resumen.cuotasPendientes} cuotas activas
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-yellow-500/10 text-yellow-500">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Card Vencidas */}
          <div
            className="bg-white border border-gray-200 rounded-xl p-5 relative overflow-hidden"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, #F87171, transparent)' }}
            />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase font-semibold text-gray-500 tracking-wider">
                  Deuda Vencida (Morosa)
                </p>
                <h3 className="text-2xl font-bold mt-2 text-red-600">
                  ${resumen.montoTotalVencido.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {resumen.cuotasVencidas} cuotas vencidas
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-red-500/10 text-red-500">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Card Socios Morosos */}
          <Link
            href="/dashboard/cuotas/morosos"
            className="bg-white border border-gray-200 hover:border-red-500/50 rounded-xl p-5 relative overflow-hidden block transition-all"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, #F87171, transparent)' }}
            />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase font-semibold text-gray-500 tracking-wider">
                  Socios Morosos
                </p>
                <h3 className="text-2xl font-bold mt-2 text-red-500 flex items-baseline gap-1.5">
                  {resumen.totalMorosos}
                  <span className="text-xs font-normal text-gray-400">Ver listado &rarr;</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Con al menos 1 cuota vencida
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-red-500/10 text-red-500">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </Link>

          {/* Card Cuotas Pagadas */}
          <div
            className="bg-white border border-gray-200 rounded-xl p-5 relative overflow-hidden"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, #2DD4BF, transparent)' }}
            />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase font-semibold text-gray-500 tracking-wider">
                  Cuotas Pagadas
                </p>
                <h3 className="text-2xl font-bold mt-2 text-green-500">
                  {resumen.cuotasPagadas}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  De un total de {resumen.totalCuotas} cuotas
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-green-500/10 text-green-500">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Listado y Filtros */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {/* Filtros Bar */}
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
            <ListFilter className="w-5 h-5 text-gray-500" />
            Planilla de Cuotas del Club
          </h2>
          <div className="flex flex-wrap gap-2">
            {(['todas', 'pendiente', 'pagada', 'vencida'] as const).map((estado) => (
              <button
                key={estado}
                onClick={() => {
                  setEstadoFiltro(estado);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase border transition-all ${
                  estadoFiltro === estado
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {estado}
              </button>
            ))}
          </div>
        </div>

        {/* Buscador */}
        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o número de socio..."
              value={searchTerm}
              onChange={(e) => {
                const val = e.target.value;
                setSearchTerm(val);
                if (val.trim() === '') {
                  cargarCuotas('');
                }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-900 text-sm"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-semibold flex items-center gap-1.5 justify-center"
          >
            <Search className="w-4 h-4" />
            Buscar
          </button>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          {loadingCuotas ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-sm text-gray-500">Cargando planilla de cuotas...</span>
            </div>
          ) : cuotas.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              No se encontraron cuotas para el criterio de búsqueda o filtro.
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Socio</th>
                  <th className="px-6 py-3.5 font-semibold">Membresía / N° Cuota</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Monto</th>
                  <th className="px-6 py-3.5 font-semibold">Vencimiento</th>
                  <th className="px-6 py-3.5 font-semibold text-center">Estado</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cuotas.map((cuota) => (
                  <tr key={cuota.id} className="hover:bg-gray-200 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{cuota.nombreSocio}</div>
                      <div className="text-xs text-gray-500">N° Socio: #{cuota.numeroSocio}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-medium">Membresía #{cuota.idMembresia}</div>
                      <div className="text-xs text-gray-500">Cuota {cuota.numeroCuota} ({cuota.periodoMembresia})</div>
                      {cuota.actividades && cuota.actividades.length > 0 && (
                        <div className="text-xs text-gray-700 mt-1.5 font-semibold bg-gray-100 rounded-md px-2 py-1 inline-block border border-gray-200 shadow-sm">
                          {cuota.actividades.join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      ${cuota.monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{formatearFecha(cuota.fechaVencimiento)}</span>
                        {cuota.estado === 'vencida' && (
                          <span className="text-[10px] text-red-600 font-semibold bg-red-100/50 px-1.5 py-0.5 rounded">
                            {cuota.diasVencida}d
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeStyle(cuota.estado)}`}>
                        {cuota.estado.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3 text-xs font-semibold">
                        <Link
                          href={`/dashboard/socios/${cuota.idSocio}`}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Users className="w-3.5 h-3.5" />
                          Socio
                        </Link>
                        <Link
                          href={`/dashboard/membresias/${cuota.idMembresia}`}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Membresía
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginación */}
        {!loadingCuotas && cuotas.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
            <div>Página {page}</div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore}
                className="p-1.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
