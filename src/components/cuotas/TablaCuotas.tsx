'use client';

import React from 'react';
import { CuotaDto } from '@/lib/api/cuotas';
import { Calendar, DollarSign, Clock, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

interface TablaCuotasProps {
  cuotas: CuotaDto[];
  onGenerarCuotas?: () => void;
  mostrarBotonGenerar?: boolean;
  loading?: boolean;
}

export default function TablaCuotas({
  cuotas,
  onGenerarCuotas,
  mostrarBotonGenerar,
  loading = false,
}: TablaCuotasProps) {
  const getBadgeStyle = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pagada':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'vencida':
        return 'bg-red-100 text-red-700 border-red-200 animate-pulse';
      case 'pendiente':
      default:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  const formatearFecha = (fechaString: string): string => {
    if (!fechaString) return '-';
    const fechaParaParsear = fechaString.includes('T') ? fechaString : fechaString + 'T00:00:00';
    const fecha = new Date(fechaParaParsear);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
      {/* Encabezado */}
      <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Plan de Cuotas Mensuales</h3>
            <p className="text-xs text-gray-500">Control de vencimientos y estado de facturación.</p>
          </div>
        </div>
        {mostrarBotonGenerar && cuotas.length === 0 && onGenerarCuotas && (
          <button
            onClick={onGenerarCuotas}
            disabled={loading}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : null}
            Generar Cuotas
          </button>
        )}
      </div>

      {/* Contenido / Tabla */}
      <div className="p-6">
        {loading && cuotas.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <span className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-sm text-gray-500">Cargando cuotas...</span>
          </div>
        ) : cuotas.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
            <HelpCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600 font-medium">No hay cuotas generadas para esta membresía.</p>
            {mostrarBotonGenerar && onGenerarCuotas && (
              <p className="text-sm text-gray-500 mt-1">
                Haz clic en el botón superior derecho para generarlas.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-semibold">N° Cuota</th>
                  <th className="px-6 py-3 font-semibold">Período Membresía</th>
                  <th className="px-6 py-3 font-semibold text-right">Monto</th>
                  <th className="px-6 py-3 font-semibold">Vencimiento</th>
                  <th className="px-6 py-3 font-semibold text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cuotas.map((cuota) => (
                  <tr key={cuota.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      Cuota {cuota.numeroCuota}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {cuota.periodoMembresia}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      ${cuota.monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{formatearFecha(cuota.fechaVencimiento)}</span>
                        {cuota.estado.toLowerCase() === 'vencida' && (
                          <span className="text-[10px] text-red-600 font-semibold bg-red-100/50 px-1.5 py-0.5 rounded">
                            Hace {cuota.diasVencida} días
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeStyle(cuota.estado)}`}>
                        {cuota.estado.toUpperCase() === 'PAGADA' ? (
                          <CheckCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                        ) : cuota.estado.toUpperCase() === 'VENCIDA' ? (
                          <AlertTriangle className="w-3 h-3 mr-1 flex-shrink-0" />
                        ) : (
                          <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                        )}
                        {cuota.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
