'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { pagosService, type ComprobantePago } from '@/lib/api/pagos';
import { ArrowLeft, Printer, Download, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ComprobantePagoPage() {
  const params = useParams();
  const router = useRouter();
  const [comprobante, setComprobante] = useState<ComprobantePago | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarComprobante();
  }, []);

  const cargarComprobante = async () => {
    try {
      setIsLoading(true);
      const id = Number(params.id);
      const data = await pagosService.obtenerComprobante(id);
      setComprobante(data);
    } catch (error: any) {
      console.error('Error al cargar comprobante:', error);
      setError('Error al cargar el comprobante');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !comprobante) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{error || 'No se encontró el comprobante'}</p>
          <Link
            href="/dashboard/pagos"
            className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Pagos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toolbar - No se imprime */}
      <div className="print:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/dashboard/pagos"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Pagos
          </Link>
          <div className="flex gap-2">
            <button
              onClick={handleImprimir}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
          </div>
        </div>
      </div>

      {/* Comprobante */}
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg border-2 border-gray-300 overflow-hidden print:shadow-none print:border-2">
          {/* Header del Comprobante */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">COMPROBANTE DE PAGO</h1>
                <p className="text-blue-100">Sistema de Gestión de Club</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{comprobante.numeroComprobante}</p>
                <p className="text-blue-100 text-sm">
                  {format(new Date(comprobante.fechaEmision), "dd/MM/yyyy HH:mm", { locale: es })}
                </p>
              </div>
            </div>
          </div>

          {/* Contenido del Comprobante */}
          <div className="p-8">
            {/* Estado del Pago */}
            {comprobante.estaPaga && (
              <div className="mb-6 flex items-center justify-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-lg py-3">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">Membresía Completamente Pagada</span>
              </div>
            )}

            {/* Datos del Socio */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-gray-300 pb-2">
                DATOS DEL SOCIO
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Número de Socio</p>
                  <p className="font-semibold text-gray-900">{comprobante.numeroSocio}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nombre Completo</p>
                  <p className="font-semibold text-gray-900">{comprobante.nombreSocio}</p>
                </div>
              </div>
            </div>

            {/* Datos del Pago */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-gray-300 pb-2">
                DATOS DEL PAGO
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Período de Membresía</p>
                  <p className="font-semibold text-gray-900">{comprobante.periodoMembresia}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Método de Pago</p>
                  <p className="font-semibold text-gray-900">{comprobante.metodoPago}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha de Pago</p>
                  <p className="font-semibold text-gray-900">
                    {format(new Date(comprobante.fechaPago), "dd/MM/yyyy", { locale: es })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Procesado Por</p>
                  <p className="font-semibold text-gray-900">{comprobante.usuarioProcesa}</p>
                </div>
              </div>
            </div>

            {/* Detalle de Actividades */}
            {comprobante.actividades.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-gray-300 pb-2">
                  ACTIVIDADES DE LA MEMBRESÍA
                </h2>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Actividad
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                          Precio
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {comprobante.actividades.map((actividad, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900">{actividad.nombre}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            ${actividad.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Resumen del Pago */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">RESUMEN DEL PAGO</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Total de la Membresía:</span>
                  <span className="font-semibold text-gray-900">
                    ${comprobante.totalMembresia.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Total Pagado Anteriormente:</span>
                  <span className="font-semibold text-gray-900">
                    ${comprobante.totalPagadoAntes.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="border-t-2 border-blue-300 pt-3">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-bold text-gray-900">Monto de Este Pago:</span>
                    <span className="font-bold text-green-600 text-2xl">
                      ${comprobante.montoPago.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <div className="border-t-2 border-blue-300 pt-3">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-bold text-gray-900">Saldo Restante:</span>
                    <span
                      className={`font-bold text-xl ${
                        comprobante.nuevoSaldo === 0 ? 'text-green-600' : 'text-orange-600'
                      }`}
                    >
                      ${comprobante.nuevoSaldo.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer del Comprobante */}
            <div className="mt-8 pt-6 border-t-2 border-gray-300 text-center text-sm text-gray-600">
              <p className="mb-2">
                Este comprobante certifica el pago registrado en el sistema de gestión del club.
              </p>
              <p>Para consultas o aclaraciones, contacte con la administración del club.</p>
            </div>
          </div>
        </div>

        {/* Botones adicionales - No se imprimen */}
        <div className="print:hidden mt-6 flex justify-center gap-4">
          <button
            onClick={() => router.push('/dashboard/pagos/nuevo')}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Registrar Otro Pago
          </button>
          <Link
            href="/dashboard/pagos"
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Ver Todos los Pagos
          </Link>
        </div>
      </div>

      {/* Estilos de impresión */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </>
  );
}
