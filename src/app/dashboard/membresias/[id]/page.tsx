'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { membresiasService, type Membresia } from '@/lib/api/membresias';
import { cuotasService, type CuotaDto } from '@/lib/api/cuotas';
import TablaCuotas from '@/components/cuotas/TablaCuotas';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Activity,
  CreditCard,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function DetalleMembresiaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [membresia, setMembresia] = useState<Membresia | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cuotas, setCuotas] = useState<CuotaDto[]>([]);
  const [loadingCuotas, setLoadingCuotas] = useState(false);

  useEffect(() => {
    if (id) {
      cargarMembresia();
      cargarCuotas();
    }
  }, [id]);

  const cargarMembresia = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await membresiasService.obtenerPorId(parseInt(id));
      setMembresia(data);
    } catch (error: any) {
      console.error('Error al cargar membresía:', error);
      setError(error.response?.data?.message || 'Error al cargar los detalles de la membresía');
    } finally {
      setIsLoading(false);
    }
  };

  const cargarCuotas = async () => {
    try {
      setLoadingCuotas(true);
      const data = await cuotasService.obtenerPorMembresia(parseInt(id));
      setCuotas(data);
    } catch (error) {
      console.error('Error al cargar cuotas:', error);
    } finally {
      setLoadingCuotas(false);
    }
  };

  const handleGenerarCuotas = async () => {
    try {
      setLoadingCuotas(true);
      setError(null);
      await cuotasService.generarCuotas(parseInt(id));
      await Promise.all([cargarMembresia(), cargarCuotas()]);
    } catch (error: any) {
      console.error('Error al generar cuotas:', error);
      setError(error.response?.data?.message || 'Error al generar las cuotas de la membresía');
    } finally {
      setLoadingCuotas(false);
    }
  };

  const formatearFecha = (fechaString: string | undefined | null): string => {
    if (!fechaString) return 'No disponible';
    // Si la fecha no tiene timestamp, agregarle T00:00:00 para evitar problemas de zona horaria
    const fechaParaParsear = fechaString.includes('T') ? fechaString : fechaString + 'T00:00:00';
    const fecha = new Date(fechaParaParsear);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando detalles de la membresía...</p>
        </div>
      </div>
    );
  }

  if (error || !membresia) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error || 'No se encontró la membresía'}</p>
              </div>
            </div>
          </div>
          <Link
            href="/dashboard/membresias"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver a Membresías
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/membresias"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver a Membresías
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Detalle de Membresía</h1>
              <p className="text-gray-600 mt-2">ID de Membresía: #{membresia.id}</p>
            </div>
            <div>
              {membresia.saldo <= 0 ? (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Pagada
                </span>
              ) : (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-700">
                  <XCircle className="w-4 h-4 mr-2" />
                  Pendiente
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Información del Socio */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Información del Socio</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-900">{membresia.nombreSocio}</p>
                <p className="text-sm text-gray-600">Número de Socio: #{membresia.numeroSocio}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Información del Período */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Período de la Membresía</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Fecha de Inicio</p>
                <p className="text-lg font-semibold text-gray-900">{formatearFecha(membresia.fechaInicio)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Fecha de Fin</p>
                <p className="text-lg font-semibold text-gray-900">{formatearFecha(membresia.fechaFin)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Fecha de Creación</p>
                <p className="text-lg font-semibold text-gray-900">{formatearFecha(membresia.fechaCreacion)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actividades */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Actividades Incluidas</h2>
            </div>
          </div>
          <div className="p-6">
            {membresia.actividades.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay actividades asignadas</p>
            ) : (
              <div className="space-y-3">
                {membresia.actividades.map((actividad) => (
                  <div
                    key={actividad.idActividad}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Activity className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{actividad.nombreActividad}</p>
                        <p className="text-xs text-gray-500">ID: {actividad.idActividad}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Precio al momento</p>
                      <p className="text-lg font-bold text-green-600">
                        ${actividad.precioAlMomento.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Información Financiera */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Información Financiera</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <p className="text-sm text-gray-500">Monto Total</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  ${membresia.totalCargado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-green-700">Total Pagado</p>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  ${membresia.totalPagado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className={`p-4 rounded-lg border ${membresia.saldo <= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className={`w-4 h-4 ${membresia.saldo <= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  <p className={`text-sm ${membresia.saldo <= 0 ? 'text-green-700' : 'text-red-700'}`}>Saldo Pendiente</p>
                </div>
                <p className={`text-2xl font-bold ${membresia.saldo <= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  ${membresia.saldo.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Plan de Cuotas */}
        <TablaCuotas
          cuotas={cuotas}
          mostrarBotonGenerar={true}
          onGenerarCuotas={handleGenerarCuotas}
          loading={loadingCuotas}
        />
      </div>
    </div>
  );
}
