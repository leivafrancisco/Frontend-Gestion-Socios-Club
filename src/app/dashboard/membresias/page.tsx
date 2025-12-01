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
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MembresiasPage() {
  const [membresias, setMembresias] = useState<Membresia[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    cargarMembresias();
  }, []);

  const cargarMembresias = async () => {
    try {
      setIsLoading(true);
      const data = await membresiasService.obtenerTodas();
      setMembresias(data);
    } catch (error) {
      console.error('Error al cargar membresías:', error);
    } finally {
      setIsLoading(false);
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

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Membresías</p>
            <p className="text-xl font-bold text-gray-900">{membresias.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pagadas</p>
            <p className="text-xl font-bold text-green-600">
              {membresias.filter((m) => m.saldo <= 0).length}
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
              {membresias.filter((m) => m.saldo > 0).length}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Saldo Total</p>
            <p className="text-xl font-bold text-purple-600">
              ${membresias.reduce((sum, m) => sum + m.saldo, 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : membresias.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay membresías registradas</p>
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
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Saldo
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
                {membresias.map((membresia) => (
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <div>
                          <div>{new Date(membresia.fechaInicio).toLocaleDateString('es-AR')}</div>
                          <div className="text-xs text-gray-500">a {new Date(membresia.fechaFin).toLocaleDateString('es-AR')}</div>
                        </div>
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
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span
                        className={`text-sm font-medium ${
                          membresia.saldo > 0 ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        ${membresia.saldo.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {membresia.saldo <= 0 ? (
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
                      <Link
                        href={`/dashboard/membresias/${membresia.id}`}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors group inline-flex"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {membresias.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Mostrando {membresias.length} membresías
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
