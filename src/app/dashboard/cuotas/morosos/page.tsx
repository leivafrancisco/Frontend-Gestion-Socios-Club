'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { cuotasService, MorosoDto } from '@/lib/api/cuotas';
import { ArrowLeft, Users, AlertCircle, Loader2, Calendar } from 'lucide-react';

export default function ListaMorososPage() {
  const [morosos, setMorosos] = useState<MorosoDto[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarMorosos = async () => {
    try {
      setLoading(true);
      const data = await cuotasService.obtenerMorosos();
      setMorosos(data);
    } catch (err) {
      console.error('Error al cargar morosos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMorosos();
  }, []);

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
    <div className="space-y-6">
      {/* Botón Volver e Info */}
      <div>
        <Link
          href="/dashboard/cuotas"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver a Control de Cuotas
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-500/10 text-red-500 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1
              className="font-display mb-1"
              style={{ fontSize: '2rem', fontWeight: 600, color: '#EDE8DC', letterSpacing: '0.02em' }}
            >
              Socios en Estado de Morosidad
            </h1>
            <p className="text-sm text-gray-500">
              Listado ordenado de socios con cuotas vencidas y deuda pendiente.
            </p>
          </div>
        </div>
      </div>

      {/* Tabla de Socios Morosos */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-sm text-gray-500">Cargando socios morosos...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Socio</th>
                  <th className="px-6 py-4 font-semibold text-center">Cuotas Vencidas</th>
                  <th className="px-6 py-4 font-semibold text-right">Deuda Total</th>
                  <th className="px-6 py-4 font-semibold">Vencimiento Más Antiguo</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {morosos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      ¡Excelente! No hay socios morosos en el sistema.
                    </td>
                  </tr>
                ) : (
                  morosos.map((moroso) => (
                    <tr key={moroso.idSocio} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{moroso.nombreSocio}</div>
                        <div className="text-xs text-gray-500">
                          N° Socio: #{moroso.numeroSocio} • {moroso.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                          <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                          {moroso.cuotasVencidas} cuota{moroso.cuotasVencidas > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-red-600">
                        ${moroso.deudaTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{formatearFecha(moroso.fechaVencimientoMasTemprana)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/dashboard/socios/${moroso.idSocio}`}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold border border-blue-200 transition-colors"
                        >
                          Ver Detalle
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
