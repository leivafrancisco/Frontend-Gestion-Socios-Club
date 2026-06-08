'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, User, Mail, CreditCard, Calendar, Activity,
  TrendingUp, AlertCircle, CheckCircle2, Loader2,
  ToggleLeft, ToggleRight, DollarSign, Clock,
} from 'lucide-react';
import { sociosService, type ResumenSocio } from '@/lib/api/socios';
import { authService } from '@/lib/api/auth';
import { cuotasService, type CuotaDto } from '@/lib/api/cuotas';
import TablaCuotas from '@/components/cuotas/TablaCuotas';

export default function DetalleSocioPage() {
  const { id } = useParams<{ id: string }>();
  const idSocio = Number(id);

  const [resumen, setResumen] = useState<ResumenSocio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [cuotas, setCuotas] = useState<CuotaDto[]>([]);
  const [loadingCuotas, setLoadingCuotas] = useState(false);

  useEffect(() => {
    cargarResumen();
    cargarCuotas();
  }, [idSocio]);

  const cargarCuotas = async () => {
    try {
      setLoadingCuotas(true);
      const data = await cuotasService.obtenerPorSocio(idSocio);
      setCuotas(data);
    } catch (err) {
      console.error('Error al cargar cuotas:', err);
    } finally {
      setLoadingCuotas(false);
    }
  };

  const cargarResumen = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Invoca GET /socios/{id}/resumen → API llama a sp_ResumenSocio
      const data = await sociosService.obtenerResumen(idSocio);
      setResumen(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar el resumen del socio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCambiarEstado = async () => {
    if (!resumen) return;
    const usuario = authService.getUsuario();
    const nuevoEstado = !resumen.estaActivo;

    const confirmar = window.confirm(
      nuevoEstado
        ? `¿Reactivar a ${resumen.nombreCompleto}?`
        : `¿Dar de baja a ${resumen.nombreCompleto}? Se registrará la fecha de baja.`
    );
    if (!confirmar) return;

    try {
      setIsToggling(true);
      setError(null);
      setSuccessMsg(null);
      // Invoca PUT /socios/{id}/estado → API llama a sp_CambiarEstadoSocio
      const actualizado = await sociosService.cambiarEstado(idSocio, nuevoEstado);
      setResumen((prev) =>
        prev ? { ...prev, estaActivo: actualizado.estaActivo, fechaBaja: actualizado.fechaBaja } : prev
      );
      setSuccessMsg(
        nuevoEstado
          ? `${resumen.nombreCompleto} fue reactivado correctamente.`
          : `${resumen.nombreCompleto} fue dado de baja correctamente.`
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cambiar el estado del socio');
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !resumen) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard/socios" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Volver
        </Link>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!resumen) return null;

  const estaPagado = resumen.saldoPendiente <= 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Encabezado */}
      <div>
        <Link href="/dashboard/socios" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Volver al listado
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{resumen.nombreCompleto}</h1>
            <p className="text-gray-500 mt-1">#{resumen.numeroSocio}</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
            resumen.estaActivo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {resumen.estaActivo ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {successMsg && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{successMsg}</p>
        </div>
      )}

      {/* Datos personales + acción de estado */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" /> Datos del Socio
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="w-4 h-4 text-gray-400" />
            {resumen.email}
          </div>
          {resumen.dni && (
            <div className="flex items-center gap-2 text-gray-600">
              <CreditCard className="w-4 h-4 text-gray-400" />
              DNI: {resumen.dni}
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            Alta: {new Date(resumen.fechaAlta).toLocaleDateString('es-AR')}
          </div>
          {resumen.fechaBaja && (
            <div className="flex items-center gap-2 text-red-600">
              <Calendar className="w-4 h-4 text-red-400" />
              Baja: {new Date(resumen.fechaBaja).toLocaleDateString('es-AR')}
            </div>
          )}
        </div>

        {/* Botón cambiar estado — invoca sp_CambiarEstadoSocio */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Estado del socio</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {resumen.estaActivo
                ? 'El socio puede acceder a todas las funciones del club.'
                : 'El socio está dado de baja y no puede acceder al club.'}
            </p>
          </div>
          <button
            onClick={handleCambiarEstado}
            disabled={isToggling}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              resumen.estaActivo
                ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
            }`}
          >
            {isToggling ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : resumen.estaActivo ? (
              <ToggleRight className="w-4 h-4" />
            ) : (
              <ToggleLeft className="w-4 h-4" />
            )}
            {resumen.estaActivo ? 'Dar de baja' : 'Reactivar'}
          </button>
        </div>
      </div>

      {/* Resumen financiero — resultado de sp_ResumenSocio */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" /> Resumen Financiero
          <span className="ml-auto text-xs text-gray-400 font-normal">sp_ResumenSocio</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Membresías</p>
            <p className="text-3xl font-bold text-blue-700 mt-1">{resumen.totalMembresias}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total cargado</p>
            <p className="text-2xl font-bold text-gray-700 mt-1">
              ${resumen.totalCargado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-xs text-green-600 font-medium uppercase tracking-wide">Total pagado</p>
            <p className="text-2xl font-bold text-green-700 mt-1">
              ${resumen.totalPagado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className={`rounded-lg p-4 text-center ${estaPagado ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className={`text-xs font-medium uppercase tracking-wide ${estaPagado ? 'text-green-600' : 'text-red-600'}`}>
              Saldo pendiente
            </p>
            <p className={`text-2xl font-bold mt-1 ${estaPagado ? 'text-green-700' : 'text-red-700'}`}>
              ${resumen.saldoPendiente.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            Último pago:{' '}
            {resumen.ultimaFechaPago
              ? new Date(resumen.ultimaFechaPago).toLocaleDateString('es-AR')
              : 'Sin pagos registrados'}
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-gray-400" />
            Asistencias este mes:{' '}
            <strong className="text-gray-800">{resumen.asistenciasEsteMes}</strong>
          </div>
        </div>

        {!estaPagado && (
          <div className="mt-4 flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            Este socio tiene saldo pendiente. Podés registrar un pago desde la sección de Pagos.
          </div>
        )}
      </div>

      {/* Historial de Cuotas */}
      <TablaCuotas cuotas={cuotas} loading={loadingCuotas} />

      {/* Acciones rápidas */}
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/dashboard/socios/${idSocio}/editar`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Editar datos
        </Link>
        <Link
          href={`/dashboard/membresias/nueva`}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Nueva membresía
        </Link>
        <Link
          href={`/dashboard/pagos/nuevo`}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Registrar pago
        </Link>
      </div>
    </div>
  );
}
