'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { pagosService, type Pago, type MetodoPago } from '@/lib/api/pagos';
import { sociosService, type Socio } from '@/lib/api/socios';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Calendar,
  Download,
  Receipt,
  BarChart3,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [socios, setSocios] = useState<Socio[]>([]);
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros
  const [socioSeleccionado, setSocioSeleccionado] = useState<number | undefined>();
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState<number | undefined>();
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      const [pagosData, sociosData, metodosData] = await Promise.all([
        pagosService.listar(),
        sociosService.obtenerTodos({ estaActivo: true }),
        pagosService.obtenerMetodosPago(),
      ]);

      setPagos(pagosData);
      setSocios(sociosData);
      setMetodosPago(metodosData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const aplicarFiltros = async () => {
    try {
      setIsLoading(true);
      const pagosData = await pagosService.listar({
        idSocio: socioSeleccionado,
        idMetodoPago: metodoPagoSeleccionado,
        fechaDesde: fechaDesde || undefined,
        fechaHasta: fechaHasta || undefined,
      });
      setPagos(pagosData);
    } catch (error) {
      console.error('Error al aplicar filtros:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setSocioSeleccionado(undefined);
    setMetodoPagoSeleccionado(undefined);
    setFechaDesde('');
    setFechaHasta('');
    cargarDatos();
  };

  const calcularTotales = () => {
    const total = pagos.reduce((sum, pago) => sum + pago.monto, 0);
    const totalHoy = pagos
      .filter(p => format(new Date(p.fechaPago), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
      .reduce((sum, pago) => sum + pago.monto, 0);

    return { total, totalHoy, cantidad: pagos.length };
  };

  const totales = calcularTotales();

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
          <h1 className="text-2xl font-bold text-gray-900">Pagos</h1>
          <p className="text-gray-600">Gestión de pagos y recaudación</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/pagos/estadisticas"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Estadísticas
          </Link>
          <Link
            href="/dashboard/pagos/nuevo"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Registrar Pago
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Recaudado</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totales.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Recaudado Hoy</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totales.totalHoy.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de Pagos</p>
              <p className="text-2xl font-bold text-gray-900">{totales.cantidad}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Receipt className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filtros</span>
          </button>
          {(socioSeleccionado || metodoPagoSeleccionado || fechaDesde || fechaHasta) && (
            <button
              onClick={limpiarFiltros}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {mostrarFiltros && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Socio
              </label>
              <select
                value={socioSeleccionado || ''}
                onChange={(e) => setSocioSeleccionado(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los socios</option>
                {socios.map((socio) => (
                  <option key={socio.id} value={socio.id}>
                    {socio.numeroSocio} - {socio.nombre} {socio.apellido}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de Pago
              </label>
              <select
                value={metodoPagoSeleccionado || ''}
                onChange={(e) => setMetodoPagoSeleccionado(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los métodos</option>
                {metodosPago.map((metodo) => (
                  <option key={metodo.id} value={metodo.id}>
                    {metodo.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Desde
              </label>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Hasta
              </label>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-4 flex justify-end">
              <button
                onClick={aplicarFiltros}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Socio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método de Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Procesado Por
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pagos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No hay pagos registrados
                  </td>
                </tr>
              ) : (
                pagos.map((pago) => (
                  <tr key={pago.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(pago.fechaPago), "dd/MM/yyyy", { locale: es })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {pago.numeroSocio}
                      </div>
                      <div className="text-sm text-gray-500">{pago.nombreSocio}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pago.periodoMembresia}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {pago.metodoPagoNombre}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      ${pago.monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pago.nombreUsuarioProcesa || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Link
                        href={`/dashboard/pagos/${pago.id}/comprobante`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                      >
                        <Receipt className="w-4 h-4" />
                        Ver Comprobante
                      </Link>
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
