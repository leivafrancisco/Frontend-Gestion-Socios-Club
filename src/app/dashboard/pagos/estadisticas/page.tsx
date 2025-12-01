'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { pagosService, type EstadisticasPagos } from '@/lib/api/pagos';
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Calendar,
  CreditCard,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

export default function EstadisticasPagosPage() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasPagos | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fechaDesde, setFechaDesde] = useState<string>(
    format(startOfMonth(new Date()), 'yyyy-MM-dd')
  );
  const [fechaHasta, setFechaHasta] = useState<string>(
    format(endOfMonth(new Date()), 'yyyy-MM-dd')
  );
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<string>('mes-actual');

  useEffect(() => {
    cargarEstadisticas();
  }, [fechaDesde, fechaHasta]);

  const cargarEstadisticas = async () => {
    try {
      setIsLoading(true);
      const data = await pagosService.obtenerEstadisticas(fechaDesde, fechaHasta);
      setEstadisticas(data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePeriodoChange = (periodo: string) => {
    setPeriodoSeleccionado(periodo);
    const hoy = new Date();

    switch (periodo) {
      case 'hoy':
        setFechaDesde(format(hoy, 'yyyy-MM-dd'));
        setFechaHasta(format(hoy, 'yyyy-MM-dd'));
        break;
      case 'mes-actual':
        setFechaDesde(format(startOfMonth(hoy), 'yyyy-MM-dd'));
        setFechaHasta(format(endOfMonth(hoy), 'yyyy-MM-dd'));
        break;
      case 'mes-anterior':
        const mesAnterior = subMonths(hoy, 1);
        setFechaDesde(format(startOfMonth(mesAnterior), 'yyyy-MM-dd'));
        setFechaHasta(format(endOfMonth(mesAnterior), 'yyyy-MM-dd'));
        break;
      case 'ultimos-3-meses':
        setFechaDesde(format(subMonths(hoy, 3), 'yyyy-MM-dd'));
        setFechaHasta(format(hoy, 'yyyy-MM-dd'));
        break;
      case 'personalizado':
        // No hacer nada, el usuario ingresará las fechas manualmente
        break;
    }
  };

  if (isLoading || !estadisticas) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const maxPagoPorDia = Math.max(...estadisticas.pagosPorDia.map((p) => p.total), 1);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/pagos"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Pagos
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Estadísticas de Pagos</h1>
            <p className="text-gray-600">Análisis de recaudación y pagos</p>
          </div>
        </div>
      </div>

      {/* Filtros de Período */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
        <h2 className="font-semibold text-gray-900 mb-4">Período de Análisis</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <button
            onClick={() => handlePeriodoChange('hoy')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              periodoSeleccionado === 'hoy'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Hoy
          </button>
          <button
            onClick={() => handlePeriodoChange('mes-actual')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              periodoSeleccionado === 'mes-actual'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Mes Actual
          </button>
          <button
            onClick={() => handlePeriodoChange('mes-anterior')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              periodoSeleccionado === 'mes-anterior'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Mes Anterior
          </button>
          <button
            onClick={() => handlePeriodoChange('ultimos-3-meses')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              periodoSeleccionado === 'ultimos-3-meses'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Últimos 3 Meses
          </button>
          <button
            onClick={() => handlePeriodoChange('personalizado')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              periodoSeleccionado === 'personalizado'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Personalizado
          </button>
        </div>

        {periodoSeleccionado === 'personalizado' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Recaudado</h3>
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${estadisticas.totalRecaudado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Recaudado Hoy</h3>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${estadisticas.totalPagosHoy.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Recaudado Este Mes</h3>
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${estadisticas.totalPagosMes.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Saldo Pendiente</h3>
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${estadisticas.totalPendiente.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pagos por Método */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <CreditCard className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Pagos por Método</h2>
          </div>

          {estadisticas.pagosPorMetodo.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay datos en este período</p>
          ) : (
            <div className="space-y-4">
              {estadisticas.pagosPorMetodo.map((metodo, index) => {
                const porcentaje =
                  (metodo.total / estadisticas.totalRecaudado) * 100 || 0;
                return (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {metodo.metodo}
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          ${metodo.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({metodo.cantidad} {metodo.cantidad === 1 ? 'pago' : 'pagos'})
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${porcentaje}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      {porcentaje.toFixed(1)}%
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagos por Día */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Pagos por Día</h2>
          </div>

          {estadisticas.pagosPorDia.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay datos en este período</p>
          ) : (
            <div className="space-y-3">
              {estadisticas.pagosPorDia.map((dia, index) => {
                const alturaRelativa = (dia.total / maxPagoPorDia) * 100;
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-24 text-xs text-gray-600 flex-shrink-0">
                      {format(new Date(dia.fecha), 'dd/MM/yyyy', { locale: es })}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-green-500 to-green-600 h-8 rounded-full flex items-center justify-end px-3 transition-all duration-500"
                            style={{ width: `${alturaRelativa}%` }}
                          >
                            {alturaRelativa > 20 && (
                              <span className="text-xs font-semibold text-white">
                                ${dia.total.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-20 text-right flex-shrink-0">
                          <p className="text-xs font-semibold text-gray-900">
                            {dia.cantidad} {dia.cantidad === 1 ? 'pago' : 'pagos'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
